import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedularService {
  private readonly logger = new Logger(SchedularService.name);

  constructor(private prismaService: PrismaService) {}

  @Cron('0 0 * * * *')
  async updateRoomActivity() {
    const updated = await this.prismaService.room.updateMany({
      where: {
        isOutOfOrder: true,
        outOfOrderTo: { lt: new Date() },
      },
      data: {
        isOutOfOrder: false,
        isActive: true,
        outOfOrderFrom: null,
        outOfOrderTo: null,
        outOfOrderReason: '',
      },
    });
    this.logger.log(`Reactivated ${updated.count} rooms.`);
  }

  @Cron('0 0 * * * *')
  async lock() {
    const now = new Date();

    // ─── ROOM LOCKING / UNLOCKING ────────────────────────────────
    const activeRoomBookings = await this.prismaService.roomBooking.findMany({
      where: {
        checkIn: { lte: now },
        checkOut: { gte: now },
      },
      select: { roomId: true },
    });

    const expiredRoomBookings = await this.prismaService.roomBooking.findMany({
      where: {
        checkOut: { lt: now },
      },
      select: { roomId: true },
    });

    const roomsToBeLocked = activeRoomBookings.map((b) => b.roomId);
    const roomsToBeUnlocked = expiredRoomBookings.map((b) => b.roomId);

    await this.prismaService.room.updateMany({
      where: { id: { in: roomsToBeLocked }, isBooked: false },
      data: { isBooked: true },
    });

    await this.prismaService.room.updateMany({
      where: { id: { in: roomsToBeUnlocked }, isBooked: true },
      data: { isBooked: false },
    });

    // ─── HALL LOCKING / UNLOCKING ────────────────────────────────
    const activeHallBookings = await this.prismaService.hallBooking.findMany({
      where: {
        bookingDate: { gte: now },
      },
      select: { hallId: true },
    });

    const expiredHallBookings = await this.prismaService.hallBooking.findMany({
      where: {
        bookingDate: { lt: now },
      },
      select: { hallId: true },
    });

    const hallsToBeLocked = activeHallBookings.map((b) => b.hallId);
    const hallsToBeUnlocked = expiredHallBookings.map((b) => b.hallId);

    await this.prismaService.hall.updateMany({
      where: { id: { in: hallsToBeLocked }, isBooked: false },
      data: { isBooked: true },
    });

    await this.prismaService.hall.updateMany({
      where: { id: { in: hallsToBeUnlocked }, isBooked: true },
      data: { isBooked: false },
    });

    return {
      lockedRooms: roomsToBeLocked.length,
      unlockedRooms: roomsToBeUnlocked.length,
      lockedHalls: hallsToBeLocked.length,
      unlockedHalls: hallsToBeUnlocked.length,
    };
  }
}
