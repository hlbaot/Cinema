import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/email.module';
import { Ticket } from './entities/ticket.entity';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Booking]), MailModule, AuthModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TypeOrmModule, TicketService],
})
export class TicketModule {}
