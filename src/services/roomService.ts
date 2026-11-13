import { api } from './api';

export interface TournamentRoom {
  id: string;
  title: string;
  category: string;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'SCHEDULED' | 'WAITING' | 'IN_PROGRESS' | 'WAITING_RESULTS' | 'COMPLETED';
  scheduledStartTime: string;
  joinWindowMinutes?: number;
  educationTiers?: string[];
  totalQuestions?: number;
  timePerQuestion?: number;
  isRegistered?: boolean;
}

export interface EnterArenaResponse {
  success: boolean;
  room: TournamentRoom;
  walletBalance?: number;
}

/**
 * Tournament & Arena Service
 * Manages scheduled tournaments, categorized matchups, pre-registration, and live entry.
 */
export const roomService = {
  /**
   * Fetch smart recommended arenas matching user profile & education tier
   */
  async getRecommendedRooms(): Promise<TournamentRoom[]> {
    const res = await api.get('/rooms/recommended');
    return res.data;
  },

  /**
   * Fetch tournament rooms filtered by selected category
   */
  async getRoomsByCategory(category: string): Promise<TournamentRoom[]> {
    const res = await api.get(`/rooms/category/${encodeURIComponent(category)}`);
    return res.data;
  },

  /**
   * Pre-register and pay entry fee for a tournament room
   */
  async joinRoom(roomId: string): Promise<{ success: boolean; newBalance: number; ticketId: string; room: TournamentRoom }> {
    const res = await api.post(`/rooms/${roomId}/join`);
    return res.data;
  },

  /**
   * Pre-register or enter live tournament arena
   */
  async enterArena(roomId: string): Promise<EnterArenaResponse> {
    const res = await api.post(`/rooms/${roomId}/enter-arena`);
    return res.data;
  },

  /**
   * Fetch specific arena room details by ID
   */
  async getRoomDetails(roomId: string): Promise<TournamentRoom> {
    const res = await api.get(`/rooms/${roomId}`);
    return res.data;
  },

  /**
   * Fetch category list and education levels
   */
  async getCategories(): Promise<string[]> {
    try {
      const res = await api.get('/rooms/meta/options');
      return res.data?.categories || ['TNPSC', 'CINEMA', 'GENERAL_GK', 'SCIENCE', 'TECH'];
    } catch {
      return ['TNPSC', 'CINEMA', 'GENERAL_GK', 'SCIENCE', 'TECH'];
    }
  },
};
