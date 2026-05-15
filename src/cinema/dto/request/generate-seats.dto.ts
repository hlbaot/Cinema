import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class GenerateSeatsDto {
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  @IsNumber()
  @Min(1)
  rows: number;

  @IsNumber()
  @Min(1)
  seats_per_row: number;
}
