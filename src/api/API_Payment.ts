import axios from "axios";
import { API_URL } from "./url";

export interface CreatePayosPaymentRequest {
  booking_id: string;
}

export interface CreatePayosPaymentResponse {
  payment_code?: string;
  checkoutUrl?: string;
  payment_id?: string;
  order_code?: number;
  qrCode?: string;
  qr_image_data_url?: string;
  amount?: number;
  currency?: string;
  provider?: string;
  payment_status?: string;
  payos_status?: string;
  description?: string;
  expired_at?: number | null;
  bank_bin?: string;
  account_number?: string;
  account_name?: string;
  movie?: { title?: string; [key: string]: unknown };
  products?: unknown[];
  total_price?: number;
  booking?: {
    booking_code?: string;
    movie?: { title?: string; [key: string]: unknown };
    showtime?: { cinema_name?: string; room_name?: string; [key: string]: unknown };
    seats?: unknown[];
    products?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function normalizeCreatePayosPaymentResponse(raw: unknown): CreatePayosPaymentResponse {
  const root = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const checkoutUrl = data.checkoutUrl ?? data.checkout_url ?? data.paymentUrl ?? data.payment_url;
  const paymentId = data.payment_id ?? data.paymentId ?? data.id;
  const orderCode = data.order_code ?? data.orderCode;
  const paymentCode = data.payment_code ?? data.paymentCode;

  return {
    ...data,
    payment_code: typeof paymentCode === "string" ? paymentCode : undefined,
    checkoutUrl: typeof checkoutUrl === "string" ? checkoutUrl : undefined,
    payment_id: typeof paymentId === "string" ? paymentId : typeof paymentId === "number" ? String(paymentId) : undefined,
    order_code: typeof orderCode === "number" ? orderCode : typeof orderCode === "string" ? Number(orderCode) : undefined,
    qrCode: typeof data.qrCode === "string" ? data.qrCode : typeof data.qr_code === "string" ? data.qr_code : undefined,
    qr_image_data_url: typeof data.qr_image_data_url === "string" ? data.qr_image_data_url : undefined,
    amount: typeof data.amount === "number" ? data.amount : undefined,
    currency: typeof data.currency === "string" ? data.currency : undefined,
    provider: typeof data.provider === "string" ? data.provider : undefined,
    payment_status: typeof data.payment_status === "string" ? data.payment_status : undefined,
    payos_status: typeof data.payos_status === "string" ? data.payos_status : undefined,
    description: typeof data.description === "string" ? data.description : undefined,
    expired_at: typeof data.expired_at === "number" ? data.expired_at : data.expired_at === null ? null : undefined,
    bank_bin: typeof data.bank_bin === "string" ? data.bank_bin : undefined,
    account_number: typeof data.account_number === "string" ? data.account_number : undefined,
    account_name: typeof data.account_name === "string" ? data.account_name : undefined,
    movie: data.movie && typeof data.movie === "object" ? data.movie as CreatePayosPaymentResponse["movie"] : undefined,
    products: Array.isArray(data.products) ? data.products : undefined,
    total_price: typeof data.total_price === "number" ? data.total_price : undefined,
    booking: data.booking && typeof data.booking === "object" ? data.booking as CreatePayosPaymentResponse["booking"] : undefined,
  };
}

export interface BookingPaymentStatusResponse {
  success: boolean;
  is_paid?: boolean;
  status?: string;
  payment_status?: string;
  payos_status?: string;
  data?: {
    message?: string;
    status?: string;
    payment_status?: string;
    payos_status?: string;
    paid?: boolean;
    is_paid?: boolean;
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

  const res = await axios.post(`${API_URL}/api/v1/payments/payos/create`, body, { headers });
  return normalizeCreatePayosPaymentResponse(res.data);
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
