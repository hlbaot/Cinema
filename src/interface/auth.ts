import { User } from "./user";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    message: string;
    access_token: string;
    refresh_token: string;
    user: User;
  };
}

export interface RegisterRequest {
    full_name: string
    email: string;
    phone: string;
    password: string;
    gender: string;
    birth_date: string;
}

