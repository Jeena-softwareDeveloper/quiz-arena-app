import { api, saveToken, clearToken } from './api';

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  educationLevel?: string;
  interests?: string[];
  languagePreference?: string;
}


export interface AuthResponse {
  user: any;
  token: string;
}

export interface MetadataOptions {
  educationLevels: { label: string; value: string }[];
  categories: string[];
}

// Fallback metadata options for 100% offline / network resilience
export const DEFAULT_METADATA: MetadataOptions = {
  educationLevels: [
    { label: 'School (Below 10th)', value: 'BELOW_10TH' },
    { label: '10th / +2 Passed', value: 'TENTH_PLUS_TWO' },
    { label: 'Graduate / Degree', value: 'GRADUATE' },
    { label: 'Post Graduate / Doctorate', value: 'POST_GRADUATE' },
  ],
  categories: ['TNPSC', 'CINEMA', 'GENERAL_GK', 'SCIENCE', 'TECH'],
};

/**
 * Authentication & Identity Service
 * Handles user login, registration, session verification, and quick-demo accounts.
 */
export const authService = {
  /**
   * Log in with mobile number and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post('/auth/login', payload);
    if (res.data?.token) {
      saveToken(res.data.token);
    }
    return res.data;
  },

  /**
   * Register a new user with education profiling & interest tags
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post('/auth/register', payload);
    if (res.data?.token) {
      saveToken(res.data.token);
    }
    return res.data;
  },

  /**
   * Verify stored session and fetch active user profile
   */
  async getMe(): Promise<any> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  /**
   * One-Click Instant Demo Login with resilient fallback
   */
  async quickDemoLogin(demoPhone: string): Promise<AuthResponse> {
    try {
      const res = await api.post('/auth/login', { phone: demoPhone, password: 'user123' });
      if (res.data?.token) {
        saveToken(res.data.token);
      }
      return res.data;
    } catch (err: any) {
      console.warn('[authService] Network demo login failed, using resilient fallback:', err?.message || err);
      const fallbackUser =
        demoPhone === '9876543210'
          ? {
              id: 'karthik-demo-id',
              name: 'Karthik Raja',
              phone: '9876543210',
              educationLevel: 'GRADUATE',
              interests: ['TNPSC', 'GENERAL_GK'],
              languagePreference: 'EN',
              eloRating: 1120,
              walletBalance: 150,
            }
          : {
              id: 'priya-demo-id',
              name: 'Priya Dharshini',
              phone: '9876543211',
              educationLevel: 'TENTH_PLUS_TWO',
              interests: ['CINEMA', 'GENERAL_GK', 'TNPSC'],
              languagePreference: 'TA',
              eloRating: 1040,
              walletBalance: 70,
            };
      const fallbackToken = 'demo-jwt-fallback-token';
      saveToken(fallbackToken);
      return { user: fallbackUser, token: fallbackToken };
    }
  },

  /**
   * Fetch dynamic education tiers and arena categories
   */
  async getMetadataOptions(): Promise<MetadataOptions> {
    try {
      const res = await api.get('/rooms/meta/options');
      return {
        educationLevels: res.data?.educationLevels?.length ? res.data.educationLevels : DEFAULT_METADATA.educationLevels,
        categories: res.data?.categories?.length ? res.data.categories : DEFAULT_METADATA.categories,
      };
    } catch (err: any) {
      console.warn('[authService] Using default metadata options:', err?.message || err);
      return DEFAULT_METADATA;
    }
  },

  /**
   * Log out active user and purge JWT token
   */
  logout(): void {
    clearToken();
  },
};

