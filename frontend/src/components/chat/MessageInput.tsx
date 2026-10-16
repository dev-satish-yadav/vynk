import React, { useState, useRef } from 'react';
import { Trash2, Send, X } from 'lucide-react';
import { Message } from '../../types';

interface MessageInputProps {
  onSendMessage: (content: string, replyToId?: string, attachments?: any[]) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > 500) return;
    setText(val);

    onTypingStart();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || text.trim().length > 500) return;

    onSendMessage(text.trim(), replyingTo?.id);
    setText('');
    onCancelReply();
    onTypingStop();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleClear = () => {
    setText('');
    onCancelReply();
    onTypingStop();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-borderSubtle shrink-0">
      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-primary-light rounded-xl border-l-4 border-primary text-xs">
          <div className="truncate">
            <span className="font-bold text-primary block">
              Replying to {replyingTo.sender?.username || 'Message'}
            </span>
            <span className="text-gray-600 truncate">{replyingTo.content}</span>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-line Input Box */}
      <div className="bg-white rounded-2xl border border-borderSubtle shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition">
        {/* Text Area with 500 char max */}
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          maxLength={500}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full px-4 pt-3 pb-1 text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent resize-none focus:outline-none"
        />

        {/* Bottom Toolbar inside input */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
          {/* Delete / Clear message button (kept as requested) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!text && !replyingTo}
              title="Clear message"
              className="px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear message</span>
            </button>
          </div>

          {/* Right side: 500 character counter and Send button */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs select-none tabular-nums font-medium ${
                text.length >= 500
                  ? 'text-red-500 font-bold'
                  : text.length > 450
                  ? 'text-amber-500'
                  : 'text-gray-400'
              }`}
              title="Character limit: 500"
            >
              {text.length}/500
            </span>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || text.length > 500}
              className="px-5 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary-hover active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
