import axios from "axios";
import { API_URL } from "./url";

export interface CreatePayosPaymentRequest {
  booking_id: string;
}

export interface CreatePayosPaymentResponse {
  checkoutUrl: string;
  payment_id: string;
  order_code: number;
}

export interface BookingPaymentStatusResponse {
  success: boolean;
  data?: {
    message?: string;
    status?: string;
    paid?: boolean;
    booking_id?: string;
    [key: string]: unknown;
  };
  message?: string;
}

export const API_CreatePayosPayment = async (
  body: CreatePayosPaymentRequest,
  accessToken?: string,
): Promise<CreatePayosPaymentResponse> => {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await axios.post<CreatePayosPaymentResponse>(`${API_URL}/api/v1/payments/payos/create`, body, { headers });
  return res.data;
};

export const API_GetBookingPaymentStatus = async (
  bookingId: string,
  accessToken?: string,
): Promise<BookingPaymentStatusResponse> => {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await axios.get<BookingPaymentStatusResponse>(`${API_URL}/api/v1/payments/booking/${bookingId}/status`, { headers });
  return res.data;
};

