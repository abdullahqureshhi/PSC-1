import { Controller, Get } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {

    constructor(private readonly bookingService: BookingService){}

    @Get("lock")
    async lockBookings(){
        return await this.bookingService.lock()        
    }

}
