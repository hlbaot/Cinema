import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { BookingStatus } from 'src/booking/enums/booking.enum';
import { PaymentStatus } from 'src/payment/enums/payment.enum';
import { EmailService } from 'src/mail/email.service';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './enums/ticket.enum';
import { TicketItemDto } from './dto/response/ticket-item.dto';
import { VerifyTicketResponseDto } from './dto/response/verify-ticket-response.dto';

type QrPayloadV1 = { v: 1; ticketCode: string; bookingId: string };

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly emailService: EmailService,
  ) {}

  private getPublicTicketsDir(): string {
    return join(process.cwd(), 'public', 'tickets');
  }

  private buildQrPayload(ticketCode: string, bookingId: string): string {
    const payload: QrPayloadV1 = { v: 1, ticketCode, bookingId };
    return JSON.stringify(payload);
  }

  private parseQrPayload(raw: string): { ticketCode: string; bookingId?: string } {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new BadRequestException('QR không hợp lệ');
    }
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed) as Partial<QrPayloadV1>;
        if (obj?.v === 1 && typeof obj.ticketCode === 'string' && obj.ticketCode.length > 0) {
          return { ticketCode: obj.ticketCode, bookingId: obj.bookingId };
        }
      } catch {
        /* fall through */
      }
    }
    return { ticketCode: trimmed };
  }

  private generateTicketCode(): string {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `TKT${Date.now()}${suffix}`;
  }

  private toItemDto(t: Ticket): TicketItemDto {
    return {
      id: t.id,
      booking_id: t.booking_id,
      ticket_code: t.ticket_code,
      qr_code_url: t.qr_code_url,
      status: t.status,
      checked_in_at: t.checked_in_at ? t.checked_in_at.toISOString() : null,
    };
  }

  /**
   * Sau booking PAID + payment SUCCESS: tạo 1 vé / booking (idempotent), sinh QR PNG dưới /public/tickets.
   */
  async ensureTicketsForPaidBooking(bookingId: string): Promise<Ticket[]> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: {
        payment: true,
        tickets: true,
        showtime: { movie: true },
      },
    });

    if (!booking) {
      this.logger.warn(`ensureTicketsForPaidBooking: booking ${bookingId} not found`);
      return [];
    }

    if (booking.status !== BookingStatus.PAID) {
      return [];
    }
    if (!booking.payment || booking.payment.status !== PaymentStatus.SUCCESS) {
      return [];
    }

    const existing = (booking.tickets ?? []).filter((t) => t.status !== TicketStatus.CANCELLED);
    if (existing.length > 0) {
      const needQr = existing.find((t) => !t.qr_code_url);
      if (needQr) {
        await this.writeQrFile(needQr);
        await this.ticketRepository.save(needQr);
      }
      return existing;
    }

    const ticketCode = this.generateTicketCode();
    const ticket = this.ticketRepository.create({
      booking_id: booking.id,
      ticket_code: ticketCode,
      qr_code_url: null,
      status: TicketStatus.VALID,
      checked_in_at: null,
    });
    const saved = await this.ticketRepository.save(ticket);
    await this.writeQrFile(saved);
    await this.ticketRepository.save(saved);

    return [saved];
  }

  private async writeQrFile(ticket: Ticket): Promise<void> {
    const dir = this.getPublicTicketsDir();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const fileName = `${ticket.id}.png`;
    const absolutePath = join(dir, fileName);
    const payload = this.buildQrPayload(ticket.ticket_code, ticket.booking_id);
    await QRCode.toFile(absolutePath, payload, { type: 'png', width: 320, margin: 2 });
    ticket.qr_code_url = `/public/tickets/${fileName}`;
  }

  async findByBookingForUser(userId: string | null, bookingId: string): Promise<TicketItemDto[]> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: { tickets: true },
    });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }
    if (booking.user_id !== userId) {
      throw new ForbiddenException('Không có quyền xem vé');
    }
    const tickets = (booking.tickets ?? []).filter((t) => t.status !== TicketStatus.CANCELLED);
    return tickets.map((t) => this.toItemDto(t));
  }

  async sendTicketEmailForUser(userId: string | null, bookingId: string): Promise<{ sent: boolean }> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: {
        tickets: true,
        showtime: { movie: true, cinema: true, room: true },
        payment: true,
      },
    });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }
    if (booking.user_id !== userId) {
      throw new ForbiddenException('Không có quyền gửi email vé');
    }
    if (booking.status !== BookingStatus.PAID) {
      throw new BadRequestException('Chỉ gửi vé khi đặt vé đã thanh toán');
    }

    await this.sendTicketEmailForPaidBooking(bookingId);
    return { sent: true };
  }

  async sendTicketEmailForPaidBooking(bookingId: string): Promise<{ sent: boolean }> {
    await this.ensureTicketsForPaidBooking(bookingId);

    const reloaded = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: {
        tickets: true,
        showtime: { movie: true, cinema: true, room: true },
        booking_seats: { seat: true },
      },
    });
    if (!reloaded) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }

    const tickets = (reloaded.tickets ?? []).filter((t) => t.status === TicketStatus.VALID);
    if (tickets.length === 0) {
      throw new BadRequestException('Chưa có vé hợp lệ để gửi');
    }

    const showDate = reloaded.showtime?.show_date ?? '';
    const st = reloaded.showtime?.start_time;
    const startTimeDisplay =
      st instanceof Date
        ? st.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
        : String(st ?? '');

    const seatsLabel = (reloaded.booking_seats ?? [])
      .filter((bs) => bs.seat)
      .sort((a, b) => {
        const rowCmp = a.seat!.seat_row.localeCompare(b.seat!.seat_row, undefined, { numeric: true });
        if (rowCmp !== 0) return rowCmp;
        return a.seat!.seat_number - b.seat!.seat_number;
      })
      .map((bs) => `${bs.seat!.seat_row}${bs.seat!.seat_number}`)
      .join(', ');

    await this.emailService.sendBookingTicketsMail({
      to: reloaded.customer_email,
      customer_name: reloaded.customer_name,
      booking_code: reloaded.booking_code,
      movie_title: reloaded.showtime?.movie?.title ?? 'Phim',
      movie_duration_minutes: reloaded.showtime?.movie?.duration_minutes ?? null,
      movie_age_rating: reloaded.showtime?.movie?.age_rating ?? null,
      movie_poster_url: reloaded.showtime?.movie?.poster_url ?? null,
      cinema_name: reloaded.showtime?.cinema?.name ?? '',
      room_name: reloaded.showtime?.room?.name ?? '',
      show_date: showDate,
      start_time: startTimeDisplay,
      seats: seatsLabel,
      total_price: Number(reloaded.total_price),
      tickets: tickets.map((t) => ({
        ticket_code: t.ticket_code,
        qr_code_url: t.qr_code_url,
      })),
    });

    return { sent: true };
  }

  async verifyQrPayload(qrPayload: string): Promise<VerifyTicketResponseDto> {
    const parsed = this.parseQrPayload(qrPayload);
    const ticket = await this.ticketRepository.findOne({
      where: { ticket_code: parsed.ticketCode },
      relations: {
        booking: { showtime: { movie: true } },
      },
    });

    if (!ticket || !ticket.booking) {
      return {
        valid: false,
        ticket_id: null,
        ticket_code: parsed.ticketCode,
        ticket_status: null,
        booking_id: null,
        booking_code: null,
        booking_status: null,
        customer_name: null,
        movie_title: null,
        showtime_start: null,
        message: 'Không tìm thấy vé',
      };
    }

    if (parsed.bookingId && parsed.bookingId !== ticket.booking_id) {
      return {
        valid: false,
        ticket_id: ticket.id,
        ticket_code: ticket.ticket_code,
        ticket_status: ticket.status,
        booking_id: ticket.booking_id,
        booking_code: ticket.booking.booking_code,
        booking_status: ticket.booking.status,
        customer_name: ticket.booking.customer_name,
        movie_title: ticket.booking.showtime?.movie?.title ?? null,
        showtime_start:
          ticket.booking.showtime?.start_time instanceof Date
            ? ticket.booking.showtime.start_time.toISOString()
            : String(ticket.booking.showtime?.start_time ?? ''),
        message: 'Dữ liệu QR không khớp',
      };
    }

    const st = ticket.booking.showtime;
    const start =
      st?.start_time instanceof Date ? st.start_time.toISOString() : String(st?.start_time ?? '');

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        ticket_id: ticket.id,
        ticket_code: ticket.ticket_code,
        ticket_status: ticket.status,
        booking_id: ticket.booking_id,
        booking_code: ticket.booking.booking_code,
        booking_status: ticket.booking.status,
        customer_name: ticket.booking.customer_name,
        movie_title: st?.movie?.title ?? null,
        showtime_start: start,
        message: 'Vé đã hủy',
      };
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        ticket_id: ticket.id,
        ticket_code: ticket.ticket_code,
        ticket_status: ticket.status,
        booking_id: ticket.booking_id,
        booking_code: ticket.booking.booking_code,
        booking_status: ticket.booking.status,
        customer_name: ticket.booking.customer_name,
        movie_title: st?.movie?.title ?? null,
        showtime_start: start,
        message: 'Vé đã được check-in',
      };
    }

    if (ticket.booking.status !== BookingStatus.PAID) {
      return {
        valid: false,
        ticket_id: ticket.id,
        ticket_code: ticket.ticket_code,
        ticket_status: ticket.status,
        booking_id: ticket.booking_id,
        booking_code: ticket.booking.booking_code,
        booking_status: ticket.booking.status,
        customer_name: ticket.booking.customer_name,
        movie_title: st?.movie?.title ?? null,
        showtime_start: start,
        message: 'Đặt vé chưa hợp lệ',
      };
    }

    return {
      valid: true,
      ticket_id: ticket.id,
      ticket_code: ticket.ticket_code,
      ticket_status: ticket.status,
      booking_id: ticket.booking_id,
      booking_code: ticket.booking.booking_code,
      booking_status: ticket.booking.status,
      customer_name: ticket.booking.customer_name,
      movie_title: st?.movie?.title ?? null,
      showtime_start: start,
      message: 'Vé hợp lệ',
    };
  }

  async checkInTicket(ticketId: string): Promise<TicketItemDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: { booking: true },
    });
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }
    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Vé đã hủy');
    }
    if (ticket.status === TicketStatus.USED) {
      return this.toItemDto(ticket);
    }
    if (ticket.booking.status !== BookingStatus.PAID) {
      throw new BadRequestException('Đặt vé chưa thanh toán / không hợp lệ');
    }

    ticket.status = TicketStatus.USED;
    ticket.checked_in_at = new Date();
    await this.ticketRepository.save(ticket);
    return this.toItemDto(ticket);
  }

  /** Đánh dấu vé hủy khi booking bị hủy. */
  async cancelTicketsForBooking(bookingId: string): Promise<void> {
    await this.ticketRepository.update(
      { booking_id: bookingId, status: TicketStatus.VALID },
      { status: TicketStatus.CANCELLED },
    );
  }
}
