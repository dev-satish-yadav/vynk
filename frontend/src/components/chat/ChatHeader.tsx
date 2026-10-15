import React from 'react';
import { Search, MoreVertical, ArrowLeft } from 'lucide-react';
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

  const renderSubtitle = () => {
    if (isTyping) {
      const names = typingUsernames.join(', ');
      return <span className="text-[#00a884] font-medium animate-pulse">{names} typing...</span>;
    }
    if (conversation.isGroup) {
      return (
        <span className="truncate">
          {conversation.participants.map((p) => p.username).join(', ')}
        </span>
      );
    }
    if (isOnline) {
      return <span className="text-[#00a884] font-medium">online</span>;
    }
    return <span>offline</span>;
  };

  return (
    <div className="h-16 px-2.5 sm:px-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between select-none z-10 flex-shrink-0">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 flex-1 mr-2" onClick={onToggleContactDrawer}>
        {onBackMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBackMobile();
            }}
            aria-label="Back to conversations"
            className="md:hidden text-[#8696a0] hover:text-[#e9edef] p-1.5 -ml-1 rounded-full active:bg-[#2a3942] flex-shrink-0 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#111b21] border border-[#2a3942]">
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          </div>
          {!conversation.isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] ring-2 ring-[#202c33]" />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[#e9edef] leading-tight truncate">
            {displayName}
          </h3>
          <p className="text-xs text-[#8696a0] leading-normal flex items-center gap-1 truncate">
            {renderSubtitle()}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 text-[#8696a0] flex-shrink-0">
        <button
          title="Search in chat"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleContactDrawer}
          title="More options"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
