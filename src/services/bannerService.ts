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
  id: 'default-tnpsc-1',
  title: 'TNPSC Quiz Challenge',
  titleTamil: 'TNPSC வினாடி வினா சவால்',
  subtitle: 'Test Your Knowledge • Win Real Cash',
  subtitleTamil: 'உங்கள் அறிவை சோதித்து ரொக்கப் பரிசு வெல்லுங்கள்',
  imageUrl: '',
  actionType: 'OPEN_CATEGORY',
  actionTarget: 'TNPSC',
  actionText: 'Play Now',
  actionTextTamil: 'விளையாடு',
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

