import api from './api';
import type { Product } from '../types';

const productService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/Product');
        return response.data;
    },
    getCheapest: async (count: number = 3) => {
        const response = await api.get<Product[]>(`/Product/cheapest?count=${count}`);
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Product>(`/Product/${id}`);
        return response.data;
    },
    searchByName: async (name: string) => {
        const response = await api.get<Product[]>(`/Product/search?name=${name}`);
        return response.data;
    },
    getByStoreId: async (storeId: number) => {
        const response = await api.get<Product[]>(`/Product/store/${storeId}`);
        return response.data;
    }
};

export default productService;
