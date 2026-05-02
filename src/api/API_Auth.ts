import axios from "axios";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/src/interface/auth";
import { API_URL } from "./url"

export const API_SignIn = async (values: LoginRequest): Promise<LoginResponse> => {
    const res = await axios.post<LoginResponse>(
        `${API_URL}/api/v1/auth/login`,
        values
    );
    return res.data;
};

export const API_SignUp = async (values: RegisterRequest) => {
    return await axios.post(`${API_URL}/api/v1/auth/register`, values);
};

export const API_RefreshAccessToken = async (refresh_token: string) => {
    const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, { refresh_token });
    return res.data;
};

export const API_forgot_password = async (email: string) => {
    const res = await axios.post(`${API_URL}/api/v1/auth/forgot-password`, { email });
    return res.data;
};

export const API_reset_password = async (reset_password_token: string, password: string) => {
    const res = await axios.put(`${API_URL}/api/v1/auth/reset-password`, { reset_password_token, password });
    return res.data;
};
