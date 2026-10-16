import React, { useState } from 'react';
import { Search, Plus, MessageSquareDashed, X, Loader2 } from 'lucide-react';
import { Conversation } from '../../types';
import { ChatItem } from './ChatItem';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  currentUserId: string;
  onlineUsers: Record<string, boolean>;
  typingUsers: Record<string, string[]>;
  hasMoreConversations?: boolean;
  isLoadingMoreConversations?: boolean;
  onLoadMoreConversations?: () => void;
  onSelectChat: (conv: Conversation) => void;
  onOpenNewChatModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversation,
  currentUserId,
  onlineUsers,
  typingUsers,
  hasMoreConversations = false,
  isLoadingMoreConversations = false,
  onLoadMoreConversations,
  onSelectChat,
  onOpenNewChatModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (filterTab === 'unread' && (!conv.unreadCount || conv.unreadCount === 0)) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    if (conv.isGroup) {
      return conv.title?.toLowerCase().includes(query);
    } else {
      const other = conv.participants.find((p) => p.id !== currentUserId);
      return other?.username.toLowerCase().includes(query);
    }
  });

  return (
    <aside
      className={`w-full md:w-[320px] lg:w-[350px] shrink-0 bg-[#F8F9FD] border-r border-[#EBEEF5] flex flex-col h-full select-none z-10 transition-all ${
        activeConversation ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Search Input Box */}
      <div className="p-4 pb-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts or chats"
            className="w-full pl-4 pr-10 py-2.5 bg-white rounded-full text-xs font-medium text-gray-800 placeholder-gray-400 border border-[#EBEEF5] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] shadow-sm transition"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />
          )}
        </div>

        {/* Filter Pills & New Message Button */}
        <div className="flex items-center justify-between gap-2 mt-3.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition shadow-sm ${
                filterTab === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-borderSubtle'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition ${
                filterTab === 'unread'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-borderSubtle'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={onOpenNewChatModal}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/30 hover:bg-[#5248E5] active:scale-95 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New message</span>
          </button>
        </div>
      </div>

      {/* Card List of Conversations */}
      <div
        onScroll={(e) => {
          const container = e.currentTarget;
          const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 80;
          if (
            isNearBottom &&
            hasMoreConversations &&
            !isLoadingMoreConversations &&
            !searchQuery.trim()
          ) {
            onLoadMoreConversations?.();
          }
        }}
        className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5"
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const other = conv.participants.find((p) => p.id !== currentUserId);
            const isOnline = other ? !!onlineUsers[other.id] : false;
            const typingList = typingUsers[conv.id] || [];
            const isTyping = typingList.length > 0;

            return (
              <ChatItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                currentUserId={currentUserId}
                isOnline={isOnline}
                isTyping={isTyping}
                onClick={() => onSelectChat(conv)}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 px-4 text-center text-gray-400">
            <MessageSquareDashed className="w-8 h-8 mb-2 text-gray-300 stroke-1" />
            <p className="text-xs font-semibold text-gray-500">No conversations found</p>
            <button
              onClick={onOpenNewChatModal}
              className="mt-2 text-xs text-[#635BFF] font-bold hover:underline"
            >
              Start a new conversation
            </button>
          </div>
        )}

        {/* Loading Spinner for Infinite Scroll */}
        {isLoadingMoreConversations && (
          <div className="flex items-center justify-center py-2.5 select-none">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-borderSubtle shadow-xs text-[11px] font-medium text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#635BFF]" />
              <span>Loading more chats...</span>
            </div>
          </div>
        )}

        {/* Load More Button fallback */}
        {!isLoadingMoreConversations &&
          hasMoreConversations &&
          !searchQuery.trim() &&
          filteredConversations.length > 0 && (
            <div className="flex items-center justify-center py-1 select-none">
              <button
                onClick={onLoadMoreConversations}
                className="text-[11px] font-bold text-[#635BFF] hover:text-[#5249ea] hover:underline transition cursor-pointer"
              >
                Load more conversations
              </button>
            </div>
          )}
      </div>
    </aside>
  );
};
