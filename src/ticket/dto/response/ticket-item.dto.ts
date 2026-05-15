import { TicketStatus } from '../../enums/ticket.enum';

export class TicketItemDto {
  id: string;
  booking_id: string;
  ticket_code: string;
  qr_code_url: string | null;
  status: TicketStatus;
  checked_in_at: string | null;
}
