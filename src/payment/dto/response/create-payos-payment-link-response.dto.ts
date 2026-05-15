import type { PaymentLinkStatus } from '@payos/node';
import { BookingStatus } from 'src/booking/enums/booking.enum';
import { PaymentProvider, PaymentStatus } from 'src/payment/enums/payment.enum';
import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';

export class PayOsPaymentMovieDto {
  id: string;
  title: string;
  duration_minutes: number;
  poster_url: string | null;
}

export class PayOsPaymentShowtimeDto {
  id: string;
  show_date: string;
  start_time: string;
  end_time: string;
  format: ScreeningFormat;
  cinema_id: string;
  cinema_name: string;
  room_id: string;
  room_name: string;
}

export class PayOsPaymentSeatDto {
  seat_id: string;
  seat_row: string;
  seat_number: number;
  unit_price: number;
}

export class PayOsPaymentProductDto {
  product_id: string;
  name: string;
  category: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class PayOsPaymentBookingDto {
  id: string;
  booking_code: string;
  status: BookingStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_price: number;
  movie: PayOsPaymentMovieDto;
  showtime: PayOsPaymentShowtimeDto;
  seats: PayOsPaymentSeatDto[];
  products: PayOsPaymentProductDto[];
}

export class CreatePayOsPaymentLinkResponseDto {
  payment_code: string;
  payment_id: string;
  order_code: number;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  payment_status: PaymentStatus;
  payos_status: PaymentLinkStatus;
  checkoutUrl: string;
  vietqr: string;
  qr_code: string;
  qr_image_data_url: string;
  bank_bin: string;
  account_number: string;
  account_name: string;
  description: string;
  expired_at: number | null;
  movie: PayOsPaymentMovieDto;
  products: PayOsPaymentProductDto[];
  total_price: number;
  booking: PayOsPaymentBookingDto;
}
