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
    }
};
