import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, getStoredToken } from './api';

let socket: Socket | null = null;

/**
 * Socket.io Manager with JWT Auth Handshake
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const token = getStoredToken();
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server successfully with JWT handshake');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
