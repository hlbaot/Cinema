export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    email:string
    role:string
    status:string
    full_name:string
    phone:string
    gender:string
    birth_date:string
    access_token: string;
    refresh_token: string;
}

export interface RegisterRequest {
    full_name: string
    email: string;
    phone: string;
    password: string;
    gender: string;
    birth_date: string;
}

