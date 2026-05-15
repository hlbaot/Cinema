import { SeatItemDto } from './seat-item.dto';

export class GenerateSeatsResponseDto {
  success: boolean;
  data: {
    message: string;
    total_created: number;
    seats: SeatItemDto[];
  };
}
