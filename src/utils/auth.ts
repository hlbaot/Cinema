import { Page, User } from '../types';

export interface AuthNotice {
  type: 'success' | 'error';
  message: string;
}

interface OAuthCallbackResult {
  notice: AuthNotice | null;
  redirectPage: Page | null;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  shouldFetchCurrentUser: boolean;
}

interface PendingOAuthState {
  startedAt: number;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

const USER_STORAGE_KEY = 'cinema-fe.current-user';
const ACCESS_TOKEN_STORAGE_KEY = 'cinema-fe.access-token';
const REFRESH_TOKEN_STORAGE_KEY = 'cinema-fe.refresh-token';
const POST_LOGIN_PAGE_KEY = 'cinema-fe.post-login-page';
const GOOGLE_OAUTH_PENDING_KEY = 'cinema-fe.google-oauth.pending';
export const DEFAULT_BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() || 'http://localhost:5050';
const GOOGLE_LOGIN_URL =
  process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL?.trim() ||
  `${DEFAULT_BACKEND_ORIGIN}/api/v1/auth/google/login`;
export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
const PENDING_OAUTH_TTL_MS = 5 * 60 * 1000;
const PAGE_VALUES: Page[] = [
  'home',
  'movies',
  'movie-detail',
  'seat-selection',
  'cinemas',
  'payment',
  'profile',
  'confirmation',
  'auth',
  'staff',
  'admin',
];


function isPage(value: string | null): value is Page {
  return value !== null && PAGE_VALUES.includes(value as Page);
}

function parseJsonValue(value: string | null): unknown {
  if (!value) {
    return null;
  }

  const candidates = [value];

  try {
    candidates.push(decodeBase64Value(value));
  } catch {
    // Ignore non-base64 payloads.
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Keep trying with the next candidate.
    }
  }

  return null;
}

function decodeBase64Value(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return window.atob(padded);
}



function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function pickString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function pickNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function pickId(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function normalizeRole(value: string | null): User['role'] {
  const normalized = value?.toLowerCase();

  if (normalized === 'admin' || normalized === 'staff' || normalized === 'customer') {
    return normalized;
  }

  return 'customer';
}

function normalizeMembershipLevel(value: string | null): User['membershipLevel'] {
  const normalized = value?.toLowerCase();

  switch (normalized) {
    case 'silver':
      return 'Silver';
    case 'gold':
      return 'Gold';
    case 'vip':
      return 'VIP';
    default:
      return 'Standard';
  }
}

function createUserFromRecord(source: Record<string, unknown>): User | null {
  const nestedKeys = ['user', 'profile', 'account', 'result', 'data'];

  for (const key of nestedKeys) {
    const nested = toRecord(source[key]);
    const nestedUser = nested ? createUserFromRecord(nested) : null;

    if (nestedUser) {
      return nestedUser;
    }
  }

  const id = pickId(source, ['id', 'userId']) ?? Date.now();
  const name = pickString(source, ['name', 'fullName', 'full_name', 'displayName', 'given_name']);
  const email = pickString(source, ['email']);

  if (!name && !email) {
    return null;
  }

  return {
    id,
    name: name ?? email ?? 'Người dùng Google',
    email: email ?? '',
    phone: pickString(source, ['phone', 'phoneNumber']) ?? '',
    avatar:
      pickString(source, ['avatar', 'avatar_url', 'picture', 'photo', 'image', 'avatarUrl']) ??
      DEFAULT_AVATAR,
    membershipLevel: normalizeMembershipLevel(
      pickString(source, ['membershipLevel', 'membership', 'memberTier'])
    ),
    points: pickNumber(source, ['points']) ?? 0,
    totalSpent: pickNumber(source, ['totalSpent', 'spent']) ?? 0,
    role: normalizeRole(pickString(source, ['role'])),
  };
}

function getSearchParam(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);

    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getCombinedSearchParams() {
  const params = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  return params;
}

function hasAuthSignals(params: URLSearchParams) {
  const knownKeys = Array.from(params.keys()).map((key) => key.toLowerCase());

  return knownKeys.some((key) =>
    [
      'token',
      'access',
      'refresh',
      'user',
      'profile',
      'provider',
      'status',
      'success',
      'error',
      'message',
      'code',
    ].some((fragment) => key.includes(fragment))
  );
}

function readPendingOAuthState(): PendingOAuthState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(GOOGLE_OAUTH_PENDING_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingOAuthState;

    if (Date.now() - parsed.startedAt > PENDING_OAUTH_TTL_MS) {
      clearPendingGoogleOAuth();
      return null;
    }

    return parsed;
  } catch {
    clearPendingGoogleOAuth();
    return null;
  }
}

function clearPendingGoogleOAuth() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
}





function replaceUrlWithoutAuthParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function getUserFromSearchParams(params: URLSearchParams) {
  const structuredPayload =
    parseJsonValue(getSearchParam(params, ['user', 'profile', 'data', 'account'])) ??
    parseJsonValue(getSearchParam(params, ['payload']));

  const structuredUser = createUserFromRecord(toRecord(structuredPayload) ?? {});

  if (structuredUser) {
    return structuredUser;
  }

  const flatUser = createUserFromRecord(
    Object.fromEntries(params.entries()) as Record<string, unknown>
  );

  return flatUser;
}

function getErrorMessage(params: URLSearchParams) {
  return (
    getSearchParam(params, [
      'message',
      'error_description',
      'errorMessage',
      'authError',
      'error',
    ]) ?? 'Đăng nhập Google thất bại. Vui lòng thử lại.'
  );
}

export function getGoogleLoginUrl() {
  return GOOGLE_LOGIN_URL;
}

export function persistAccessToken(accessToken: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function loadStoredAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return accessToken?.trim() ? accessToken.trim() : null;
}

export function clearStoredAccessToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function persistRefreshToken(refreshToken: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export function loadStoredRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  return refreshToken?.trim() ? refreshToken.trim() : null;
}

export function clearStoredRefreshToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export async function logoutUser() {
  const accessToken = loadStoredAccessToken();

  // Local cleanup should happen regardless of API success
  const cleanup = () => {
    clearStoredAccessToken();
    clearStoredRefreshToken();
    clearStoredUser();
    clearPostLoginPage();
  };

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${DEFAULT_BACKEND_ORIGIN}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    // Always cleanup local storage
    cleanup();

    if (!response.ok) {
      let errorMessage = `Đăng xuất thất bại (${response.status}).`;

      try {
        const result = (await response.json()) as { message?: string };
        if (result.message) {
          errorMessage = result.message;
        }
      } catch {
        // Ignore JSON parsing errors and keep the fallback message.
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: true,
      message: null,
    };
  } catch (error) {
    console.error('Logout Error:', error);
    cleanup();
    return {
      success: false,
      message: 'Không gọi được API đăng xuất của backend.',
    };
  }
}

export function persistUser(user: User) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function loadStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return createUserFromRecord(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function clearStoredUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function savePostLoginPage(page: Page) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(POST_LOGIN_PAGE_KEY, page);
}

export function consumePostLoginPage() {
  if (!isBrowser()) {
    return null;
  }

  const page = window.sessionStorage.getItem(POST_LOGIN_PAGE_KEY);
  window.sessionStorage.removeItem(POST_LOGIN_PAGE_KEY);
  return isPage(page) ? page : null;
}

export function clearPostLoginPage() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(POST_LOGIN_PAGE_KEY);
}

export function finalizeGoogleOAuthAttempt() {
  clearPendingGoogleOAuth();
}

export function markGoogleOAuthPending() {
  if (!isBrowser()) {
    return;
  }

  const pendingState: PendingOAuthState = {
    startedAt: Date.now(),
  };

  window.sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, JSON.stringify(pendingState));
}

export function resolvePostLoginPage(user: User, preferredPage: Page | null) {
  if (preferredPage === 'admin' && user.role === 'admin') {
    return 'admin';
  }

  if (preferredPage === 'staff' && user.role === 'staff') {
    return 'staff';
  }

  if (preferredPage === 'profile') {
    return 'profile';
  }

  // Allow other pages if they are not restricted
  if (preferredPage && !['admin', 'staff', 'auth'].includes(preferredPage)) {
    return preferredPage;
  }

  if (user.role === 'admin') {
    return 'admin';
  }

  if (user.role === 'staff') {
    return 'staff';
  }

  return 'home';
}



export function consumeGoogleOAuthCallback(
  customParams?: URLSearchParams
): OAuthCallbackResult {
  if (!isBrowser()) {
    return {
      notice: null,
      redirectPage: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      shouldFetchCurrentUser: false,
    };
  }

  const params = customParams ?? getCombinedSearchParams();
  const pendingOAuth = readPendingOAuthState();
  const hasPendingOAuth = Boolean(pendingOAuth);
  const hasGoogleReferrer =
    document.referrer.includes('/auth/google/callback') ||
    document.referrer.includes('/auth/google/login') ||
    document.referrer.includes('accounts.google.com') ||
    document.referrer.includes(new URL(DEFAULT_BACKEND_ORIGIN).hostname);
  const shouldHandleCallback = hasAuthSignals(params) || hasPendingOAuth || hasGoogleReferrer;

  if (!shouldHandleCallback) {
    return {
      notice: null,
      redirectPage: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      shouldFetchCurrentUser: false,
    };
  }

  const redirectPage = consumePostLoginPage();

  if (params.size > 0 && !customParams) {
    replaceUrlWithoutAuthParams();
  }

  const status = getSearchParam(params, ['status', 'authStatus', 'oauthStatus', 'login', 'success']);
  const error = getSearchParam(params, ['error', 'authError', 'error_description']);
  const provider = getSearchParam(params, ['provider', 'oauth', 'authProvider']);
  const accessToken = getSearchParam(params, [
    'accessToken',
    'access_token',
    'access-token',
    'token',
  ]);
  const refreshToken = getSearchParam(params, [
    'refreshToken',
    'refresh_token',
    'refresh-token',
    'refresh',
  ]);

  if (
    error ||
    status?.toLowerCase() === 'error' ||
    status?.toLowerCase() === 'failed' ||
    status?.toLowerCase() === 'failure'
  ) {
    clearPendingGoogleOAuth();

    return {
      notice: {
        type: 'error',
        message: getErrorMessage(params),
      },
      redirectPage,
      user: null,
      accessToken: null,
      refreshToken: null,
      shouldFetchCurrentUser: false,
    };
  }

  const user = getUserFromSearchParams(params);
  const isGoogle = provider?.toLowerCase() === 'google' || provider?.toLowerCase() === 'oauth.google';

  if (user || isGoogle) {
    clearPendingGoogleOAuth();

    return {
      notice: {
        type: 'success',
        message: 'Đăng nhập Google thành công.',
      },
      redirectPage,
      user,
      accessToken,
      refreshToken,
      shouldFetchCurrentUser: !user,
    };
  }

  if (hasPendingOAuth) {
    if (!accessToken) {
      clearPendingGoogleOAuth();
    }

    return {
      notice: accessToken
        ? null
        : {
          type: 'error',
          message:
            'Google đã đăng nhập thành công ở backend, nhưng frontend chưa nhận được access token để tiếp tục gọi `/user/me`.',
        },
      redirectPage,
      user: null,
      accessToken,
      refreshToken,
      shouldFetchCurrentUser: Boolean(accessToken),
    };
  }

  return {
    notice: null,
    redirectPage,
    user: null,
    accessToken,
    refreshToken,
    shouldFetchCurrentUser: Boolean(accessToken),
  };
}

export async function fetchCurrentUser(accessToken?: string) {
  const apiBaseUrl = DEFAULT_BACKEND_ORIGIN;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (accessToken) {
      // Ensure Bearer prefix and clean the token of any whitespace/quotes
      const cleanToken = accessToken.replace(/^["']|["']$/g, '').trim();
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/user/me`, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      return {
        user: null,
        errorMessage: `Không thể lấy thông tin người dùng (${response.status}).`,
      };
    }

    const result = (await response.json()) as any;
    const data = result.data;
    const userRoot = data?.user ?? data;
    const profile = data?.customer_profile ?? data;

    if (!userRoot || (!userRoot.id && !userRoot.userId)) {
      return {
        user: null,
        errorMessage: 'Backend không trả về dữ liệu người dùng hợp lệ.',
      };
    }

    const user: User = {
      id: userRoot.id ?? userRoot.userId ?? Date.now(),
      name:
        userRoot.full_name ??
        userRoot.fullName ??
        userRoot.name ??
        userRoot.displayName ??
        userRoot.email ??
        '',
      email: userRoot.email ?? '',
      phone: userRoot.phone ?? userRoot.phoneNumber ?? '',
      avatar:
        userRoot.avatar_url ??
        userRoot.avatarUrl ??
        userRoot.avatar ??
        userRoot.picture ??
        DEFAULT_AVATAR,
      membershipLevel: normalizeMembershipLevel(
        profile?.membership_level ?? profile?.membershipLevel ?? profile?.membership
      ),
      points: profile?.points ?? 0,
      totalSpent: parseFloat(profile?.total_spent ?? profile?.totalSpent ?? profile?.spent ?? '0'),
      role: normalizeRole(userRoot.role),
    };

    return {
      user,
      errorMessage: null,
    };
  } catch (error) {
    console.error('Fetch Current User Error:', error);
    return {
      user: null,
      errorMessage: 'Không gọi được API `/user/me` của backend.',
    };
  }
}

export async function updateUserProfile(updateData: { full_name?: string; phone?: string; avatar_url?: string }) {
  const apiBaseUrl = DEFAULT_BACKEND_ORIGIN;

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/user/me`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || 'Cập nhật thất bại';
      return { success: false, message: errorMsg };
    }

    return { success: true, message: result.message };
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return { success: false, message: error.message || 'Lỗi kết nối tới máy chủ.' };
  }
}

export async function uploadUserAvatar(file: File) {
  const apiBaseUrl = DEFAULT_BACKEND_ORIGIN;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/user/me/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Tải ảnh lên thất bại' };
    }

    return { success: true, avatar_url: result.avatar_url };
  } catch (error: any) {
    console.error('Upload Avatar Error:', error);
    return { success: false, message: error.message || 'Lỗi kết nối tới máy chủ.' };
  }
}

export async function changeUserPassword(data: { current_password: string; new_password: string; confirm_password: string }) {
  const apiBaseUrl = DEFAULT_BACKEND_ORIGIN;

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/user/me/change-password`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Thay đổi mật khẩu thất bại' };
    }

    return { success: true, message: result.message };
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return { success: false, message: error.message || 'Lỗi kết nối tới máy chủ.' };
  }
}
