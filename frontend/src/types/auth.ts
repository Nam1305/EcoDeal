export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    role?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: number;
    fullName: string;
    role: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
