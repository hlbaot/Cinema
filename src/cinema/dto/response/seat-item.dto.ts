import { SeatType } from 'src/cinema/enums/cinema.enum';

export class SeatItemDto {
  id: string;
  room_id: string;
  seat_row: string;
  seat_number: number;
  type: SeatType;
  price_adjustment: number;
  is_active: boolean;
}
