import api from './api';
import type { Category } from '../types';

const categoryService = {
    getAll: async () => {
        const response = await api.get<Category[]>('/Category');
        return response.data;
    }
};

export default categoryService;
