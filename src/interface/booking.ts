/** Body POST — khớp CreateBookingDto (class-validator) phía BE. */
export interface CreateBookingRequest {
  showtime_id: string;
  showtime_seat_ids: string[];
  customer_name: string;
  customer_email: string;
  /** Số VN khi gửi; optional — omit nếu không có. */
  customer_phone?: string;
  notes?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
