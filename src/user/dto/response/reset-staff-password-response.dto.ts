export class ResetStaffPasswordResponseDto {
  success: boolean;
  data: {
    message: string;
    temporary_password: string;
  };
}
