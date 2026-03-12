import axios from 'axios';

const API_URL = 'http://localhost:5206/api/wallet';

export interface WalletTransaction {
    transactionId: number;
    amount: number;
    type: string;
    orderId?: number;
    createdAt: string;
}

export interface Wallet {
    walletId: number;
    userId: number;
    balance: number;
    updatedAt: string;
    transactions: WalletTransaction[];
}

const getWallet = async (): Promise<Wallet> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const requestWithdrawal = async (amount: number): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/withdraw`, amount, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export default {
    getWallet,
    requestWithdrawal
};
