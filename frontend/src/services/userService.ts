import api from './api';

export interface UserProfileDto {
    userId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    latitude: number;
    longitude: number;
    role: string;
}

export interface UpdateUserProfileRequest {
    fullName: string;
    phoneNumber: string;
    address: string;
    latitude: number;
    longitude: number;
}

const userService = {
    getProfile: async (): Promise<UserProfileDto> => {
        const response = await api.get('/User/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateUserProfileRequest): Promise<void> => {
        await api.put('/User/profile', data);
    }
};

export default userService;
