export interface Category {
    categoryId: number;
    categoryName: string;
}

export interface Product {
    productId: number;
    categoryId: number;
    categoryName: string;
    storeId: number;
    storeName: string;
    productName: string;
    originalPrice: number;
    discountedPrice?: number;
    expireDate?: string;
    stockQuantity: number;
    imageUrl?: string;
    isActive: boolean;
}

export interface Store {
    storeId: number;
    userId: number;
    storeName: string;
    description?: string;
    storeEmail?: string;
    storePhone?: string;
    imageUrl?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    isApproved: boolean;
    ownerName: string;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface UserProfileDto {
    userId: number;
    fullName?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    role?: string;
}
