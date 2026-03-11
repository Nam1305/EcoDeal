import api from './api';

export const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
    addItem: async (productId: number, quantity: number) => {
        const response = await api.post('/cart/items', { productId, quantity });
        return response.data;
    },
    updateItemQuantity: async (cartItemId: number, quantity: number) => {
        const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
        return response.data;
    },
    removeItem: async (cartItemId: number) => {
        const response = await api.delete(`/cart/items/${cartItemId}`);
        return response.data;
    },
    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    }
};
