import { BookingStatus } from 'src/booking/enums/booking.enum';
import { TicketStatus } from '../../enums/ticket.enum';

export class VerifyTicketResponseDto {
  valid: boolean;
  ticket_id: string | null;
  ticket_code: string | null;
  ticket_status: TicketStatus | null;
  booking_id: string | null;
  booking_code: string | null;
  booking_status: BookingStatus | null;
  customer_name: string | null;
  movie_title: string | null;
  showtime_start: string | null;
  message: string;
}
