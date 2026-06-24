import axios from "axios";
import type { CreateBookingRequest, CreateBookingResponse } from "@/src/interface/booking";
import { API_URL } from "./url";

/**
 * POST tạo booking.
 * Nếu BE đặt route khác (ví dụ chỉ `/api/v1/bookings`), đổi path bên dưới cho khớp.
 */
const CREATE_BOOKING_PATH = `${API_URL}/api/v1/bookings`;
const MY_BOOKINGS_PATH = `${API_URL}/api/v1/bookings/me`;

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

export const API_GetMyBookings = async (
  accessToken?: string,
  page = 1,
  limit = 10,
): Promise<unknown> => {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await axios.get(MY_BOOKINGS_PATH, {
    headers,
    params: { page, limit },
  });
  return res.data;
};

export const API_GetBookingDetail = async (
  bookingId: string,
  accessToken?: string,
): Promise<unknown> => {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await axios.get(`${API_URL}/api/v1/bookings/${bookingId}`, { headers });
  return res.data;
};
