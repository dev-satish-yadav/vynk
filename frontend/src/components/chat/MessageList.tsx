import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { format, isToday, isYesterday } from 'date-fns';
import { Radio, Loader2, ShieldCheck, ArrowUp, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup: boolean;
  onReply: (msg: Message) => void;
  typingUsernames?: string[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup,
  onReply,
  typingUsernames = [],
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isPaginatingRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);
  const prevMessageCountRef = useRef<number>(0);

  // Handle scroll events to detect scrolling near the top
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop < 80 && hasMore && !isLoadingMore && !isPaginatingRef.current) {
      prevScrollHeightRef.current = container.scrollHeight;
      prevScrollTopRef.current = container.scrollTop;
      isPaginatingRef.current = true;
      onLoadMore?.();
    }
  };

  // Adjust scroll after messages render
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isPaginatingRef.current) {
      // Older messages were prepended: maintain user's view seamlessly
      const newScrollHeight = container.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = prevScrollTopRef.current + heightDiff;
      isPaginatingRef.current = false;
    } else if (isInitialLoadRef.current && messages.length > 0) {
      // First load of conversation: scroll instantly to bottom
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    } else {
      // New message added: scroll to bottom if user is already near bottom or sent the message
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 250;
      const lastMessage = messages[messages.length - 1];
      const isSentByMe = lastMessage?.senderId === currentUserId;

      if (isNearBottom || isSentByMe) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, currentUserId]);

  // Reset initial load flag when messages array is reset (conversation switch)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoadRef.current = true;
      isPaginatingRef.current = false;
    }
  }, [messages.length === 0]);

  // Scroll to bottom when someone starts typing if already near bottom
  useEffect(() => {
    if (typingUsernames.length > 0) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [typingUsernames.length]);

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

  const handleManualLoadMore = () => {
    const container = containerRef.current;
    if (container && hasMore && !isLoadingMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      prevScrollTopRef.current = container.scrollTop;
      isPaginatingRef.current = true;
      onLoadMore?.();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAFAFC] select-text"
    >
      {/* Top Pagination Status & Sentinel */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-2 select-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-borderSubtle shadow-xs text-xs font-medium text-gray-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#635BFF]" />
            <span>Loading older messages...</span>
          </div>
        </div>
      )}

      {!isLoadingMore && hasMore && messages.length > 0 && (
        <div className="flex items-center justify-center py-1 select-none">
          <button
            onClick={handleManualLoadMore}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#635BFF] hover:text-[#5249ea] bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1 rounded-full shadow-2xs transition cursor-pointer"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Load older messages</span>
          </button>
        </div>
      )}

      {!hasMore && messages.length > 0 && (
        <div className="flex flex-col items-center justify-center py-3 text-center select-none">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF]" />
          </div>
          <span className="text-[11px] font-medium text-gray-400">
            Beginning of conversation history
          </span>
        </div>
      )}

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
                onDelete={(target) => setMessageToDelete(target)}
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

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">Delete message?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {messageToDelete.senderId === currentUserId
                ? 'You can delete this message for everyone in this chat or only for yourself.'
                : 'This message will be removed from your view only.'}
            </p>

            <div className="flex flex-col gap-2 w-full">
              {messageToDelete.senderId === currentUserId && (
                <button
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    await deleteMessage(messageToDelete.id, 'everyone');
                    setIsDeleting(false);
                    setMessageToDelete(null);
                  }}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-full transition shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete for everyone'}
                </button>
              )}

              <button
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteMessage(messageToDelete.id, 'for_me');
                  setIsDeleting(false);
                  setMessageToDelete(null);
                }}
                className={`w-full py-2.5 px-4 font-bold text-xs rounded-full transition cursor-pointer disabled:opacity-50 active:scale-95 ${
                  messageToDelete.senderId === currentUserId
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete for me'}
              </button>

              <button
                disabled={isDeleting}
                onClick={() => setMessageToDelete(null)}
                className="w-full py-2 px-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
