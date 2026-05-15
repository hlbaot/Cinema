import axios from "axios";
import { API_URL } from "./url";

export type UserRole = "admin" | "staff" | "user" | string;
export type UserStatus = "active" | "blocked" | "inactive" | string;

export interface CreateStaffRequestDto {
  full_name: string;
  email: string;
  /** Nếu gửi, backend dùng mật khẩu này; nếu bỏ qua, backend thường tự tạo và trả `temporary_password`. */
  password?: string;
  phone?: string;
}

export interface UserItemDto {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  auth_provider: "local" | "google";
  created_at: string;
}

export interface CreateStaffResponseDto {
  success: boolean;
  data: {
    message: string;
    staff: UserItemDto;
    temporary_password?: string;
  };
}

export interface GetStaffsResponseDto {
  success: boolean;
  data: {
    message: string;
    users: UserItemDto[];
    total: number;
    page: number;
    limit: number;
  };
}

const CREATE_STAFF_PATH = "/api/v1/users/staff";
const GET_STAFFS_PATH = "/api/v1/users/staffs";

function createAuthHeaders(accessToken?: string) {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

function mapUserItem(raw: Record<string, unknown>): UserItemDto {
  const role = typeof raw.role === "string" ? raw.role : "staff";
  const status = typeof raw.status === "string" ? raw.status : "active";
  const auth =
    raw.auth_provider === "google" || raw.auth_provider === "local" ? raw.auth_provider : "local";

  return {
    id: String(raw.id ?? raw._id ?? ""),
    email: String(raw.email ?? ""),
    full_name: String(raw.full_name ?? raw.fullName ?? ""),
    phone: typeof raw.phone === "string" ? raw.phone : raw.phone === null ? null : null,
    avatar_url:
      typeof raw.avatar_url === "string"
        ? raw.avatar_url
        : typeof raw.avatarUrl === "string"
          ? raw.avatarUrl
          : null,
    role: role as UserRole,
    status: status as UserStatus,
    auth_provider: auth,
    created_at: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
  };
}

function normalizeCreateStaffBody(payload: CreateStaffRequestDto): Record<string, unknown> {
  const body: Record<string, unknown> = {
    full_name: payload.full_name.trim(),
    email: payload.email.trim(),
  };
  const pw = payload.password?.trim();
  if (pw) body.password = pw;
  const phone = payload.phone?.trim();
  if (phone) body.phone = phone;
  return body;
}

function normalizeCreateStaffResponse(raw: unknown): CreateStaffResponseDto {
  if (!raw || typeof raw !== "object") {
    throw new Error("Phản hồi server không hợp lệ.");
  }
  const root = raw as Record<string, unknown>;
  if (root.success === false) {
    const msg =
      typeof root.message === "string"
        ? root.message
        : root.data && typeof root.data === "object" && typeof (root.data as { message?: string }).message === "string"
          ? (root.data as { message: string }).message
          : "Tạo nhân viên thất bại.";
    throw new Error(msg);
  }

  const inner =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const staffRaw = inner.staff ?? inner.user;
  const message =
    typeof inner.message === "string"
      ? inner.message
      : typeof root.message === "string"
        ? root.message
        : "Tạo nhân viên thành công.";
  const temporary_password =
    typeof inner.temporary_password === "string"
      ? inner.temporary_password
      : typeof inner.tempPassword === "string"
        ? inner.tempPassword
        : typeof inner.temp_password === "string"
          ? inner.temp_password
          : undefined;

  if (!staffRaw || typeof staffRaw !== "object") {
    throw new Error(message || "Phản hồi thiếu thông tin nhân viên.");
  }

  return {
    success: true,
    data: {
      message,
      staff: mapUserItem(staffRaw as Record<string, unknown>),
      ...(temporary_password ? { temporary_password } : {}),
    },
  };
}

function normalizeGetStaffsResponse(raw: unknown, page: number, limit: number): GetStaffsResponseDto {
  if (!raw || typeof raw !== "object") {
    return {
      success: false,
      data: { message: "", users: [], total: 0, page, limit },
    };
  }
  const root = raw as Record<string, unknown>;
  const inner =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;

  const rawUsers = inner.users ?? inner.data;
  const users: UserItemDto[] = Array.isArray(rawUsers)
    ? (rawUsers as unknown[])
        .filter((u): u is Record<string, unknown> => Boolean(u) && typeof u === "object")
        .map((u) => mapUserItem(u))
    : [];

  const total =
    typeof inner.total === "number"
      ? inner.total
      : typeof inner.totalCount === "number"
        ? inner.totalCount
        : users.length;
  const pageOut = typeof inner.page === "number" ? inner.page : page;
  const limitOut = typeof inner.limit === "number" ? inner.limit : limit;
  const message = typeof inner.message === "string" ? inner.message : "";

  return {
    success: root.success !== false,
    data: { message, users, total, page: pageOut, limit: limitOut },
  };
}

export async function API_AdminCreateStaff(
  payload: CreateStaffRequestDto,
  accessToken?: string,
): Promise<CreateStaffResponseDto> {
  const res = await axios.post(
    `${API_URL}${CREATE_STAFF_PATH}`,
    normalizeCreateStaffBody(payload),
    { headers: createAuthHeaders(accessToken) },
  );

  return normalizeCreateStaffResponse(res.data);
}

export async function API_AdminGetStaffs(
  page = 1,
  limit = 20,
  accessToken?: string,
): Promise<GetStaffsResponseDto> {
  const res = await axios.get(`${API_URL}${GET_STAFFS_PATH}`, {
    headers: createAuthHeaders(accessToken),
    params: { page, limit },
  });

  return normalizeGetStaffsResponse(res.data, page, limit);
}
