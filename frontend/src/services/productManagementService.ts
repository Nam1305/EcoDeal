import api from './api';

export interface ProductDto {
    productId: number;
    categoryId: number;
    categoryName: string;
    storeId: number;
    storeName: string;
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    expireDate: string;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
}

export interface CreateProductRequest {
    categoryId: number;
    storeId: number;
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    expireDate: string;
    stockQuantity: number;
    imageUrl: string;
}

export interface UpdateProductRequest {
    categoryId: number;
    storeId: number;
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    expireDate: string;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
}

const productManagementService = {
    getStoreProducts: async (storeId: number): Promise<ProductDto[]> => {
        const response = await api.get(`/Product/store/${storeId}`);
        return response.data;
    },

    createProduct: async (data: CreateProductRequest): Promise<ProductDto> => {
        const response = await api.post('/Product', data);
        return response.data;
    },

    updateProduct: async (id: number, data: UpdateProductRequest): Promise<void> => {
        await api.put(`/Product/${id}`, data);
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.delete(`/Product/${id}`);
    }
};

export default productManagementService;
