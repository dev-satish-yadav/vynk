import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, Mic, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Message, Attachment } from '../../types';
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Trigger typing event
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
    setShowAttachMenu(false);

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

  return (
    <div className="bg-[#202c33] border-t border-[#2a3942] p-2.5 flex flex-col gap-1.5 z-10 flex-shrink-0">
      {/* Reply Quote Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#111b21] rounded-lg border-l-4 border-[#00a884]">
          <div className="text-xs truncate">
            <span className="font-semibold text-[#00a884] block">
              Replying to {replyingTo.sender?.username || 'Message'}
            </span>
            <span className="text-[#8696a0] truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-[#8696a0] hover:text-[#e9edef] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-2 overflow-x-auto pb-1">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1 bg-[#111b21] rounded-md text-xs border border-[#2a3942]">
              <span className="text-[#00a884] font-medium truncate max-w-[150px]">{att.fileName}</span>
              <button
                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                className="text-[#8696a0] hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end gap-2 px-1">
        {/* Emoji Trigger */}
        <button
          type="button"
          title="Emojis"
          className="p-2 text-[#8696a0] hover:text-[#e9edef] transition-colors rounded-full hover:bg-[#2a3942]"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Attachment Trigger & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            title="Attach file"
            className="p-2 text-[#8696a0] hover:text-[#e9edef] transition-colors rounded-full hover:bg-[#2a3942]"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 bg-[#202c33] border border-[#2a3942] rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-44 z-30">
              <label className="flex items-center gap-3 px-3 py-2 text-xs text-[#e9edef] hover:bg-[#2a3942] rounded-xl cursor-pointer">
                <ImageIcon className="w-4 h-4 text-[#00a884]" />
                Photos & Videos
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-3 px-3 py-2 text-xs text-[#e9edef] hover:bg-[#2a3942] rounded-xl cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                Document
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1 bg-[#2a3942] rounded-xl px-3.5 py-1.5 focus-within:ring-1 focus-within:ring-[#00a884]/60 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? 'Uploading attachment...' : 'Type a message...'}
            disabled={isUploading}
            className="w-full bg-transparent text-[14.5px] text-[#e9edef] placeholder-[#8696a0] resize-none focus:outline-none max-h-32 leading-5 align-middle"
          />
        </div>

        {/* Send / Mic Button */}
        {text.trim() || attachments.length > 0 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            title="Send Message"
            className="p-2.5 bg-[#00a884] hover:bg-[#06cf9c] text-black rounded-full shadow-md transition-transform active:scale-95"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            title="Voice Note"
            onClick={() => alert('Hold to record voice message (Phase 2 feature)')}
            className="p-2.5 text-[#8696a0] hover:text-[#e9edef] rounded-full hover:bg-[#2a3942] transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
