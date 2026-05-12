import axios from "axios";
import type { CreateBookingRequest, CreateBookingResponse } from "@/src/interface/booking";
import { API_URL } from "./url";

/**
 * POST tạo booking.
 * Nếu BE đặt route khác (ví dụ chỉ `/api/v1/bookings`), đổi path bên dưới cho khớp.
 */
const CREATE_BOOKING_PATH = `${API_URL}/api/v1/bookings`;

export const API_CreateBooking = async (
  body: CreateBookingRequest,
  accessToken?: string,
): Promise<CreateBookingResponse> => {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await axios.post<CreateBookingResponse>(CREATE_BOOKING_PATH, body, { headers });
  return res.data;
};
