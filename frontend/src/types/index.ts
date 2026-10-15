export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  about?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  replyToId?: string | null;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system';
  status: 'sent' | 'delivered' | 'read';
  isDeletedEveryone?: boolean;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    sender?: {
      username: string;
    };
  };
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title?: string;
  avatarUrl?: string;
  createdById?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  lastMessage?: Message | null;
  participants: User[];
  createdAt: string;
  updatedAt: string;
}
