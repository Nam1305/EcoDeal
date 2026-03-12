import React, { useEffect, useState } from 'react';
import walletService, { type Wallet } from '../services/walletService';
import api from '../services/api';

interface WithdrawalRequest {
    requestId: number;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    status: string;
    adminNote?: string;
    createdAt: string;
    processedAt?: string;
}

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const WalletView: React.FC = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    // Form fields
    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletData, wdData] = await Promise.all([
                walletService.getWallet(),
                api.get('/Withdrawal/my').then(r => r.data)
            ]);
            setWallet(walletData);
            setWithdrawals(wdData);
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            setMessage({ text: 'Vui lòng nhập số tiền hợp lệ.', ok: false });
            return;
        }
        if (!bankName || !accountNumber || !accountHolder) {
            setMessage({ text: 'Vui lòng điền đầy đủ thông tin ngân hàng.', ok: false });
            return;
        }

        setSubmitting(true);
        setMessage(null);
        try {
            await api.post('/Withdrawal', { amount: amt, bankName, accountNumber, accountHolder });
            setMessage({ text: 'Yêu cầu rút tiền đã được gửi! Admin sẽ xử lý trong 1-2 ngày làm việc.', ok: true });
            setAmount('');
            setBankName('');
            setAccountNumber('');
            setAccountHolder('');
            fetchData();
        } catch (error: any) {
            setMessage({ text: error.response?.data?.message || 'Không thể gửi yêu cầu.', ok: false });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading wallet...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">💳 Ví của tôi</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Balance + Withdraw Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-green-600 to-teal-500 rounded-2xl p-7 text-white shadow-xl">
                        <p className="text-green-100 text-sm font-medium mb-1 uppercase tracking-wider">Số dư hiện tại</p>
                        <h2 className="text-4xl font-black mb-2">
                            {wallet?.balance.toLocaleString()} <span className="text-xl font-normal">VND</span>
                        </h2>
                        <p className="text-xs text-green-100 opacity-80">
                            Cập nhật: {wallet && new Date(wallet.updatedAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Withdraw Form */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">🏦 Yêu cầu rút tiền</h3>
                        <p className="text-xs text-gray-500 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            Sau khi gửi yêu cầu, Admin sẽ xem xét và chuyển khoản cho bạn trong <strong>1-2 ngày làm việc</strong>. Tiền sẽ bị trừ khỏi ví khi được duyệt.
                        </p>
                        <form onSubmit={handleWithdraw} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Số tiền muốn rút (VND)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="Ví dụ: 500000"
                                    min={1000}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên ngân hàng</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="Vietcombank, Techcombank..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="0123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={accountHolder}
                                    onChange={e => setAccountHolder(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="NGUYEN VAN A"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-60"
                            >
                                {submitting ? 'Đang gửi...' : '📤 Gửi yêu cầu rút tiền'}
                            </button>
                            {message && (
                                <p className={`text-sm font-medium rounded-lg px-3 py-2 ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right: Transaction History + Withdrawals */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Withdrawal requests */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">📋 Lịch sử yêu cầu rút tiền</h3>
                        {withdrawals.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">Bạn chưa có yêu cầu rút tiền nào.</p>
                        ) : (
                            <div className="space-y-3">
                                {withdrawals.map(w => (
                                    <div key={w.requestId} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800">{w.amount.toLocaleString()} VND</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[w.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {w.status === 'Pending' ? '⏳ Đang chờ' : w.status === 'Approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{w.bankName} • {w.accountHolder} • {w.accountNumber}</p>
                                            {w.adminNote && <p className="text-xs text-gray-400 italic mt-1">Ghi chú: {w.adminNote}</p>}
                                            <p className="text-xs text-gray-400 mt-1">Gửi lúc: {new Date(w.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Wallet Transactions */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">💰 Lịch sử giao dịch ví</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Ngày</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Loại</th>
                                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Đơn hàng</th>
                                        <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {wallet?.transactions.map((t) => (
                                        <tr key={t.transactionId} className="hover:bg-gray-50 transition">
                                            <td className="py-3 text-sm text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                    t.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm font-medium text-gray-700">{t.orderId ? `#${t.orderId}` : '-'}</td>
                                            <td className={`py-3 text-right font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} VND
                                            </td>
                                        </tr>
                                    ))}
                                    {(!wallet?.transactions || wallet.transactions.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Chưa có giao dịch nào.</td>
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
