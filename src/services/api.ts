import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Dynamically resolves backend host for Web, Expo Go, and physical mobile devices.
 * Eliminates [AxiosError: Network Error] when testing on physical phones via Expo Go.
 */
const getHostAddress = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }

  // Running on Web in a desktop or mobile browser
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const hostname = window.location.hostname;
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // Running on native mobile device via Expo Go (iOS / Android)
  // Extracts the development computer's LAN IP from the Expo connection URI
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000`;
    }
  }

  // Fallback for Android emulator or workstation IP
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://192.23.1.53:5000';
};

const BACKEND_HOST = getHostAddress();
export const BASE_URL = `${BACKEND_HOST}/api`;
export const SOCKET_URL = BACKEND_HOST;

const TOKEN_KEY = 'quiz_arena_user_jwt_token';
let memoryToken: string | null = null;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Get stored JWT Token (works across Web, Android, iOS)
 */
export const getStoredToken = (): string | null => {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Save JWT Token to persistent storage and set Authorization header
 */
export const saveToken = (token: string) => {
  memoryToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Clear JWT Token from storage on logout
 */
export const clearToken = () => {
  memoryToken = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  delete api.defaults.headers.common['Authorization'];
};

// Initialize token from storage on module load
const initialToken = getStoredToken();
if (initialToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Global Axios Request Interceptor
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Axios Response Interceptor (Handles token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;
