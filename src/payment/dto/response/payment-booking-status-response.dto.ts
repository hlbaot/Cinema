import { BookingStatus } from 'src/booking/enums/booking.enum';
import { PaymentProvider, PaymentStatus } from 'src/payment/enums/payment.enum';
import { TicketItemDto } from 'src/ticket/dto/response/ticket-item.dto';

export class PaymentBookingStatusResponseDto {
  booking_id: string;
  booking_status: BookingStatus;
  payment_id: string | null;
  payment_status: PaymentStatus | null;
  provider: PaymentProvider | null;
  amount: number | null;
  is_paid: boolean;
  paid_at: string | null;
  payment_code: string | null;
  order_code: number | null;
  tickets: TicketItemDto[];
}
