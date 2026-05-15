import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import { SendMailDto } from './dto/send-mail.dto';
import type { SendBookingTicketsMailDto } from './dto/send-booking-tickets-mail.dto';
import { ticketEmailTemplate } from './templates/ticket-email.template';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(payload: SendMailDto): Promise<void> {
    const { to, subject, html, text, attachments } = payload;
    if (!html && !text) {
      throw new Error('sendMail requires html or text content');
    }

    await this.mailerService.sendMail({
      to,
      subject,
      html,
      text,
      attachments,
    });
  }

  // Email template đơn giản cho forgot-password
  async sendPasswordResetMail(to: string, resetLink: string): Promise<void> {
    const subject = 'Reset your password';
    const text = `We received a password reset request. If this was you, open: ${resetLink}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password reset</h2>
        <p>We received a password reset request.</p>
        <p>If this was you, click the link below:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `;

    return this.sendMail({ to, subject, html, text });
  }

  async sendRegisterOtpMail(to: string, otpCode: string): Promise<void> {
    const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3000';
    const resendOtpUrl = `${apiBaseUrl}/api/v1/auth/resend-otp`;
    const subject = 'Cinema account verification code';
    const text = `Mã xác thực của bạn là ${otpCode}. Mã này sẽ hết hạn trong 5 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xác thực tài khoản</h2>
        <p>Sử dụng mã bên dưới để kích hoạt tài khoản Cinema của bạn:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otpCode}</p>
        <p>Mã này sẽ hết hạn trong 5 phút.</p>
        <p>Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này.</p>
        <p>Nếu OTP hết hạn, vui lòng yêu cầu mã mới tại: <a href="${resendOtpUrl}">${resendOtpUrl}</a></p>
      </div>
    `;

    return this.sendMail({ to, subject, html, text });
  }

  async sendStaffTemporaryPasswordMail(
    to: string,
    fullName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    const loginUrl = frontendUrl ? `${frontendUrl.replace(/\/$/, '')}/login` : '';
    const subject = 'Thông tin tài khoản nhân viên CinePro';
    const text = [
      `Xin chào ${fullName},`,
      `Tài khoản nhân viên của bạn đã được tạo.`,
      `Email đăng nhập: ${to}`,
      `Mật khẩu tạm: ${temporaryPassword}`,
      loginUrl ? `Đăng nhập tại: ${loginUrl}` : '',
      'Vui lòng đổi mật khẩu sau khi đăng nhập.',
    ].filter(Boolean).join('\n');
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#111827;">
        <h2 style="margin:0 0 12px;">Tài khoản nhân viên CinePro</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Tài khoản nhân viên của bạn đã được tạo.</p>
        <div style="background:#f3f4f6; border-radius:12px; padding:16px; margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Email đăng nhập:</strong> ${to}</p>
          <p style="margin:0;"><strong>Mật khẩu tạm:</strong> <span style="font-size:20px; font-weight:800; letter-spacing:1px;">${temporaryPassword}</span></p>
        </div>
        ${loginUrl ? `<p><a href="${loginUrl}" style="color:#b91c1c; font-weight:700;">Đăng nhập CinePro</a></p>` : ''}
        <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
      </div>
    `;

    return this.sendMail({ to, subject, html, text });
  }

  /** Email vé xem phim: dùng `ticketEmailTemplate` (mỗi vé một khối nếu có nhiều vé). */
  async sendBookingTicketsMail(dto: SendBookingTicketsMailDto): Promise<void> {
    const baseUrl = (
      this.configService.get<string>('PUBLIC_APP_URL') ??
      this.configService.get<string>('API_URL') ??
      'http://localhost:5050'
    ).replace(/\/$/, '');

    const attachments: SendMailDto['attachments'] = [];
    const htmlParts = dto.tickets.map((t, index) => {
      const cid = `ticket-${dto.booking_code}-${index}@cinepro`;
      const qrFilePath = this.toLocalPublicFilePath(t.qr_code_url);
      const qrCodeUrl = qrFilePath
        ? `cid:${cid}`
        : t.qr_code_url
          ? `${baseUrl}${t.qr_code_url}`
          : '';

      if (qrFilePath) {
        attachments.push({
          filename: `ticket-${t.ticket_code}.png`,
          path: qrFilePath,
          cid,
        });
      }

      return ticketEmailTemplate({
        ticketCode: t.ticket_code,
        bookingCode: dto.booking_code,
        movieTitle: dto.movie_title,
        movieDurationMinutes: dto.movie_duration_minutes,
        movieAgeRating: dto.movie_age_rating,
        moviePosterUrl: dto.movie_poster_url,
        cinemaName: dto.cinema_name,
        showDate: dto.show_date,
        startTime: dto.start_time,
        roomName: dto.room_name,
        seats: dto.seats,
        totalPrice: dto.total_price,
        qrCodeUrl,
      });
    });

    const subject = `Vé xem phim — ${dto.booking_code}`;
    const html = `
      <div style="margin:0; padding:0; background:#070707; font-family: Arial, sans-serif;">
        <div style="max-width:520px; margin:0 auto; padding:18px 12px 0; color:#f8fafc;">
          <p style="margin:0 0 6px; color:#f8fafc; font-size:16px;">Xin chào ${dto.customer_name},</p>
          <p style="margin:0 0 16px; color:#9ca3af; font-size:13px;">Mã đặt vé: <strong style="color:#ffffff;">${dto.booking_code}</strong></p>
        </div>
        ${htmlParts.join('<div style="height:16px; background:#070707;"></div>')}
      </div>
    `;
    const text = `Mã đặt vé: ${dto.booking_code}. Mã vé: ${dto.tickets.map((t) => t.ticket_code).join(', ')}`;

    await this.sendMail({ to: dto.to, subject, html, text, attachments });
  }

  private toLocalPublicFilePath(relativeUrl: string | null): string | null {
    if (!relativeUrl?.startsWith('/public/')) return null;

    const filePath = join(process.cwd(), relativeUrl.replace(/^\//, ''));
    return existsSync(filePath) ? filePath : null;
  }
}
