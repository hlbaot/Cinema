import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingProduct } from './entities/booking-product.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { BookingStatusLog } from './entities/booking-status-log.entity';
import { Booking } from './entities/booking.entity';

import { Showtime } from 'src/showtime/entities/showtime.entity';
import { ShowtimeSeat } from 'src/showtime/entities/showtime-seat.entity';
import { Room } from 'src/cinema/entities/room.entity';
import { Cinema } from 'src/cinema/entities/cinema.entity';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import { TicketModule } from 'src/ticket/ticket.module';

import { BookingConfirmAccessGuard } from './guards/booking-confirm-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingSeat,
      BookingProduct,
      BookingStatusLog,
      Showtime,
      ShowtimeSeat,
      Room,
      Cinema,
      User,
    ]),
    AuthModule,
    PaymentModule,
    TicketModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingConfirmAccessGuard],
  exports: [TypeOrmModule, BookingService],
})
export class BookingModule {}
