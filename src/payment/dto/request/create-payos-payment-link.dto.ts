import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePayOsPaymentLinkDto {
  @IsUUID()
  @IsNotEmpty()
  booking_id: string;
}
