import React, { useState } from 'react';
import { Conversation, Message } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ContactDrawer } from './ContactDrawer';
import { socketService } from '../../services/socket';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  isOnline: boolean;
  typingUsernames: string[];
  onSendMessage: (content: string, replyToId?: string, attachments?: any[]) => void;
  onBackMobile?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  isOnline,
  typingUsernames,
  onSendMessage,
  onBackMobile,
}) => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  // Drawer is closed by default. Only opens when user clicks on contact avatar/name or Info icon
  const [showDrawer, setShowDrawer] = useState(false);

  const isTyping = typingUsernames.length > 0;

  return (
    <div className="flex-1 flex h-full overflow-hidden relative bg-white">
      {/* Central Chat Stream & Input */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Header */}
        <ChatHeader
          conversation={conversation}
          currentUserId={currentUserId}
          isOnline={isOnline}
          isTyping={isTyping}
          typingUsernames={typingUsernames}
          onBackMobile={onBackMobile}
          onToggleContactDrawer={() => setShowDrawer((prev) => !prev)}
        />

        {/* Message History */}
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroup={conversation.isGroup}
          onReply={(msg) => setReplyingTo(msg)}
        />

        {/* Rich Input Box */}
        <MessageInput
          onSendMessage={onSendMessage}
          onTypingStart={() => socketService.startTyping(conversation.id)}
          onTypingStop={() => socketService.stopTyping(conversation.id)}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Right Contact Details Drawer - only opens when clicked */}
      {showDrawer && (
        <ContactDrawer
          conversation={conversation}
          currentUserId={currentUserId}
          isOnline={isOnline}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  );
};
