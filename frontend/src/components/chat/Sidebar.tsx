import React, { useState } from 'react';
import { Search, Plus, Filter, MessageSquareDashed, LogOut } from 'lucide-react';
import { Conversation } from '../../types';
import { ChatItem } from './ChatItem';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  currentUserId: string;
  onlineUsers: Record<string, boolean>;
  typingUsers: Record<string, string[]>;
  onSelectChat: (conv: Conversation) => void;
  onOpenNewChatModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversation,
  currentUserId,
  onlineUsers,
  typingUsers,
  onSelectChat,
  onOpenNewChatModal,
}) => {
  const { user: currentUser, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'groups'>('all');

  // Filter conversations based on tab & search query
  const filteredConversations = conversations.filter((conv) => {
    // Tab filter
    if (filterTab === 'unread' && (!conv.unreadCount || conv.unreadCount === 0)) {
      return false;
    }
    if (filterTab === 'groups' && !conv.isGroup) {
      return false;
    }

    // Search query filter
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
    <div className={`w-full md:w-[380px] lg:w-[420px] bg-[#111b21] border-r border-[#202c33] flex-col h-full select-none flex-shrink-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
      {/* Top Header */}
      <div className="h-16 px-3.5 sm:px-4 bg-[#202c33]/70 flex items-center justify-between border-b border-[#202c33]">
        <div className="flex items-center gap-2.5">
          {/* Mobile Profile Avatar */}
          <div
            title={currentUser?.username || 'My Profile'}
            className="md:hidden relative w-9 h-9 rounded-full overflow-hidden border border-[#2a3942] bg-[#202c33] flex-shrink-0"
          >
            <img
              src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'user'}`}
              alt={currentUser?.username}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00a884] ring-1 ring-[#202c33]" />
          </div>
          <h2 className="text-xl font-bold text-[#e9edef] tracking-tight">Chats</h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewChatModal}
            title="New Chat or Group"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
          >
            <Plus className="w-5 h-5 text-[#00a884]" />
          </button>
          <button
            title="Filter Chats"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
          {/* Mobile Logout Button */}
          <button
            onClick={logout}
            title="Log Out"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#8696a0] hover:text-red-400 hover:bg-[#2a3942] transition-colors ml-0.5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#202c33] rounded-lg border border-transparent focus-within:border-[#00a884]/60 transition-colors">
          <Search className="w-4 h-4 text-[#8696a0] flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#8696a0] hover:text-[#e9edef]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-3 pb-2.5 border-b border-[#202c33]/40">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterTab === 'all'
              ? 'bg-[#00a884] text-black font-semibold'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterTab === 'unread'
              ? 'bg-[#00a884] text-black font-semibold'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilterTab('groups')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterTab === 'groups'
              ? 'bg-[#00a884] text-black font-semibold'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
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
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center text-[#8696a0]">
            <MessageSquareDashed className="w-10 h-10 mb-2 stroke-1 text-[#8696a0]/60" />
            <p className="text-sm font-medium">No conversations found</p>
            <button
              onClick={onOpenNewChatModal}
              className="mt-3 text-xs text-[#00a884] hover:underline font-semibold"
            >
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
