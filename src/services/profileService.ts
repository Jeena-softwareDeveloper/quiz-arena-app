import { api } from './api';

export interface UpdateProfilePayload {
  name?: string;
  educationLevel?: string;
  interests?: string[];
  languagePreference?: string;
}

/**
 * User Profile & Educational Preferences Service
 * Manages player settings, education tier, interest categories, and bilingual language preference.
 */
export const profileService = {
  /**
   * Update player profile details
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<any> {
    const res = await api.put('/auth/profile', payload);
    return res.data;
  },

  /**
   * Update player language preference ('EN' | 'TA')
   */
  async updateLanguage(lang: 'EN' | 'TA'): Promise<any> {
    const res = await api.put('/auth/profile', { languagePreference: lang });
    return res.data;
  },

  /**
   * Fetch dynamic education tiers and categories
   */
  async getMetadataOptions(): Promise<{ educationLevels: any[]; categories: string[] }> {
    try {
      const res = await api.get('/rooms/meta/options');
      return {
        educationLevels: res.data?.educationLevels || [],
        categories: res.data?.categories || [],
      };
    } catch {
      return {
        educationLevels: [
          { label: 'School (Below 10th)', value: 'BELOW_10TH' },
          { label: '10th / +2 Passed', value: 'TENTH_PLUS_TWO' },
          { label: 'Graduate / Degree', value: 'GRADUATE' },
          { label: 'Post Graduate / Doctorate', value: 'POST_GRADUATE' },
        ],
        categories: ['TNPSC', 'CINEMA', 'GENERAL_GK', 'SCIENCE', 'TECH'],
      };
    }
  },
};

