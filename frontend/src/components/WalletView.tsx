import React, { useEffect, useState } from 'react';
import walletService, { type Wallet } from '../services/walletService';

const WalletView: React.FC = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const data = await walletService.getWallet();
            setWallet(data);
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setMessage('Please enter a valid amount.');
            return;
        }

        try {
            await walletService.requestWithdrawal(amount);
            setMessage('Withdrawal request submitted!');
            setWithdrawAmount('');
            fetchWallet();
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Withdrawal failed.');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading wallet...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="md:col-span-1">
                    <div className="bg-gradient-to-br from-green-600 to-teal-500 rounded-2xl p-8 text-white shadow-xl mb-6">
                        <p className="text-green-100 text-sm font-medium mb-1 uppercase tracking-wider">Current Balance</p>
                        <h2 className="text-4xl font-black mb-4">
                            {wallet?.balance.toLocaleString()} <span className="text-xl font-normal">VND</span>
                        </h2>
                        <p className="text-xs text-green-100 opacity-80">
                            Last updated: {wallet && new Date(wallet.updatedAt).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Withdraw Funds</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Amount to Withdraw</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium">VND</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                            >
                                Request Withdrawal
                            </button>
                            {message && (
                                <p className={`mt-3 text-sm font-medium ${message.includes('success') || message.includes('submitted') ? 'text-green-600' : 'text-red-500'}`}>
                                    {message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">Transaction History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="text-left py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="text-right py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {wallet?.transactions.map((t) => (
                                        <tr key={t.transactionId} className="hover:bg-gray-50 transition">
                                            <td className="py-4 text-sm text-gray-600">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                    t.type === 'Payout' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm font-medium text-gray-700">
                                                {t.orderId ? `#${t.orderId}` : '-'}
                                            </td>
                                            <td className={`py-4 text-right font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} VND
                                            </td>
                                        </tr>
                                    ))}
                                    {(!wallet?.transactions || wallet.transactions.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-400">No transactions yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletView;
