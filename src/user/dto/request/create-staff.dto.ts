import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  phone?: string;

}
