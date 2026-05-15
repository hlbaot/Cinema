import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { Request } from 'express';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('verify')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  verify(@Body() dto: VerifyTicketDto) {
    return this.ticketService.verifyQrPayload(dto.qr_payload);
  }

  @Post('send-email/:bookingId')
  @UseGuards(AuthGuard)
  sendEmail(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request & { user?: { id?: string; sub?: string } },
  ) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.ticketService.sendTicketEmailForUser(userId, bookingId);
  }

  @Patch(':id/check-in')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  checkIn(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.checkInTicket(id);
  }

  /** Lấy danh sách vé theo booking (chỉ chủ booking). */
  @Get(':bookingId')
  @UseGuards(AuthGuard)
  findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request & { user?: { id?: string; sub?: string } },
  ) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.ticketService.findByBookingForUser(userId, bookingId);
  }
}
