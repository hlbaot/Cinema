import { ScheduleType, ScreeningFormat, ShowtimeStatus } from "src/showtime/enums/showtime.enum";

export class ShowtimeItemDto {
  id: string;

  movie_id: string;
  movie_title: string;
  movie_poster?: string;
  movie_duration_minutes?: number;

  room_id: string;
  room_name: string;

  show_date: string;

  start_time: string;
  end_time: string;

  format: ScreeningFormat;

  base_price: number;

  status: ShowtimeStatus;

  schedule_type: ScheduleType;

  total_seats: number;
  available_seats: number;
}