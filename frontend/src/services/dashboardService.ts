import api from './api';

const getOverviewMetrics = async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
};

const getRecentOrders = async (limit = 5) => {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
};

const getTopProducts = async (limit = 5) => {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`);
    return response.data;
};

export default {
    getOverviewMetrics,
    getRecentOrders,
    getTopProducts
};
