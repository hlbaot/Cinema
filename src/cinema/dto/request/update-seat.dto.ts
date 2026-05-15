import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { SeatType } from '../../enums/cinema.enum';

export class UpdateSeatDto {
  @IsEnum(SeatType)
  @IsOptional()
  type?: SeatType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price_adjustment?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
