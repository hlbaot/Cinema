import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PayOS, WebhookError, type CreatePaymentLinkRequest, type CreatePaymentLinkResponse, type PaymentLink, type Webhook, type WebhookData } from '@payos/node';
import QRCode from 'qrcode';
import { DataSource, Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { BookingStatus } from 'src/booking/enums/booking.enum';
import { ShowtimeSeat } from 'src/showtime/entities/showtime-seat.entity';
import { ShowtimeSeatStatus } from 'src/showtime/enums/showtime.enum';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketStatus } from 'src/ticket/enums/ticket.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePayOsPaymentLinkResponseDto } from './dto/response/create-payos-payment-link-response.dto';
import { PaymentBookingStatusResponseDto } from './dto/response/payment-booking-status-response.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentProvider, PaymentStatus } from './enums/payment.enum';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class PaymentService {
  private readonly payos: PayOS | null;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
  ) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');
    this.logger.log(`PayOS config: clientId=${clientId ? 'OK' : 'MISSING'}, apiKey=${apiKey ? 'OK' : 'MISSING'}, checksumKey=${checksumKey ? 'OK' : 'MISSING'}`);

    if (clientId && apiKey && checksumKey) {
      this.payos = new PayOS({
        clientId,
        apiKey,
        checksumKey,
        partnerCode: this.configService.get<string>('PAYOS_PARTNER_CODE') ?? undefined,
        baseURL: this.configService.get<string>('PAYOS_BASE_URL') ?? undefined,
      });
    } else {
      this.payos = null;
    }
  }

  /** SDK PayOS; ném lỗi nếu thiếu biến môi trường PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY. */
  getPayosClient(): PayOS {
    if (!this.payos) {
      throw new InternalServerErrorException('PayOS chưa được cấu hình (thiếu PAYOS_CLIENT_ID, PAYOS_API_KEY hoặc PAYOS_CHECKSUM_KEY)');
    }
    return this.payos;
  }

  /** payOS v2: tạo link thanh toán (QR / checkoutUrl). */
  createPayOsPaymentLink(body: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return this.getPayosClient().paymentRequests.create(body);
  }

  /** payOS v2: lấy thông tin link theo paymentLinkId hoặc orderCode. */
  getPayOsPaymentLink(paymentLinkIdOrOrderCode: string | number): Promise<PaymentLink> {
    const pr = this.getPayosClient().paymentRequests;
    return typeof paymentLinkIdOrOrderCode === 'number'
      ? pr.get(paymentLinkIdOrOrderCode)
      : pr.get(paymentLinkIdOrOrderCode);
  }

  /** payOS v2: hủy link theo paymentLinkId hoặc orderCode. */
  cancelPayOsPaymentLink(paymentLinkIdOrOrderCode: string | number, cancellationReason?: string,): Promise<PaymentLink> {
    const pr = this.getPayosClient().paymentRequests;
    return typeof paymentLinkIdOrOrderCode === 'number'
      ? pr.cancel(paymentLinkIdOrOrderCode, cancellationReason)
      : pr.cancel(paymentLinkIdOrOrderCode, cancellationReason);
  }

  /** Xác minh chữ ký webhook từ payOS. */
  verifyPayOsWebhook(webhook: Webhook): Promise<WebhookData> {
    return this.getPayosClient().webhooks.verify(webhook);
  }

  /** Đăng ký / xác nhận URL webhook với payOS. */
  confirmPayOsWebhook(webhookUrl: string) {
    return this.getPayosClient().webhooks.confirm(webhookUrl);
  }

  /**
   * Webhook payOS: verify chữ ký.
   * Thành công: booking PENDING → PAID; payment **PENDING → SUCCESS**; ghế **LOCKED → SOLD**.
   * Thất bại / hủy / timeout (webhook không success): payment FAILED; booking CANCELLED; ghế **LOCKED|RESERVED → AVAILABLE**.
   */
  async handlePayOsWebhook(webhook: Webhook): Promise<{ success: boolean }> {
    this.getPayosClient();
    try {
      await this.verifyPayOsWebhook(webhook);
    } catch (e) {
      if (e instanceof WebhookError) {
        throw new BadRequestException(e.message ?? 'Webhook không hợp lệ');
      }
      throw e;
    }

    const data = webhook.data;
    const paid = webhook.success === true && data?.code === '00';

    const ticketBookingIds = new Set<string>();
    const emailBookingIds = new Set<string>();

    const result = await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: {
          transaction_id: data.paymentLinkId,
          provider: PaymentProvider.PAYOS,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        return { success: true };
      }

      const booking = await manager.findOne(Booking, {
        where: { id: payment.booking_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) {
        return { success: true };
      }

      // Re-fetch relations without lock to avoid outer join restriction
      const bookingWithRelations = await manager.findOne(Booking, {
        where: { id: booking.id },
        relations: { booking_seats: { showtime_seat: true } },
      });

      if (bookingWithRelations) {
        booking.booking_seats = bookingWithRelations.booking_seats;
      }

      payment.booking = booking;

      const expectedAmount = Math.round(Number(payment.amount));
      if (Number(data.amount) !== expectedAmount) {
        this.logger.warn(
          `PayOS webhook amount mismatch payment_id=${payment.id} expected=${expectedAmount} got=${data.amount}`,
        );
        return { success: true };
      }

      const seats = (booking.booking_seats ?? [])
        .map((bs) => bs.showtime_seat)
        .filter((ss): ss is ShowtimeSeat => !!ss);

      if (paid) {
        if (payment.status === PaymentStatus.SUCCESS && booking.status === BookingStatus.PAID) {
          ticketBookingIds.add(booking.id);
          return { success: true };
        }
        if (payment.status !== PaymentStatus.PENDING || booking.status !== BookingStatus.PENDING) {
          return { success: true };
        }

        payment.status = PaymentStatus.SUCCESS;
        payment.paid_at = new Date();
        // 1. Confirm booking: PENDING -> PAID (điều kiện đã kiểm tra ở trên)
        booking.status = BookingStatus.PAID;

        // Ghế: chỉ LOCKED -> SOLD (idempotent: đã SOLD thì bỏ qua)
        const seatsToSell = seats.filter((ss) => ss.status === ShowtimeSeatStatus.LOCKED);
        for (const ss of seatsToSell) {
          ss.status = ShowtimeSeatStatus.SOLD;
          ss.locked_by_user_id = null;
          ss.lock_expires_at = null;
        }
        if (seatsToSell.length) {
          await manager.save(seatsToSell);
        }
        await manager.save(payment);
        await manager.save(booking);
        ticketBookingIds.add(booking.id);
        emailBookingIds.add(booking.id);
        return { success: true };
      }

      if (payment.status !== PaymentStatus.PENDING || booking.status !== BookingStatus.PENDING) {
        return { success: true };
      }

      payment.status = PaymentStatus.FAILED;
      booking.status = BookingStatus.CANCELLED;

      const seatsToRelease: ShowtimeSeat[] = [];
      for (const ss of seats) {
        if (
          ss.status === ShowtimeSeatStatus.LOCKED ||
          ss.status === ShowtimeSeatStatus.RESERVED
        ) {
          ss.status = ShowtimeSeatStatus.AVAILABLE;
          ss.locked_by_user_id = null;
          ss.lock_expires_at = null;
          seatsToRelease.push(ss);
        }
      }
      if (seatsToRelease.length) {
        await manager.save(seatsToRelease);
      }
      await manager.save(payment);
      await manager.save(booking);
      return { success: true };
    });

    for (const bid of ticketBookingIds) {
      try {
        await this.ticketService.ensureTicketsForPaidBooking(bid);
      } catch (e) {
        this.logger.error(`ensureTicketsForPaidBooking failed booking=${bid}`, e);
      }
    }
    for (const bid of emailBookingIds) {
      try {
        await this.ticketService.sendTicketEmailForPaidBooking(bid);
      } catch (e) {
        this.logger.error(`sendTicketEmailForPaidBooking failed booking=${bid}`, e);
      }
    }

    return result;
  }

  /** Trạng thái thanh toán theo booking (chỉ chủ booking). */
  async getPaymentStatusByBookingForUser(
    userId: string | null,
    bookingId: string,
  ): Promise<PaymentBookingStatusResponseDto> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }

    let booking = await this.paymentRepository.manager.findOne(Booking, {
      where: { id: bookingId },
      relations: { payment: true, tickets: true },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }
    if (booking.user_id !== userId) {
      throw new ForbiddenException('Không có quyền xem trạng thái thanh toán');
    }

    if (
      booking.payment?.provider === PaymentProvider.PAYOS &&
      booking.payment.status === PaymentStatus.PENDING &&
      booking.payment.transaction_id
    ) {
      await this.syncPendingPayOsPayment(booking.payment);
      booking = await this.paymentRepository.manager.findOne(Booking, {
        where: { id: bookingId },
        relations: { payment: true, tickets: true },
      });
      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt vé');
      }
    }

    if (booking.status === BookingStatus.PAID && booking.payment?.status === PaymentStatus.SUCCESS) {
      await this.ticketService.ensureTicketsForPaidBooking(booking.id);
      booking = await this.paymentRepository.manager.findOne(Booking, {
        where: { id: bookingId },
        relations: { payment: true, tickets: true },
      });
      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt vé');
      }
    }

    const p = booking.payment;
    const tickets = (booking.tickets ?? [])
      .filter((ticket) => ticket.status !== TicketStatus.CANCELLED)
      .map((ticket) => this.toTicketItemDto(ticket));

    return {
      booking_id: booking.id,
      booking_status: booking.status,
      payment_id: p?.id ?? null,
      payment_status: p?.status ?? null,
      provider: p?.provider ?? null,
      amount: p != null ? Number(p.amount) : null,
      is_paid: booking.status === BookingStatus.PAID && p?.status === PaymentStatus.SUCCESS,
      paid_at: p?.paid_at ? p.paid_at.toISOString() : null,
      payment_code: p?.transaction_id ?? null,
      order_code: p?.transaction_id ? Number(p.transaction_id) || null : null,
      tickets,
    };
  }

  private toTicketItemDto(ticket: Ticket) {
    return {
      id: ticket.id,
      booking_id: ticket.booking_id,
      ticket_code: ticket.ticket_code,
      qr_code_url: ticket.qr_code_url,
      status: ticket.status,
      checked_in_at: ticket.checked_in_at ? ticket.checked_in_at.toISOString() : null,
    };
  }

  private async syncPendingPayOsPayment(payment: Payment): Promise<void> {
    if (!payment.transaction_id) return;

    let paymentLink: PaymentLink;
    try {
      paymentLink = await this.getPayOsPaymentLink(payment.transaction_id);
    } catch (error) {
      this.logger.warn(`Không đồng bộ được trạng thái payOS payment=${payment.id}`);
      return;
    }

    if (paymentLink.status !== 'PAID') {
      return;
    }

    const expectedAmount = Math.round(Number(payment.amount));
    if (Number(paymentLink.amount) !== expectedAmount) {
      this.logger.warn(
        `PayOS status amount mismatch payment_id=${payment.id} expected=${expectedAmount} got=${paymentLink.amount}`,
      );
      return;
    }

    const bookingId = await this.markPaymentPaid(payment.id);
    if (bookingId) {
      await this.ticketService.ensureTicketsForPaidBooking(bookingId);
      await this.ticketService.sendTicketEmailForPaidBooking(bookingId);
    }
  }

  private async markPaymentPaid(paymentId: string): Promise<string | null> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) return null;

      const booking = await manager.findOne(Booking, {
        where: { id: payment.booking_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) return null;

      // Re-fetch relations without lock to avoid outer join restriction
      const bookingWithRelations = await manager.findOne(Booking, {
        where: { id: booking.id },
        relations: {
          booking_seats: { showtime_seat: true },
        },
      });

      if (bookingWithRelations) {
        booking.booking_seats = bookingWithRelations.booking_seats;
      }

      payment.booking = booking;

      if (payment.status === PaymentStatus.SUCCESS && booking.status === BookingStatus.PAID) {
        return null;
      }
      if (payment.status !== PaymentStatus.PENDING || booking.status !== BookingStatus.PENDING) {
        return null;
      }

      payment.status = PaymentStatus.SUCCESS;
      payment.paid_at = new Date();
      booking.status = BookingStatus.PAID;

      const seats = (booking.booking_seats ?? [])
        .map((bs) => bs.showtime_seat)
        .filter((ss): ss is ShowtimeSeat => !!ss);

      const seatsToSell = seats.filter((ss) => ss.status === ShowtimeSeatStatus.LOCKED);
      for (const ss of seatsToSell) {
        ss.status = ShowtimeSeatStatus.SOLD;
        ss.locked_by_user_id = null;
        ss.lock_expires_at = null;
      }
      if (seatsToSell.length) {
        await manager.save(seatsToSell);
      }

      await manager.save(payment);
      await manager.save(booking);
      return booking.id;
    });
  }

  /** Mã đơn hàng payOS (số, duy nhất thực tế theo thời gian + ngẫu nhiên). */
  private generatePayOsOrderCode(): number {
    const suffix = Math.floor(100 + Math.random() * 900);
    const combined = Number(`${Date.now()}${suffix}`);
    if (combined > Number.MAX_SAFE_INTEGER) {
      return Number(String(Date.now()).slice(-11)) * 1000 + suffix;
    }
    return combined;
  }

  /**
   * Tạo mã thanh toán payOS cho booking PENDING: gọi API payOS, lưu payment PENDING,
   * trả thông tin để FE hiển thị QR/mã thanh toán tại chỗ thay vì redirect sang payOS.
   */
  async createPayOsLinkForBooking(userId: string | null, bookingId: string): Promise<CreatePayOsPaymentLinkResponseDto> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }

    const cancelUrl = this.configService.get<string>('PAYOS_CANCEL_URL');
    const returnUrl = this.configService.get<string>('PAYOS_RETURN_URL');
    if (!cancelUrl?.trim() || !returnUrl?.trim()) {
      throw new InternalServerErrorException('Thiếu PAYOS_CANCEL_URL hoặc PAYOS_RETURN_URL trong cấu hình');
    }

    this.getPayosClient();

    const snapshot = await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) throw new NotFoundException('Không tìm thấy đặt vé');
      if (booking.user_id !== userId) throw new ForbiddenException('Không có quyền thanh toán đặt vé này');
      if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Chỉ có thể thanh toán đặt vé đang chờ thanh toán');

      const payment = await manager.findOne(Payment, {
        where: { booking_id: bookingId },
      });

      if (payment?.status === PaymentStatus.SUCCESS) throw new BadRequestException('Đặt vé đã được thanh toán');

      const amount = Math.round(Number(booking.total_price));
      if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Số tiền thanh toán không hợp lệ');

      const oldPayOsLinkId =
        payment?.status === PaymentStatus.PENDING && payment.transaction_id
          ? payment.transaction_id
          : null;

      return {
        booking_code: booking.booking_code,
        amount,
        customer_email: booking.customer_email,
        customer_name: booking.customer_name,
        oldPayOsLinkId,
      };
    });

    if (snapshot.oldPayOsLinkId) {
      try {
        await this.cancelPayOsPaymentLink(snapshot.oldPayOsLinkId, 'Tạo link thanh toán mới');
      } catch {
        /* bỏ qua nếu link đã hết hạn / đã hủy */
      }
    }

    const orderCode = this.generatePayOsOrderCode();
    let payRes: CreatePaymentLinkResponse;
    try {
      payRes = await this.createPayOsPaymentLink({
        orderCode,
        amount: snapshot.amount,
        description: snapshot.booking_code.slice(0, 25),
        cancelUrl,
        returnUrl,
        buyerEmail: snapshot.customer_email,
        buyerName: snapshot.customer_name,
      });
    } catch (err) {
      this.logger.error('PayOS create link error:', JSON.stringify(err, null, 2));
      throw new InternalServerErrorException('Không tạo được link thanh toán payOS');
    }

    let paymentSnapshot: {
      paymentId: string;
      booking: Booking;
    };
    try {
      paymentSnapshot = await this.dataSource.transaction(async (manager) => {
        const booking = await manager.findOne(Booking, {
          where: { id: bookingId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đặt vé');
        if (booking.user_id !== userId) throw new ForbiddenException('Không có quyền thanh toán đặt vé này');
        if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Trạng thái đặt vé đã thay đổi');

        const payment = await manager.findOne(Payment, {
          where: { booking_id: bookingId },
        });

        if (payment?.status === PaymentStatus.SUCCESS) throw new BadRequestException('Đặt vé đã được thanh toán');

        if (payment) {
          payment.provider = PaymentProvider.PAYOS;
          payment.payment_method = 'payos';
          payment.transaction_id = payRes.paymentLinkId;
          payment.amount = snapshot.amount;
          payment.status = PaymentStatus.PENDING;
          payment.paid_at = null;
          const saved = await manager.save(Payment, payment);
          const bookingDetail = await this.findPaymentBookingDetail(manager, bookingId);
          return { paymentId: saved.id, booking: bookingDetail };
        }

        const newPayment = manager.create(Payment, {
          booking_id: bookingId,
          provider: PaymentProvider.PAYOS,
          payment_method: 'payos',
          transaction_id: payRes.paymentLinkId,
          amount: snapshot.amount,
          status: PaymentStatus.PENDING,
          paid_at: null,
        });
        const saved = await manager.save(Payment, newPayment);
        const bookingDetail = await this.findPaymentBookingDetail(manager, bookingId);
        return { paymentId: saved.id, booking: bookingDetail };
      });
    } catch (err) {
      try {
        await this.cancelPayOsPaymentLink(payRes.paymentLinkId, 'Lưu payment thất bại');
      } catch {
        /* ignore */
      }
      throw err;
    }

    return this.toPayOsPaymentResponse(paymentSnapshot.booking, paymentSnapshot.paymentId, payRes);
  }

  private async findPaymentBookingDetail(
    manager: DataSource['manager'],
    bookingId: string,
  ): Promise<Booking> {
    return manager.findOneOrFail(Booking, {
      where: { id: bookingId },
      relations: {
        showtime: { movie: true, cinema: true, room: true },
        booking_seats: { seat: true },
        booking_products: { product: true },
      },
    });
  }

  private async toPayOsPaymentResponse(
    booking: Booking,
    paymentId: string,
    payRes: CreatePaymentLinkResponse,
  ): Promise<CreatePayOsPaymentLinkResponseDto> {
    const st = booking.showtime;
    const movie = st?.movie;
    if (!st || !movie) {
      throw new NotFoundException('Không tìm thấy thông tin suất chiếu');
    }

    const seats = (booking.booking_seats ?? [])
      .filter((bs) => bs.seat)
      .sort((a, b) => {
        const rowCmp = a.seat!.seat_row.localeCompare(b.seat!.seat_row, undefined, { numeric: true });
        if (rowCmp !== 0) return rowCmp;
        return a.seat!.seat_number - b.seat!.seat_number;
      })
      .map((bs) => ({
        seat_id: bs.seat_id,
        seat_row: bs.seat!.seat_row,
        seat_number: bs.seat!.seat_number,
        unit_price: parseFloat(bs.unit_price),
      }));

    const products = (booking.booking_products ?? [])
      .filter((bp) => bp.product)
      .map((bp) => {
        const unitPrice = parseFloat(bp.unit_price);
        return {
          product_id: bp.product_id,
          name: bp.product!.name,
          category: bp.product!.category,
          image_url: bp.product!.image_url,
          quantity: bp.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * bp.quantity,
        };
      });

    const qrImageDataUrl = await QRCode.toDataURL(payRes.qrCode, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return {
      payment_code: payRes.paymentLinkId,
      payment_id: paymentId,
      order_code: payRes.orderCode,
      amount: payRes.amount,
      currency: payRes.currency,
      provider: PaymentProvider.PAYOS,
      payment_status: PaymentStatus.PENDING,
      payos_status: payRes.status,
      checkoutUrl: payRes.checkoutUrl,
      vietqr: payRes.qrCode,
      qr_code: payRes.qrCode,
      qr_image_data_url: qrImageDataUrl,
      bank_bin: payRes.bin,
      account_number: payRes.accountNumber,
      account_name: payRes.accountName,
      description: payRes.description,
      expired_at: payRes.expiredAt ?? null,
      movie: {
        id: movie.id,
        title: movie.title,
        duration_minutes: movie.duration_minutes,
        poster_url: movie.poster_url,
      },
      products,
      total_price: booking.total_price,
      booking: {
        id: booking.id,
        booking_code: booking.booking_code,
        status: booking.status,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        total_price: booking.total_price,
        movie: {
          id: movie.id,
          title: movie.title,
          duration_minutes: movie.duration_minutes,
          poster_url: movie.poster_url,
        },
        showtime: {
          id: st.id,
          show_date: st.show_date,
          start_time: st.start_time instanceof Date ? st.start_time.toISOString() : String(st.start_time),
          end_time: st.end_time instanceof Date ? st.end_time.toISOString() : String(st.end_time),
          format: st.format,
          cinema_id: st.cinema_id,
          cinema_name: st.cinema?.name ?? '',
          room_id: st.room_id,
          room_name: st.room?.name ?? '',
        },
        seats,
        products,
      },
    };
  }

  create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create(
      createPaymentDto as Partial<Payment>,
    );
    return this.paymentRepository.save(payment);
  }

  findAll() {
    return this.paymentRepository.find({
      relations: ['booking'],
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    this.paymentRepository.merge(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
    return { id, deleted: true };
  }
}
