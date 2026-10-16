import React, { useState, useRef } from 'react';
import { Paperclip, Link as LinkIcon, Smile, MoreHorizontal, Trash2, Send, X } from 'lucide-react';
import { Message } from '../../types';
import { api } from '../../services/api';

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
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

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
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text.trim(), replyingTo?.id, attachments);
    setText('');
    setAttachments([]);
    onCancelReply();
    onTypingStop();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAttachments((prev) => [...prev, res.data.data]);
    } catch (err: any) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setText('');
    setAttachments([]);
    onCancelReply();
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

      {/* Attachments preview list */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
            >
              <span className="truncate max-w-[140px] font-medium">{att.fileName}</span>
              <button
                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rich Multi-line Input Box as seen in screenshot */}
      <div className="bg-white rounded-2xl border border-borderSubtle shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isUploading ? 'Uploading file...' : 'Type a message...'}
          disabled={isUploading}
          className="w-full px-4 pt-3 pb-1 text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent resize-none focus:outline-none"
        />

        {/* Bottom Toolbar inside input */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
          {/* Formatting & Attachment icons */}
          <div className="flex items-center gap-3 sm:gap-4 text-gray-500">
            <button
              type="button"
              title="Text Formatting"
              className="hover:text-primary transition font-bold text-sm px-1"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File"
              className="hover:text-primary transition"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              title="Insert Link"
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) setText((prev) => `${prev} ${url}`);
              }}
              className="hover:text-primary transition"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Emoji"
              onClick={() => setText((prev) => `${prev} 😊`)}
              className="hover:text-primary transition"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="More Options"
              className="hover:text-primary transition hidden sm:inline-flex"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-gray-200"></div>

            <button
              type="button"
              onClick={handleClear}
              title="Clear Message"
              className="hover:text-red-500 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || (!text.trim() && attachments.length === 0)}
            className="px-5 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary-hover active:scale-95 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
