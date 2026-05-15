import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Nội dung quét từ QR (JSON string hoặc mã vé thuần). */
export class VerifyTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  qr_payload: string;
}
