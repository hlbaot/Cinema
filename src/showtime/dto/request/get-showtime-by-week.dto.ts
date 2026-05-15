import { IsDateString, IsOptional } from 'class-validator';

export class GetShowtimeByWeekDto {
  @IsDateString()
  @IsOptional()
  date?: string;
}
