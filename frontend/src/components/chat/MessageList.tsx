import React, { useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup: boolean;
  onReply: (msg: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup,
  onReply,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length]);

  // Group messages by date
  const getDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'TODAY';
      if (isYesterday(date)) return 'YESTERDAY';
      return format(date, 'MMMM d, yyyy').toUpperCase();
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 md:px-6 py-4 chat-bg select-text">
      {/* End-to-End Encryption Notice Badge */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#182229]/90 border border-[#2a3942]/70 rounded-lg text-[11.5px] text-[#ffd279] shadow-sm select-none">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Messages are protected with end-to-end encryption in Vynk.</span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#8696a0] text-sm select-none">
          <p>No messages here yet.</p>
          <p className="text-xs text-[#8696a0]/70 mt-1">Say hello to break the ice! 👋</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isSentByMe = msg.senderId === currentUserId;
          const currentDateLabel = getDateLabel(msg.createdAt);
          const prevDateLabel = index > 0 ? getDateLabel(messages[index - 1].createdAt) : null;
          const showDateSeparator = currentDateLabel !== prevDateLabel;

          return (
            <React.Fragment key={msg.id || index}>
              {showDateSeparator && (
                <div className="flex justify-center my-3 select-none">
                  <span className="px-3 py-1 rounded-lg bg-[#182229] border border-[#2a3942]/60 text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider shadow-sm">
                    {currentDateLabel}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isSentByMe={isSentByMe}
                showSenderName={isGroup}
                onReply={onReply}
              />
            </React.Fragment>
          );
        })
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
