import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { format, isToday, isYesterday } from 'date-fns';
import { Radio } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup: boolean;
  onReply: (msg: Message) => void;
  typingUsernames?: string[];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup,
  onReply,
  typingUsernames = [],
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length, typingUsernames.length]);

  const getDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAFAFC] select-text">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm select-none">
          <div className="w-12 h-12 rounded-2xl bg-white border border-borderSubtle flex items-center justify-center text-primary mb-3 shadow-sm">
            ✨
          </div>
          <p className="font-semibold text-gray-700">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation!</p>
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
                <div className="flex items-center justify-center my-4 select-none">
                  <span className="text-[11px] font-medium text-gray-500 bg-white px-3.5 py-1 rounded-full border border-borderSubtle shadow-sm">
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

      {/* Live Typing Indicator as the last message in messages stream */}
      {typingUsernames && typingUsernames.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#635BFF] animate-pulse select-none pl-1 py-1">
          <Radio className="w-3.5 h-3.5 shrink-0" />
          <span>
            {typingUsernames.join(', ')} {typingUsernames.length > 1 ? 'are' : 'is'} typing...
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
