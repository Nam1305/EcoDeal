import api from './api';

export const orderService = {
    checkout: async (data: { shippingAddress: string, shippingPhone: string, successUrl: string, cancelUrl: string }) => {
        const response = await api.post('/order/checkout', data);
        return response.data;
    },
    confirmPayment: async (sessionId: string) => {
        const response = await api.post('/order/confirm', { sessionId });
        return response.data;
    },
    getOrders: async () => {
        const response = await api.get('/order');
        return response.data;
    },
    getOrderById: async (id: number) => {
        const response = await api.get(`/order/${id}`);
        return response.data;
    },
    cancelOrder: async (id: number) => {
        const response = await api.patch(`/order/${id}/cancel`);
        return response.data;
    },
    getStoreOrders: async () => {
        const response = await api.get('/storeorder');
        return response.data;
    },
    updateStoreOrderStatus: async (id: number, status: string) => {
        const response = await api.patch(`/storeorder/${id}/status`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },
    markAsReceived: async (id: number) => {
        const response = await api.patch(`/order/${id}/receive`);
        return response.data;
    }
};
