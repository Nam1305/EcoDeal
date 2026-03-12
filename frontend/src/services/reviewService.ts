import api from './api';

export interface Review {
    reviewId: number;
    productId: number;
    userId: number;
    userFullName: string;
    orderId: number;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateReviewRequest {
    productId: number;
    orderId: number;
    rating: number;
    comment: string;
}

const reviewService = {
    getReviewsByProduct: async (productId: number): Promise<Review[]> => {
        const response = await api.get<Review[]>(`/Review/product/${productId}`);
        return response.data;
    },

    addReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
        const response = await api.post<Review>('/Review', reviewData);
        return response.data;
    }
};

export default reviewService;
