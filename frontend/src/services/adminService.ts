import api from './api';
import type { UserProfileDto } from '../types';

export interface AdminStats {
    totalUsers: number;
    totalStores: number;
    totalOrders: number;
    totalRevenue: number;
    pendingStoreApprovals: number;
}

export interface AdminStore {
    storeId: number;
    storeName: string;
    ownerName: string;
    storeEmail: string;
    storePhone: string;
    isApproved: boolean;
}

const adminService = {
    getStats: async () => {
        const response = await api.get<AdminStats>('/Admin/stats');
        return response.data;
    },
    getPendingStores: async () => {
        const response = await api.get<AdminStore[]>('/Admin/stores/pending');
        return response.data;
    },
    approveStore: async (id: number) => {
        await api.post(`/Admin/stores/${id}/approve`);
    },
    rejectStore: async (id: number) => {
        await api.post(`/Admin/stores/${id}/reject`);
    },
    getAllUsers: async () => {
        const response = await api.get<UserProfileDto[]>('/Admin/users');
        return response.data;
    }
};

export default adminService;
