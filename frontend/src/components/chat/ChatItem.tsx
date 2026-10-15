import React from 'react';
import { Check, CheckCheck, Pin } from 'lucide-react';
import { Conversation, User } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  isOnline: boolean;
  isTyping: boolean;
  onClick: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  conversation,
  isActive,
  currentUserId,
  isOnline,
  isTyping,
  onClick,
}) => {
  // Get other participant in 1-on-1 chat
  const otherParticipant: User | undefined = conversation.isGroup
    ? undefined
    : conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0];

  const displayName = conversation.isGroup
    ? conversation.title || 'Group Chat'
    : otherParticipant?.username || 'Contact';

  const avatar = conversation.isGroup
    ? conversation.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`
    : otherParticipant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

  // Format timestamp
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return format(date, 'h:mm a');
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MM/dd/yy');
    } catch {
      return '';
    }
  };

  const lastMsg = conversation.lastMessage;
  const isSentByMe = lastMsg?.senderId === currentUserId;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer border-b border-[#202c33]/40 transition-colors select-none ${
        isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#202c33]">
          <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
        </div>
        {!conversation.isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] ring-2 ring-[#111b21]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name & Time */}
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-[15px] font-semibold text-[#e9edef] truncate">{displayName}</h4>
          <span
            className={`text-xs ml-2 flex-shrink-0 ${
              conversation.unreadCount && conversation.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#8696a0]'
            }`}
          >
            {formatTime(lastMsg?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        {/* Last message & Badges */}
        <div className="flex justify-between items-center text-[13px] text-[#8696a0]">
          <div className="flex items-center gap-1 truncate max-w-[210px]">
            {isTyping ? (
              <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
            ) : (
              <>
                {isSentByMe && lastMsg && (
                  <span className="flex-shrink-0">
                    {lastMsg.status === 'read' ? (
                      <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    ) : lastMsg.status === 'delivered' ? (
                      <CheckCheck className="w-4 h-4 text-[#8696a0]" />
                    ) : (
                      <Check className="w-4 h-4 text-[#8696a0]" />
                    )}
                  </span>
                )}
                <span className="truncate">{lastMsg?.content || 'No messages yet'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conversation.isPinned && <Pin className="w-3.5 h-3.5 text-[#8696a0]" />}
            {conversation.unreadCount && conversation.unreadCount > 0 ? (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#00a884] text-black text-xs font-bold flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
