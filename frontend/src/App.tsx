import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { LeftRail } from './components/layout/LeftRail';
import { Sidebar } from './components/chat/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { NewChatModal } from './components/chat/NewChatModal';
import { AuthModal } from './components/auth/AuthModal';
import { socketService } from './services/socket';
import { MessageSquare, ShieldCheck, Laptop } from 'lucide-react';

export const App: React.FC = () => {
  const { user, token, checkAuth } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    fetchConversations,
    selectConversation,
    sendMessage,
    createOneOnOneChat,
    createGroupChat,
    setupSocketListeners,
  } = useChatStore();

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Initialize Auth & Real-Time Socket
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (token && user && user.id) {
      socketService.connect(token);
      fetchConversations();
      setupSocketListeners();
    }
  }, [token, user, fetchConversations, setupSocketListeners]);

  // If not logged in, show Auth Modal
  if (!token || !user || !user.id) {
    return <AuthModal />;
  }

  const activeTypingUsernames = activeConversation
    ? (typingUsers[activeConversation.id] || []).filter((u) => u !== user.username)
    : [];

  const otherParticipant = activeConversation && !activeConversation.isGroup
    ? activeConversation.participants.find((p) => p.id !== user.id)
    : undefined;

  const isActiveUserOnline = otherParticipant ? !!onlineUsers[otherParticipant.id] : false;

  return (
    <div className="flex h-screen w-screen bg-[#0c1317] overflow-hidden">
      {/* 1. Left Action Rail (Narrow, WhatsApp-style) */}
      <LeftRail />

      {/* 2. Conversations Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        currentUserId={user.id}
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        onSelectChat={selectConversation}
        onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
      />

      {/* 3. Main Chat Viewport */}
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={user.id}
          isOnline={isActiveUserOnline}
          typingUsernames={activeTypingUsernames}
          onSendMessage={sendMessage}
        />
      ) : (
        /* Empty Chat State (WhatsApp Web Welcome Screen) */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#222e35]/30 border-b-8 border-[#00a884] p-8 text-center select-none">
          <div className="w-20 h-20 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center text-[#00a884] mb-6 shadow-xl">
            <Laptop className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#e9edef] mb-2 tracking-tight">
            Vynk Web Messenger
          </h2>
          <p className="text-sm text-[#8696a0] max-w-md leading-relaxed mb-6">
            Send and receive messages without keeping your phone online. Use Vynk on all your linked devices seamlessly.
          </p>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="px-6 py-2.5 bg-[#00a884] hover:bg-[#06cf9c] text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#00a884]/20 active:scale-95 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Start a Conversation
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mt-12">
            <ShieldCheck className="w-4 h-4 text-[#00a884]" />
            <span>End-to-end encrypted real-time messaging</span>
          </div>
        </div>
      )}

      {/* New Chat & Group Creator Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onStartOneOnOne={createOneOnOneChat}
        onCreateGroup={createGroupChat}
      />
    </div>
  );
};

export default App;
