import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  showtime_id: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  showtime_seat_ids: string[];

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsEmail()
  @IsNotEmpty()
  customer_email: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
