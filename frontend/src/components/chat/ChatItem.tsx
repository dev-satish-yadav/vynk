import React from 'react';
import { MoreHorizontal, Check, CheckCheck } from 'lucide-react';
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
  const otherParticipant: User | undefined = conversation.isGroup
    ? undefined
    : conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0];

  const displayName = conversation.isGroup
    ? conversation.title || 'Group Chat'
    : otherParticipant?.username || 'Contact';

  const subtitle = conversation.isGroup
    ? `${conversation.participants.length} members`
    : otherParticipant?.about || 'Product Lead at Castorama';

  const avatar = conversation.isGroup
    ? conversation.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`
    : otherParticipant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

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

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl flex items-start gap-3 cursor-pointer transition-all duration-150 select-none ${
        isActive
          ? 'active-card'
          : 'bg-white border border-[#EBEEF5] hover:border-gray-300 hover:shadow-md shadow-card'
      }`}
    >
      {/* Avatar with Status badge */}
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={displayName}
          className={`w-10 h-10 rounded-full object-cover ring-2 ${
            isActive ? 'ring-white' : 'ring-primary/10'
          }`}
        />
        {!conversation.isGroup && (
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ${
              isActive ? 'ring-[#635BFF]' : 'ring-white'
            } ${isOnline ? 'bg-emerald-400' : 'bg-gray-300'}`}
          />
        )}
      </div>

      {/* Info Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4
            className={`text-xs font-bold truncate ${
              isActive ? 'text-white' : 'text-gray-900'
            }`}
          >
            {displayName}
          </h4>
          <span
            className={`text-[10px] ml-1 shrink-0 ${
              isActive ? 'text-white/80' : 'text-gray-400'
            }`}
          >
            {formatTime(lastMsg?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <p
          className={`text-[10px] truncate ${
            isActive ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          {subtitle}
        </p>

        <div
          className={`flex items-center gap-1 text-[11px] truncate mt-1 ${
            isActive ? 'text-white/95 font-medium' : 'text-gray-600'
          }`}
        >
          {isTyping ? (
            <span className={isActive ? 'text-white italic' : 'text-[#635BFF] font-semibold'}>
              typing...
            </span>
          ) : (
            <>
              {lastMsg && !lastMsg.isDeletedEveryone && lastMsg.senderId === currentUserId && (
                <span className="shrink-0 inline-flex items-center mr-0.5">
                  {lastMsg.status === 'read' ? (
                    <CheckCheck className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#53bdeb]'}`} />
                  ) : lastMsg.status === 'delivered' ? (
                    <CheckCheck className={`w-3.5 h-3.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`} />
                  ) : (
                    <Check className={`w-3.5 h-3.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`} />
                  )}
                </span>
              )}
              <span className={`truncate ${lastMsg?.isDeletedEveryone ? 'italic opacity-75' : ''}`}>
                {lastMsg?.isDeletedEveryone
                  ? 'This message was deleted'
                  : lastMsg?.content || 'No messages yet'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Indicator / Actions */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <span
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              isActive ? 'bg-white text-[#635BFF]' : 'bg-[#635BFF] text-white'
            }`}
          >
            {conversation.unreadCount}
          </span>
        ) : (
          <div className="w-5 h-5" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={`p-0.5 rounded transition ${
            isActive ? 'text-white/80 hover:text-white' : 'text-gray-300 hover:text-gray-600'
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
