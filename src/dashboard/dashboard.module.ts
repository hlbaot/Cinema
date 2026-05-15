import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Payment } from 'src/payment/entities/payment.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Payment, Ticket])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
