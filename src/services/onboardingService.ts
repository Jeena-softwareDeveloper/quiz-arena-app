import { api } from './api';

export interface MobileOnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_ONBOARDING_SLIDES: MobileOnboardingSlide[] = [
  {
    id: 'default-slide-1',
    title: 'Predict Green or Red',
    subtitle: 'Guess the next price move and earn up to 90% profit',
    imageUrl: '', // Renders custom 3D Bitcoin bullion graphic when empty
    order: 1,
    isActive: true,
  },
  {
    id: 'default-slide-2',
    title: 'Instant 60s Payouts',
    subtitle: 'Fast 1-minute prediction rounds with lightning instant profit',
    imageUrl: '',
    order: 2,
    isActive: true,
  },
  {
    id: 'default-slide-3',
    title: 'Claim ₹50 Free Bonus',
    subtitle: 'Start trading with zero risk and withdraw directly to UPI Bank',
    imageUrl: '',
    order: 3,
    isActive: true,
  },
];

export const onboardingService = {
  /**
   * Fetch active onboarding slides dynamically from the backend admin panel
   */
  async getOnboardingSlides(): Promise<MobileOnboardingSlide[]> {
    try {
      const res = await api.get('/onboarding/slides');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return DEFAULT_ONBOARDING_SLIDES;
    } catch (err) {
      console.warn('[onboardingService] Using default fallback slides:', err);
      return DEFAULT_ONBOARDING_SLIDES;
    }
  },
};

