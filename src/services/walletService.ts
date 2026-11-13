import { api } from './api';

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  category: 'RECHARGE' | 'ENTRY_FEE' | 'PRIZE_WINNING' | 'WITHDRAWAL' | 'BONUS';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  transactions: WalletTransaction[];
}

/**
 * Wallet & Financial Transactions Service
 * Manages user balance, recharge (Razorpay/UPI simulated), and prize withdrawals.
 */
export const walletService = {
  /**
   * Fetch live wallet balance
   */
  async getBalance(): Promise<number> {
    const res = await api.get('/wallet/balance');
    return res.data?.balance ?? 0;
  },

  /**
   * Fetch recent transaction ledger
   */
  async getTransactions(): Promise<WalletTransaction[]> {
    const res = await api.get('/wallet/transactions');
    return res.data || [];
  },

  /**
   * Fetch both balance and transaction history in parallel
   */
  async getWalletSummary(): Promise<WalletSummary> {
    const [balanceRes, txRes] = await Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/transactions'),
    ]);
    return {
      balance: balanceRes.data?.balance ?? 0,
      transactions: txRes.data || [],
    };
  },

  /**
   * Add money to wallet balance
   */
  async recharge(amount: number): Promise<{ success: boolean; newBalance: number }> {
    const res = await api.post('/wallet/recharge', { amount });
    return {
      success: true,
      newBalance: res.data?.balance ?? amount,
    };
  },

  /**
   * Withdraw winnings to UPI ID
   */
  async withdraw(amount: number, upiId: string): Promise<{ success: boolean; newBalance: number }> {
    const res = await api.post('/wallet/withdraw', { amount, upiId });
    return {
      success: true,
      newBalance: res.data?.balance ?? 0,
    };
  },
};

