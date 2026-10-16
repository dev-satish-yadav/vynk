import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { LandingPage } from './components/landing/LandingPage';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/chat/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { NewChatModal } from './components/chat/NewChatModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { socketService } from './services/socket';
import { MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

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
    closeActiveConversation,
    sendMessage,
    createOneOnOneChat,
    createGroupChat,
    setupSocketListeners,
  } = useChatStore();

  // Navigation view: defaults to 'landing' so landing page always opens first
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');

  // Modal states
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    mode: 'login',
  });
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleOpenChat = () => {
    if (!token || !user || !user.id) {
      // If not logged in, prompt user to sign in
      setAuthModalState({ isOpen: true, mode: 'login' });
      return;
    }
    setCurrentView('chat');
  };

  const activeTypingUsernames = activeConversation
    ? (typingUsers[activeConversation.id] || []).filter((u) => u !== user?.username)
    : [];

  const otherParticipant = activeConversation && !activeConversation.isGroup
    ? activeConversation.participants.find((p) => p.id !== user?.id)
    : undefined;

  const isActiveUserOnline = otherParticipant ? !!onlineUsers[otherParticipant.id] : false;

  return (
    <>
      {currentView === 'landing' ? (
        /* LANDING PAGE (First screen when URL is opened) */
        <LandingPage
          onOpenChat={handleOpenChat}
          onOpenAuth={handleOpenAuth}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
      ) : (
        /* CHAT WORKSPACE VIEW */
        <div className="flex flex-col h-[100dvh] w-full bg-[#F4F5FB] overflow-hidden fixed inset-0 z-10">
          {/* 1. TOP GLOBAL NAVBAR */}
          <TopNavbar
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onGoToLanding={() => setCurrentView('landing')}
          />

          {/* 2. CHAT WORKSPACE BODY */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar (Conversations Card List) */}
            <Sidebar
              conversations={conversations}
              activeConversation={activeConversation}
              currentUserId={user?.id || ''}
              onlineUsers={onlineUsers}
              typingUsers={typingUsers}
              onSelectChat={selectConversation}
              onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
            />

            {/* Center Chat Viewport */}
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                messages={messages}
                currentUserId={user?.id || ''}
                isOnline={isActiveUserOnline}
                typingUsernames={activeTypingUsernames}
                onSendMessage={sendMessage}
                onBackMobile={closeActiveConversation}
              />
            ) : (
              /* Empty Chat State */
              <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-white p-8 text-center select-none border-l border-borderSubtle">
                <div className="w-16 h-16 rounded-3xl bg-primary-light flex items-center justify-center text-primary mb-4 shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                  Select a conversation
                </h2>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-6">
                  Choose a contact from the list on the left or start a new message to chat in real time.
                </p>

                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-5 py-2.5 bg-[#635BFF] hover:bg-primary-hover text-white font-bold text-xs rounded-full transition shadow-md shadow-primary/25 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Start a conversation
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-10">
                  <ShieldCheck className="w-3.5 h-3.5 text-accentMint" />
                  <span>End-to-end encrypted real-time messaging</span>
                </div>
              </div>
            )}
          </div>

          {/* New Chat & Group Creator Modal */}
          <NewChatModal
            isOpen={isNewChatModalOpen}
            onClose={() => setIsNewChatModalOpen(false)}
            onStartOneOnOne={createOneOnOneChat}
            onCreateGroup={createGroupChat}
          />
        </div>
      )}

      {/* Auth Modal (can be opened from landing page or anywhere) */}
      {authModalState.isOpen && (
        <AuthModal
          initialMode={authModalState.mode}
          onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
          onSuccess={() => {
            setAuthModalState({ isOpen: false, mode: 'login' });
          }}
        />
      )}

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default App;
