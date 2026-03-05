import api from './api';
import type { Store, PagedResponse } from '../types';

const storeService = {
    getAll: async () => {
        const response = await api.get<Store[]>('/Store/all'); // Assuming there's an 'all' or just use paged
        return response.data;
    },
    getPaged: async (pageNumber: number = 1, pageSize: number = 3) => {
        const response = await api.get<PagedResponse<Store>>(`/Store?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Store>(`/Store/${id}`);
        return response.data;
    },
    search: async (name: string) => {
        const response = await api.get<Store[]>(`/Store/search?name=${name}`);
        return response.data;
    },
    filterByApproval: async (isApproved: boolean) => {
        const response = await api.get<Store[]>(`/Store/filter?isApproved=${isApproved}`);
        return response.data;
    },
    getMyStore: async () => {
        const response = await api.get<Store>('/Store/my-store');
        return response.data;
    }
};

export default storeService;
