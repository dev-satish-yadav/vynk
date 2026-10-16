import React from 'react';
import { Flag, Info, ChevronLeft } from 'lucide-react';
import { Conversation, User } from '../../types';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  isOnline: boolean;
  isTyping: boolean;
  typingUsernames: string[];
  onBackMobile?: () => void;
  onToggleContactDrawer: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUserId,
  isOnline,
  isTyping,
  typingUsernames,
  onBackMobile,
  onToggleContactDrawer,
}) => {
  const otherParticipant: User | undefined = conversation.isGroup
    ? undefined
    : conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0];

  const displayName = conversation.isGroup
    ? conversation.title || 'Group Chat'
    : otherParticipant?.username || 'Contact';

  const avatar = conversation.isGroup
    ? conversation.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`
    : otherParticipant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

  return (
    <div className="h-16 px-4 sm:px-6 border-b border-[#EBEEF5] flex items-center justify-between shrink-0 bg-white select-none z-10 shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mobile Back Arrow */}
        {onBackMobile && (
          <button
            onClick={onBackMobile}
            aria-label="Back"
            className="md:hidden p-1.5 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Contact Avatar */}
        <div
          onClick={onToggleContactDrawer}
          className="relative cursor-pointer shrink-0"
        >
          <img
            src={avatar}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#635BFF]/15"
          />
          {!conversation.isGroup && (
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                isOnline ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>

        {/* Contact Name & Online state in English */}
        <div
          onClick={onToggleContactDrawer}
          className="flex flex-col min-w-0 cursor-pointer"
        >
          <h2 className="text-sm font-bold text-gray-900 truncate tracking-tight">{displayName}</h2>
          <div className="flex items-center gap-1.5 text-[11px] truncate mt-0.5">
            {isTyping ? (
              <span className="text-[#635BFF] font-semibold animate-pulse truncate">
                {typingUsernames.join(', ')} typing...
              </span>
            ) : conversation.isGroup ? (
              <span className="text-gray-400 truncate">
                {conversation.participants.length} members
              </span>
            ) : isOnline ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Icons with refined purple styling */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          title="Flag conversation"
          onClick={() => alert('Conversation marked as starred/priority')}
          className="p-2 rounded-full text-[#635BFF] hover:bg-[#EEEDFE] transition"
        >
          <Flag className="w-4 h-4 stroke-[2.2]" />
        </button>
        <button
          onClick={onToggleContactDrawer}
          title="Toggle Contact Details"
          className="p-2 rounded-full text-[#635BFF] hover:bg-[#EEEDFE] transition"
        >
          <Info className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
