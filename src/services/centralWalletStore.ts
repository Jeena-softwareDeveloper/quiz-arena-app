// Centralized reactive wallet balance store for the entire mobile application.
// Guarantees 100% synchronization across HomeScreen, TradePredictionScreen, MarketAssetsScreen, and WalletScreen.

type WalletListener = (newBalance: number) => void;

export interface WalletLedgerItem {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  category: 'RECHARGE' | 'ENTRY_FEE' | 'PRIZE_WINNING' | 'WITHDRAWAL' | 'BONUS';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  balanceAfter?: number;
}

class CentralWalletStore {
  private balance: number = 10000;
  private listeners: Set<WalletListener> = new Set();
  private transactions: WalletLedgerItem[] = [
    {
      id: 'tx-init-1',
      type: 'CREDIT',
      amount: 10000,
      description: 'QuickTrade Practice Account Initialized',
      category: 'BONUS',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      balanceAfter: 10000,
    },
  ];

  getBalance(): number {
    return this.balance;
  }

  setBalance(
    newBalance: number,
    sourceDescription?: string,
    category: 'RECHARGE' | 'ENTRY_FEE' | 'PRIZE_WINNING' | 'WITHDRAWAL' | 'BONUS' = 'BONUS'
  ): void {
    const diff = newBalance - this.balance;
    this.balance = newBalance;

    if (sourceDescription && diff !== 0) {
      this.transactions.unshift({
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: diff > 0 ? 'CREDIT' : 'DEBIT',
        amount: Math.abs(diff),
        description: sourceDescription,
        category: category,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        balanceAfter: newBalance,
      });
    }

    // Notify all active screen listeners immediately
    this.listeners.forEach((listener) => {
      try {
        listener(newBalance);
      } catch (err) {
        console.warn('Listener error in CentralWalletStore', err);
      }
    });
  }

  recharge(amount: number, description?: string): number {
    const newBal = this.balance + amount;
    this.setBalance(newBal, description || `Instant Practice Cash Recharge (+₹${amount.toLocaleString('en-IN')})`, 'RECHARGE');
    return newBal;
  }

  deduct(amount: number, description?: string): boolean {
    if (this.balance < amount) return false;
    const newBal = this.balance - amount;
    this.setBalance(newBal, description || `Trade Prediction Bid Placed (-₹${amount.toLocaleString('en-IN')})`, 'ENTRY_FEE');
    return true;
  }

  addWin(amount: number, description?: string): number {
    const newBal = this.balance + amount;
    this.setBalance(newBal, description || `Trade Prediction 90% Win Payout (+₹${amount.toLocaleString('en-IN')})`, 'PRIZE_WINNING');
    return newBal;
  }

  getTransactions(): WalletLedgerItem[] {
    return [...this.transactions];
  }

  subscribe(listener: WalletListener): () => void {
    this.listeners.add(listener);
    // Defer initial delivery to prevent "Cannot update a component while rendering another" React warning
    Promise.resolve().then(() => {
      if (this.listeners.has(listener)) {
        listener(this.balance);
      }
    });
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const centralWalletStore = new CentralWalletStore();
