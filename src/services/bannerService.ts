import { api } from './api';

export interface MobileBanner {
  id: string;
  title: string;
  titleTamil?: string | null;
  subtitle: string;
  subtitleTamil?: string | null;
  imageUrl: string;
  actionType: 'PLAY_NOW' | 'OPEN_CATEGORY' | 'EXTERNAL_LINK' | string;
  actionTarget?: string | null;
  actionText: string;
  actionTextTamil?: string | null;
  isActive: boolean;
  order: number;
}

export const DEFAULT_FALLBACK_BANNER: MobileBanner = {
  id: 'default-quicktrade-1',
  title: 'Predict Green or Red',
  titleTamil: 'பச்சை அல்லது சிவப்பு கணிக்கவும்',
  subtitle: 'Guess the next price move and earn up to 90% profit',
  subtitleTamil: 'அடுத்த விலையை கணித்து 90% வரை லாபம் ஈட்டுங்கள்',
  imageUrl: '',
  actionType: 'PLAY_NOW',
  actionTarget: 'QUICK_TRADE',
  actionText: 'Trade Now',
  actionTextTamil: 'வர்த்தகம் செய்',
  isActive: true,
  order: 1,
};

export const bannerService = {
  /**
   * Fetch active hero banners from API with resilient fallback
   */
  async getActiveBanners(): Promise<MobileBanner[]> {
    try {
      const res = await api.get('/banners');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return [DEFAULT_FALLBACK_BANNER];
    } catch (err) {
      console.warn('[bannerService] Using fallback banner:', err);
      return [DEFAULT_FALLBACK_BANNER];
    }
  },
};

