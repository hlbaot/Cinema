import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe, } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePayOsPaymentLinkDto } from './dto/request/create-payos-payment-link.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { Webhook } from '@payos/node';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** payOS gửi POST; body phải giữ nguyên cấu trúc (không whitelist DTO). */
  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes( new ValidationPipe({whitelist: false, forbidNonWhitelisted: false, transform: false}))
  payOsWebhook(@Body() body: Webhook) {
    return this.paymentService.handlePayOsWebhook(body);
  }

  /** Tạo link thanh toán payOS cho booking PENDING. */
  @Post('payos/create')
  @UseGuards(AuthGuard)
  createPayOsLink(@Body() dto: CreatePayOsPaymentLinkDto, @Req() req: Request & { user?: { id?: string; sub?: string } }) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.paymentService.createPayOsLinkForBooking(userId, dto.booking_id);
  }

  /** Lấy trạng thái thanh toán của booking. */
  @Get('booking/:bookingId/status')
  @UseGuards(AuthGuard)
  getPaymentStatusByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request & { user?: { id?: string; sub?: string } },
  ) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.paymentService.getPaymentStatusByBookingForUser(userId, bookingId);
  }

}
