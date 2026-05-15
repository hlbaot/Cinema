import { ShowtimeItemDto } from "./showtime-item.dto";

export class PublishAllShowtimeDraftByDateResponseDto {
    success: boolean;

    data: {
        message: string;
        total_published: number;
        showtimes: ShowtimeItemDto[];
    };
}