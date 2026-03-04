import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const authService = {
    register: async (data: RegisterRequest) => {
        const response = await api.post('/Auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/Auth/login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                userId: response.data.userId,
                fullName: response.data.fullName,
                role: response.data.role
            }));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};

export default authService;
 // book => 400
 // refresh 
 // 