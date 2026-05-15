export type BookingTicketMailLine = {
  ticket_code: string;
  /** Đường dẫn tương đối, ví dụ `/public/tickets/{id}.png` */
  qr_code_url: string | null;
};

export type SendBookingTicketsMailDto = {
  to: string;
  customer_name: string;
  booking_code: string;
  movie_title: string;
  movie_duration_minutes: number | null;
  movie_age_rating: string | null;
  movie_poster_url: string | null;
  cinema_name: string;
  room_name: string;
  /** Ngày chiếu (hiển thị), ví dụ từ showtime.show_date */
  show_date: string;
  /** Giờ chiếu (hiển thị), ví dụ 20:30 */
  start_time: string;
  /** Chuỗi ghế, ví dụ "A1, A2" */
  seats: string;
  total_price: number;
  tickets: BookingTicketMailLine[];
};
