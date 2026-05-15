import { ShowtimeSeatStatus } from "../../enums/showtime.enum";

export class ShowtimeSeatItemDto {
  id: string;
  showtime_id: string;
  seat_id: string;
  seat_row: string;
  seat_number: number;
  type: string;
  price: number;
  status: ShowtimeSeatStatus;
}
