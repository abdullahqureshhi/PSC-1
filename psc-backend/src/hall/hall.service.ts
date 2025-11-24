import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HallDto } from './dtos/hall.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';

@Injectable()
export class HallService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─────────────────────────── HALLS ───────────────────────────
  async getHalls() {
    return await this.prismaService.hall.findMany({
      include: {
        reservations: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reservedFrom: 'asc',
          },
        },
        bookings: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAvailHalls() {
    return await this.prismaService.hall.findMany({
      where: { isActive: true, isBooked: false },
      orderBy: { createdAt: 'desc' },
    });
  }
  async createHall(payload: HallDto, files: Express.Multer.File[]) {
    const uploadedImages: { url: string; publicId: string }[] = [];

    for (const file of files ?? []) {
      const img = await this.cloudinaryService.uploadFile(file);
      uploadedImages.push({
        url: img.url,
        publicId: img.public_id,
      });
    }

    return await this.prismaService.hall.create({
      data: {
        name: capitalizeWords(payload.name),
        description: payload.description,
        capacity: Number(payload.capacity),
        chargesGuests: Number(payload.chargesGuests),
        chargesMembers: Number(payload.chargesMembers),
        isActive: payload.isActive == 'true' || payload.isActive === true,
        isOutOfService:
          payload.isOutOfService == 'true' || payload.isOutOfService === true,

        outOfServiceReason: payload.outOfServiceReason,
        outOfServiceFrom: payload.isOutOfService ? new Date() : null,
        outOfServiceTo: payload.outOfServiceUntil
          ? new Date(payload.outOfServiceUntil)
          : null,

        images: uploadedImages,
      },
    });
  }

  async updateHall(payload: HallDto, files: Express.Multer.File[] = []) {
    if (!payload.id) {
      throw new HttpException('Hall ID is required', HttpStatus.BAD_REQUEST);
    }

    const hallId = Number(payload.id);

    const hall: any = await this.prismaService.hall.findUnique({
      where: { id: hallId },
      select: { images: true },
    });

    if (!hall) {
      throw new HttpException('Hall not found', HttpStatus.NOT_FOUND);
    }

    // Extract only safe fields
    const keepImagePublicIds = Array.isArray(payload.existingimgs)
      ? payload.existingimgs
      : payload.existingimgs
        ? [payload.existingimgs]
        : [];

    const filteredExistingImages = hall?.images?.filter((img: any) =>
      keepImagePublicIds.includes(img.publicId),
    );

    // Upload new images
    const newUploadedImages: any[] = [];
    for (const file of files) {
      const result: any = await this.cloudinaryService.uploadFile(file);
      newUploadedImages.push({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      });
    }

    const finalImages = [...filteredExistingImages, ...newUploadedImages];

    // Update with CLEAN DATA ONLY
    return this.prismaService.hall.update({
      where: { id: hallId },
      data: {
        name: payload.name?.trim(),
        description: payload.description?.trim(),
        capacity: Number(payload.capacity) || 0,
        chargesMembers: Number(payload.chargesMembers) || 0,
        chargesGuests: Number(payload.chargesGuests) || 0,
        isActive: payload.isActive === true || payload.isActive === 'true',
        isOutOfService:
          payload.isOutOfService === true || payload.isOutOfService === 'true',
        outOfServiceReason:
          payload.isOutOfService === true || payload.isOutOfService === 'true'
            ? payload.outOfServiceReason?.trim() || null
            : null,
        outOfServiceFrom:
          payload.isOutOfService === true || payload.isOutOfService === 'true'
            ? new Date()
            : null,
        outOfServiceTo:
          payload.isOutOfService === true || payload.isOutOfService === 'true'
            ? payload.outOfServiceUntil
              ? new Date(payload.outOfServiceUntil)
              : null
            : null,
        images: finalImages,
      },
    });
  }

  async deleteHall(id: number): Promise<void> {
    const hall = await this.prismaService.hall.findFirst({ where: { id } });

    if (!hall) {
      throw new Error(`Hall with ID ${id} not found`);
    }

    // Delete images
    if (Array.isArray(hall.images)) {
      const deletePromises = hall.images
        .filter((img: { publicId: string }) => img?.publicId)
        .map((img: { publicId: string }) =>
          this.cloudinaryService
            .removeFile(img.publicId)
            .catch((error) =>
              console.error(`Failed to delete image ${img.publicId}:`, error),
            ),
        );

      await Promise.all(deletePromises);
    }

    // Delete hall record
    await this.prismaService.hall.delete({ where: { id } });
  }

  // reserve halls
  async reserveHalls(
    hallIds: number[],
    reserve: boolean,
    adminId: string,
    reserveFrom?: string,
    reserveTo?: string,
  ) {
    // Check if any hall is currently booked
    const bookedHall = await this.prismaService.hall.findFirst({
      where: {
        id: { in: hallIds },
        isBooked: true,
      },
    });

    if (bookedHall) {
      throw new HttpException(
        `Hall "${bookedHall.name}" is currently booked`,
        HttpStatus.CONFLICT,
      );
    }

    // Validate dates if reserving
    if (reserve) {
      if (!reserveFrom || !reserveTo) {
        throw new HttpException(
          'Reservation dates are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dates
      const fromDate = new Date(reserveFrom);
      const toDate = new Date(reserveTo);

      // Get current time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // For date comparison, use date-only values
      const fromDateOnly = new Date(fromDate);
      fromDateOnly.setHours(0, 0, 0, 0);

      const toDateOnly = new Date(toDate);
      toDateOnly.setHours(0, 0, 0, 0);

      if (fromDateOnly >= toDateOnly) {
        throw new HttpException(
          'Reservation end date must be after start date',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDateOnly < today) {
        throw new HttpException(
          'Reservation start date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Use transaction for atomic operations
      return await this.prismaService.$transaction(async (prisma) => {
        // Remove existing reservations for these exact dates FIRST
        await prisma.hallReservation.deleteMany({
          where: {
            hallId: { in: hallIds },
            reservedFrom: fromDate,
            reservedTo: toDate,
          },
        });

        // Now check for conflicts (excluding the ones we just deleted)
        const conflictingBookings = await prisma.hallBooking.findMany({
          where: {
            hallId: { in: hallIds },
            OR: [
              {
                // Booking overlaps with reservation period
                bookingDate: {
                  gte: fromDate,
                  lt: toDate,
                },
              },
            ],
          },
          include: { hall: { select: { name: true } } },
        });

        if (conflictingBookings.length > 0) {
          const conflicts = conflictingBookings.map(
            (conflict) =>
              `Hall "${conflict.hall.name}" booked on ${conflict.bookingDate.toLocaleDateString()}`,
          );
          throw new HttpException(
            `Booking conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for other reservation conflicts (excluding the ones we just deleted)
        const conflictingReservations = await prisma.hallReservation.findMany({
          where: {
            hallId: { in: hallIds },
            OR: [
              {
                // Reservation overlaps with new reservation period
                reservedFrom: { lt: toDate }, // existing reservation starts before new reservation ends
                reservedTo: { gt: fromDate }, // existing reservation ends after new reservation starts
              },
            ],
          },
          include: { hall: { select: { name: true } } },
        });

        if (conflictingReservations.length > 0) {
          const conflicts = conflictingReservations.map(
            (reservation) =>
              `Hall "${reservation.hall.name}" (${reservation.reservedFrom.toLocaleDateString()} - ${reservation.reservedTo.toLocaleDateString()})`,
          );
          throw new HttpException(
            `Reservation conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for out-of-service halls during the reservation period
        const outOfServiceHalls = await prisma.hall.findMany({
          where: {
            id: { in: hallIds },
            OR: [
              {
                // Currently out of service
                isOutOfService: true,
              },
              {
                // Scheduled to be out of service during reservation period
                outOfServiceFrom: { lte: toDate },
                outOfServiceTo: { gte: fromDate },
              },
            ],
          },
          select: { name: true, outOfServiceFrom: true, outOfServiceTo: true },
        });

        if (outOfServiceHalls.length > 0) {
          const conflicts = outOfServiceHalls.map(
            (hall) =>
              `Hall "${hall.name}" is out of service${
                hall.outOfServiceFrom && hall.outOfServiceTo
                  ? ` from ${hall.outOfServiceFrom.toLocaleDateString()} to ${hall.outOfServiceTo.toLocaleDateString()}`
                  : ''
              }`,
          );
          throw new HttpException(
            `Out of service conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Create new reservations
        const reservations = hallIds.map((hallId) => ({
          hallId,
          reservedFrom: fromDate,
          reservedTo: toDate,
          reservedBy: Number(adminId),
        }));

        await prisma.hallReservation.createMany({ data: reservations });

        // Update hall reserved status to true for all reserved halls
        await prisma.hall.updateMany({
          where: { id: { in: hallIds } },
          data: { isReserved: true },
        });

        return {
          message: `${hallIds.length} hall(s) reserved successfully`,
          count: hallIds.length,
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        };
      });
    } else {
      // UNRESERVE LOGIC - only remove reservations for exact dates
      if (reserveFrom && reserveTo) {
        const fromDate = new Date(reserveFrom);
        const toDate = new Date(reserveTo);

        // Only delete reservations that exactly match the provided dates
        const result = await this.prismaService.hallReservation.deleteMany({
          where: {
            hallId: { in: hallIds },
            reservedFrom: fromDate,
            reservedTo: toDate,
          },
        });

        // Check if halls still have other reservations
        const hallsWithRemainingReservations =
          await this.prismaService.hallReservation.findMany({
            where: {
              hallId: { in: hallIds },
            },
            select: { hallId: true },
            distinct: ['hallId'],
          });

        const hallIdsWithReservations = hallsWithRemainingReservations.map(
          (r) => r.hallId,
        );

        // Update hall reserved status - set to false for halls with no remaining reservations
        const hallIdsWithoutReservations = hallIds.filter(
          (id) => !hallIdsWithReservations.includes(id),
        );

        if (hallIdsWithoutReservations.length > 0) {
          await this.prismaService.hall.updateMany({
            where: { id: { in: hallIdsWithoutReservations } },
            data: { isReserved: false },
          });
        }

        return {
          message: `${result.count} reservation(s) removed for the specified dates`,
          count: result.count,
          hallsStillReserved: hallIdsWithReservations.length,
          hallsFreed: hallIdsWithoutReservations.length,
        };
      } else {
        // If no specific dates provided, don't remove any reservations
        return {
          message: `No reservations removed - please specify dates to remove specific reservations`,
          count: 0,
        };
      }
    }
  }
}
