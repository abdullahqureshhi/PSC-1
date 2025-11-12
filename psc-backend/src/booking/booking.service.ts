import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BookingDto } from './dtos/booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaymentMode,
  PaymentStatus,
  Prisma,
  VoucherStatus,
  VoucherType,
} from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}
  async lock() {
    const bookings = await this.prismaService.roomBooking.findMany({
      where: {
        checkIn: {
          lte: new Date(),
        },
        checkOut: {
          gte: new Date(),
        },
      },
      select: { roomId: true },
    });

    const roomsTobeLocked = bookings.map((b) => b.roomId);
    return await this.prismaService.room.updateMany({
      where: { id: { in: roomsTobeLocked }, isBooked: false },
      data: { isBooked: true },
    });
  }

  // room booking

  async cBookingRoom(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
    } = payload;

    // ── 1. VALIDATE DATES ─────────────────────────────────────
    const checkInDate = new Date(checkIn!);
    const checkOutDate = new Date(checkOut!);
    const now = new Date();

    if (!checkIn || !checkOut || checkInDate >= checkOutDate)
      throw new ConflictException('Check-in must be before check-out');

    // ── 2. VALIDATE ROOM ───────────────────────────────────────
    const room = await this.prismaService.room.findFirst({
      where: { id: Number(entityId) },
      select: {
        id: true,
        isOutOfOrder: true,
        outOfOrderTo: true,
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.isOutOfOrder)
      throw new ConflictException(
        `Room out-of-order until ${room.outOfOrderTo}`,
      );

    // ── 3. CHECK DATE AVAILABILITY ─────────────────────────────
    const overlapping = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: room.id,
        // overlap if any part of the range intersects
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlapping)
      throw new ConflictException('Room is already booked for those dates');

    // ── 4. DETERMINE PAID / OWED AMOUNTS ───────────────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      paid = total;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid > total)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    // ── 5. CREATE BOOKING ──────────────────────────────────────
    const booking = await this.prismaService.roomBooking.create({
      data: {
        Membership_No: membershipNo,
        roomId: room.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice: total,
        paymentStatus: paymentStatus as unknown as PaymentStatus,
        pricingType,
        paidAmount: paid,
        pendingAmount: total - paid,
      },
    });

    // ── 6. MARK ROOM AS BOOKED ONLY IF CHECK-IN STARTS NOW ─────
    if (checkInDate <= now && checkOutDate > now) {
      await this.prismaService.room.update({
        where: { id: room.id },
        data: { isBooked: true },
      });
    }

    // ── 7. UPDATE MEMBER LEDGER ────────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: now,
        drAmount: { increment: paid },
        crAmount: { increment: owed },
        Balance: { increment: paid - owed },
      },
    });

    // ── 8. CREATE PAYMENT VOUCHER (only if cash received) ──────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${room.id} | ${checkInDate.toLocaleDateString()} → ${checkOutDate.toLocaleDateString()}`,
        },
      });
    }

    return booking;
  }

  async uBookingRoom(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
    } = payload;

    // ── 1. FETCH EXISTING BOOKING ─────────────────────────────
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        roomId: true,
        Membership_No: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        paidAmount: true,
        pendingAmount: true,
      },
    });
    if (!booking) throw new UnprocessableEntityException('Booking not found');

    // ── 2. VALIDATE DATES ─────────────────────────────────────
    const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
    const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;
    const now = new Date();

    if (newCheckIn >= newCheckOut)
      throw new ConflictException('Check-in must be before check-out');

    const newRoomId = entityId ? Number(entityId) : booking.roomId;

    // ── 3. VALIDATE ROOM ──────────────────────────────────────
    const room = await this.prismaService.room.findUnique({
      where: { id: newRoomId },
      select: {
        id: true,
        isOutOfOrder: true,
        outOfOrderTo: true,
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.isOutOfOrder)
      throw new ConflictException(
        `Room out-of-order until ${room.outOfOrderTo}`,
      );

    // ── 4. CHECK DATE AVAILABILITY ─────────────────────────────
    const overlapping = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: newRoomId,
        id: { not: booking.id },
        AND: [
          { checkIn: { lt: newCheckOut } },
          { checkOut: { gt: newCheckIn } },
        ],
      },
    });
    if (overlapping)
      throw new ConflictException('Room is already booked for those dates');

    // ── 5. DETERMINE NEW PAID / OWED ───────────────────────────
    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);

    let newPaid = 0;
    let newOwed = newTotal;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      newPaid = newTotal;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      newPaid =
        paidAmount !== undefined
          ? Number(paidAmount)
          : Number(booking.paidAmount);
      if (newPaid > newTotal)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.totalPrice);

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // ── 6. UPDATE BOOKING RECORD ──────────────────────────────
    const updated = await this.prismaService.roomBooking.update({
      where: { id: booking.id },
      data: {
        Membership_No: membershipNo ?? booking.Membership_No,
        roomId: newRoomId,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        totalPrice: newTotal,
        paymentStatus: paymentStatus as unknown as PaymentStatus,
        pricingType,
        paidAmount: newPaid,
        pendingAmount: newTotal - newPaid,
      },
    });

    // ── 7. UPDATE ROOM BOOKING STATE (dynamic by date) ─────────
    const roomUpdates: Promise<any>[] = [];

    // If this booking’s check-in is today or active, mark as booked
    if (newCheckIn <= now && newCheckOut > now) {
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: newRoomId },
          data: { isBooked: true },
        }),
      );
    } else {
      // future or past — keep available
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: newRoomId },
          data: { isBooked: false },
        }),
      );
    }

    // If room changed, release the old one
    if (booking.roomId !== newRoomId) {
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: booking.roomId },
          data: { isBooked: false },
        }),
      );
    }

    await Promise.all(roomUpdates);

    // ── 8. UPDATE MEMBER LEDGER ────────────────────────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: booking.Membership_No },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    // ── 9. OPTIONAL: UPDATE VOUCHER IF CASH PAID ───────────────
    if (paidDiff > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: updated.id,
          membership_no: membershipNo ?? booking.Membership_No,
          amount: paidDiff,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${newRoomId} | Updated booking | ${newCheckIn.toLocaleDateString()} → ${newCheckOut.toLocaleDateString()}`,
        },
      });
    }

    return { ...updated, prevRoomId: booking.roomId };
  }

  async gBookingsRoom() {
    return await this.prismaService.roomBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        room: {
          select: {
            roomNumber: true,
            roomType: {
              select: { type: true, id: true },
            },
          },
        },
      },
    });
  }
  async dBookingRoom(bookingId: number) {
    // delete booking
    const deleted = await this.prismaService.roomBooking.delete({
      where: { id: bookingId },
    });
    if (!deleted) throw HttpStatus.INTERNAL_SERVER_ERROR;
    // find room and activate
    await this.prismaService.room.update({
      where: { id: deleted?.roomId },
      data: {
        isBooked: false,
      },
    });
    return deleted;
  }

  //  hall bookings
  async cBookingHall(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      eventType,
      eventTime,
    } = payload;

    const today = new Date();
    const booking = new Date(bookingDate!);
    if (!bookingDate || booking < today)
      throw new UnprocessableEntityException('Booking date is not valid');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member must be selected');

    const hall = await this.prismaService.hall.findFirst({
      where: { id: Number(entityId) },
    });
    if (!hall) throw new BadRequestException('Hall must be specified');
    if (hall.isBooked)
      throw new ConflictException(`Hall '${hall.name}' is already booked`);

    // ── PAYMENT CALCULATIONS ─────────────────────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === ('PAID' as unknown)) {
      paid = total;
    } else if (paymentStatus === ('HALF_PAID' as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid > total)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    // ── CREATE BOOKING ───────────────────────────────────
    const booked = await this.prismaService.hallBooking.create({
      data: {
        memberId: member.Sno,
        hallId: hall.id,
        bookingDate: booking,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: total - paid,
        eventType: eventType!,
        bookingTime:
          eventTime?.toUpperCase() === 'MORNING'
            ? 'MORNING'
            : eventTime?.toUpperCase() === 'EVENING'
              ? 'EVENING'
              : 'NIGHT',
      },
    });

    // ── MARK HALL AS BOOKED ──────────────────────────────
    const sameDay =
      booking.getFullYear() === today.getFullYear() &&
      booking.getMonth() === today.getMonth() &&
      booking.getDate() === today.getDate();

    if (sameDay) {
      await this.prismaService.hall.update({
        where: { id: hall.id },
        data: { isBooked: true },
      });
    }
    // ── UPDATE MEMBER LEDGER ─────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),
        drAmount: { increment: paid },
        crAmount: { increment: owed },
        Balance: { increment: paid - owed },
      },
    });

    // ── CREATE PAYMENT VOUCHER (IF PAID) ─────────────────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === ('PAID' as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === ('HALF_PAID' as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'HALL',
          booking_id: booked.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as any,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${hall.name} | ${booking.toLocaleDateString()} (${eventType})`,
        },
      });
    }

    return booked;
  }

  async gBookingsHall() {
    return await this.prismaService.hallBooking.findMany({
      orderBy: {
        bookingDate: 'desc',
      },
      include: { hall: { select: { name: true } } },
    });
  }
  async uBookingHall(payload: BookingDto) {
    const {
      id, // booking ID
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      eventType,
      eventTime,
    } = payload;

    if (!id) throw new BadRequestException('Booking ID is required');

    // ── FETCH EXISTING BOOKING ───────────────────────────
    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    const today = new Date();
    const booking = new Date(bookingDate!);
    if (!bookingDate || booking < today)
      throw new UnprocessableEntityException('Booking date is not valid');

    // ── VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member must be selected');

    // ── VALIDATE HALL ───────────────────────────────────
    const hall = await this.prismaService.hall.findFirst({
      where: { id: Number(entityId) },
    });
    if (!hall) throw new BadRequestException('Hall must be specified');

    // If hall changed → unlock old hall and lock new one
    if (existing.hallId !== hall.id) {
      await this.prismaService.hall.update({
        where: { id: existing.hallId },
        data: { isBooked: false },
      });

      if (hall.isBooked)
        throw new ConflictException(`Hall '${hall.name}' is already booked`);

      const sameDay =
        booking.getFullYear() === today.getFullYear() &&
        booking.getMonth() === today.getMonth() &&
        booking.getDate() === today.getDate();

      if (sameDay) {
        await this.prismaService.hall.update({
          where: { id: hall.id },
          data: { isBooked: true },
        });
      }
    }

    // ── PAYMENT CALCULATIONS ─────────────────────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === ('PAID' as unknown)) {
      paid = total;
    } else if (paymentStatus === ('HALF_PAID' as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid > total)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    // ── UPDATE HALL BOOKING ──────────────────────────────
    const updated = await this.prismaService.hallBooking.update({
      where: { id: Number(id) },
      data: {
        hallId: hall.id,
        memberId: member.Sno,
        bookingDate: booking,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: total - paid,
        eventType: eventType!,
        bookingTime:
          eventTime?.toUpperCase() === 'MORNING'
            ? 'MORNING'
            : eventTime?.toUpperCase() === 'EVENING'
              ? 'EVENING'
              : 'NIGHT',
      },
    });

    // ── UPDATE MEMBER LEDGER ─────────────────────────────
    const prevPaid = existing.paidAmount;
    const prevOwed = Number(existing.totalPrice) - Number(prevPaid);

    const paidDiff = paid - Number(prevPaid);
    const owedDiff = owed - prevOwed;

    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        drAmount: { increment: paidDiff },
        crAmount: { increment: owedDiff },
        Balance: { increment: paidDiff - owedDiff },
        lastBookingDate: new Date(),
      },
    });

    // ── UPDATE / CREATE PAYMENT VOUCHER (if any paid) ─────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === ('PAID' as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === ('HALF_PAID' as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      const existingVoucher = await this.prismaService.paymentVoucher.findFirst(
        {
          where: {
            booking_type: 'HALL',
            booking_id: Number(id),
          },
        },
      );

      if (existingVoucher) {
        await this.prismaService.paymentVoucher.update({
          where: { id: existingVoucher.id },
          data: {
            amount: paid,
            payment_mode: paymentMode as any,
            voucher_type: voucherType!,
            remarks: `${hall.name} | ${booking.toLocaleDateString()} (${eventType})`,
          },
        });
      } else {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: updated.id,
            membership_no: membershipNo,
            amount: paid,
            payment_mode: paymentMode as any,
            voucher_type: voucherType!,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `${hall.name} | ${booking.toLocaleDateString()} (${eventType})`,
          },
        });
      }
    }

    return updated;
  }

  async dBookingHall(bookingId) {}

  // lawn booking
  async cBookingLawn(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      guestsCount,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
    } = payload;
    console.log(payload);

    // ── VALIDATE BOOKING DATE ───────────────────────────────
    const today = new Date();
    const booking = new Date(bookingDate!);
    if (!bookingDate || booking < today)
      throw new UnprocessableEntityException('Booking date is not valid');

    // ── VALIDATE MEMBER ─────────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member must be selected');

    // ── VALIDATE LAWN ───────────────────────────────────────
    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
    });
    if (!lawn) throw new BadRequestException('Lawn must be specified');

    // ── CHECK DATE AVAILABILITY ─────────────────────────────
    const conflict = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        bookingDate: new Date(bookingDate),
      },
    });
    if (conflict)
      throw new ConflictException(
        `Lawn '${lawn.description}' is already booked for ${new Date(
          bookingDate,
        ).toLocaleDateString()}`,
      );

    // ── DETERMINE TOTAL, PAID & PENDING AMOUNTS ─────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      paid = total;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid > total)
        throw new ConflictException('Paid amount cannot exceed total');
    }
    // UNPAID → paid = 0, owed = total

    // ── CREATE LAWN BOOKING ─────────────────────────────────
    const booked = await this.prismaService.lawnBooking.create({
      data: {
        memberId: member.Sno,
        lawnId: lawn.id,
        bookingDate: new Date(bookingDate),
        guestsCount: Number(guestsCount) || 0,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: total - paid,
      },
    });

    // ── MARK LAWN AS BOOKED ─────────────────────────────────
    if (new Date(bookingDate) <= new Date()) {
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: { isBooked: true },
      });
    }

    // ── UPDATE MEMBER LEDGER ────────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),

        // debit → money received
        drAmount: { increment: paid },

        // credit → money owed
        crAmount: { increment: owed },

        // balance = dr - cr
        Balance: { increment: paid - owed },
      },
    });

    // ── CREATE PAYMENT VOUCHER (if any cash received) ───────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: booked.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as any,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${lawn.description} | ${new Date(bookingDate).toLocaleDateString()}`,
        },
      });
    }

    return booked;
  }

  async uBookingLawn(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      bookingDate,
      guestsCount,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      pendingAmount,
    } = payload;

    // ── FETCH EXISTING BOOKING ──────────────────────────────
    const booking = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        lawnId: true,
        totalPrice: true,
        paidAmount: true,
        pendingAmount: true,
        memberId: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // ── VALIDATE LAWN ───────────────────────────────────────
    const newLawnId = entityId ? Number(entityId) : booking.lawnId;
    const lawn = await this.prismaService.lawn.findUnique({
      where: { id: newLawnId },
    });
    if (!lawn) throw new NotFoundException('Lawn not found');

    // ── CHECK DATE CONFLICT ─────────────────────────────────
    if (bookingDate) {
      const conflict = await this.prismaService.lawnBooking.findFirst({
        where: {
          lawnId: newLawnId,
          bookingDate: new Date(bookingDate),
          NOT: { id: booking.id },
        },
      });
      if (conflict)
        throw new ConflictException(
          `Lawn '${lawn.description}' is already booked for that date.`,
        );
    }

    // ── CALCULATE UPDATED PAYMENT ────────────────────────────
    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);
    let newPaid = 0;
    let newOwed = newTotal;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      newPaid = newTotal;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      newPaid =
        paidAmount !== undefined
          ? Number(paidAmount)
          : Number(booking.paidAmount);
      if (newPaid > newTotal)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.totalPrice);
    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // ── UPDATE BOOKING RECORD ───────────────────────────────
    const updated = await this.prismaService.lawnBooking.update({
      where: { id: booking.id },
      data: {
        memberId: membershipNo ? Number(membershipNo) : booking.memberId,
        lawnId: newLawnId,
        bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        guestsCount: guestsCount ? Number(guestsCount) : undefined,
        totalPrice: totalPrice ? newTotal : undefined,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paidAmount ? newPaid : undefined,
        pendingAmount: newTotal - newPaid,
      },
    });

    // ── UPDATE LAWN BOOKED STATUS ───────────────────────────
    const lawnUpdates: Promise<any>[] = [];
    if (new Date(bookingDate!) <= new Date()) {
      lawnUpdates.push(
        this.prismaService.lawn.update({
          where: { id: newLawnId },
          data: { isBooked: true },
        }),
      );
    }
    if (booking.lawnId !== newLawnId) {
      lawnUpdates.push(
        this.prismaService.lawn.update({
          where: { id: booking.lawnId },
          data: { isBooked: false },
        }),
      );
    }
    await Promise.all(lawnUpdates);

    // ── UPDATE MEMBER LEDGER (if amounts changed) ────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Sno: booking.memberId },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    return { ...updated, prevLawnId: booking.lawnId };
  }

  async gBookingsLawn() {
    return await this.prismaService.lawnBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: { lawn: { select: { description: true } } },
    });
  }
  async dBookingLawn(bookingId) {}

  // photoshoot booking
  async cBookingPhotoshoot(payload: BookingDto) {}
  async uBookingPhotoshoot(payload: BookingDto) {}
  async gBookingPhotoshoot() {}
  async dBookingPhotoshoot(bookingId) {}
}
