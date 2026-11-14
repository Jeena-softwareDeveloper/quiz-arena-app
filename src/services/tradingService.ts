import { api } from './api';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TradeAssetData {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price: number;
  change: string;
  isPositive: boolean;
  payoutRate: number;
}

export interface TradeBetResult {
  id: string;
  userId: string;
  assetId: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  entryPrice: number;
  payoutRate: number;
  potentialWin: number;
  placedAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
}

export const tradingService = {
  async getAssets(): Promise<TradeAssetData[]> {
    try {
      const res = await api.get('/trading/assets');
      return res.data.assets || [];
    } catch (e) {
      console.warn('Failed to fetch trading assets, using fallback', e);
      return [];
    }
  },

  async getCandles(assetId: string): Promise<{ asset?: TradeAssetData; candles: CandleData[] }> {
    try {
      const res = await api.get(`/trading/candles/${assetId}`);
      return {
        asset: res.data.asset,
        candles: res.data.candles || [],
      };
    } catch (e) {
      console.warn(`Failed to fetch candles for ${assetId}`, e);
      return { candles: [] };
    }
  },

  async placePrediction(params: {
    assetId: string;
    amount: number;
    direction: 'UP' | 'DOWN';
  }): Promise<{ success: boolean; bet?: TradeBetResult; newWalletBalance?: number; error?: string }> {
    try {
      const res = await api.post('/trading/predict', params);
      return {
        success: true,
        bet: res.data.bet,
        newWalletBalance: res.data.newWalletBalance,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Trade execution failed',
      };
    }
  },

  async getMyTrades(): Promise<{ active: TradeBetResult[]; history: TradeBetResult[] }> {
    try {
      const res = await api.get('/trading/my-trades');
      return {
        active: res.data.active || [],
        history: res.data.history || [],
      };
    } catch (e) {
      return { active: [], history: [] };
    }
  },
};

