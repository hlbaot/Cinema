import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class LockSeatsDto {
  @IsArray()
  @IsUUID("4", { each: true })
  @IsNotEmpty()
  showtime_seat_ids: string[];
}
