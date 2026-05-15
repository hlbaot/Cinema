import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking]), AuthModule, TicketModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [TypeOrmModule, PaymentService],
})
export class PaymentModule {}
