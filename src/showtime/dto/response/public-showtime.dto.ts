import { ShowtimeItemDto } from "./showtime-item.dto";

export class PublishShowtimeResponseDto {
    success: boolean;
  
    data: {
      message: string;
      showtime: ShowtimeItemDto;
    };
  }