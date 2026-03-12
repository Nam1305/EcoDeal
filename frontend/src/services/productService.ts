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
    },
    getPagedHotDeals: async (pageNumber: number = 1, pageSize: number = 8) => {
        // Assume API format returns { items: Product[], totalCount: number, pageNumber: number, pageSize: number, totalPages: number }
        const response = await api.get<any>(`/Product/hot-deals/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
    }
};

export default productService;
