import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket | null {
    if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null' || !token.trim()) {
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Vynk WebSocket server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from Vynk WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('❌ Socket connection error:', error.message);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string): void {
    if (!conversationId) return;
    this.socket?.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!conversationId) return;
    this.socket?.emit('leave_conversation', { conversationId });
  }

  sendMessage(payload: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
    attachments?: any[];
  }): void {
    if (!payload?.conversationId) return;
    this.socket?.emit('send_message', payload);
  }

  startTyping(conversationId: string): void {
    if (!conversationId) return;
    this.socket?.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string): void {
    if (!conversationId) return;
    this.socket?.emit('typing_stop', { conversationId });
  }

  markAsRead(conversationId: string): void {
    if (!conversationId) return;
    this.socket?.emit('mark_read', { conversationId });
  }
}

export const socketService = new SocketService();
