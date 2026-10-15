import React from 'react';
import { Check, CheckCheck, Reply, FileText, Download } from 'lucide-react';
import { Message } from '../../types';
import { format } from 'date-fns';
import { SERVER_BASE_URL } from '../../services/api';

interface MessageBubbleProps {
  message: Message;
  isSentByMe: boolean;
  showSenderName: boolean;
  onReply: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSentByMe,
  showSenderName,
  onReply,
}) => {
  const formattedTime = format(new Date(message.createdAt), 'h:mm a');

  return (
    <div
      className={`group relative flex mb-1.5 px-2 sm:px-4 ${
        isSentByMe ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Bubble Container */}
      <div
        className={`relative max-w-[90%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-3 py-1.5 shadow-sm text-[14px] leading-relaxed transition-all ${
          isSentByMe
            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
        }`}
      >
        {/* Group Sender Name */}
        {showSenderName && !isSentByMe && message.sender && (
          <p className="text-xs font-bold text-[#00a884] mb-1">
            {message.sender.username}
          </p>
        )}

        {/* Quoted / Reply Preview */}
        {message.replyTo && (
          <div className="mb-1.5 p-1.5 rounded-lg bg-black/20 border-l-4 border-[#00a884] text-xs">
            <span className="font-semibold text-[#00a884] block">
              {message.replyTo.sender?.username || 'Message'}
            </span>
            <p className="text-[#8696a0] truncate line-clamp-1">{message.replyTo.content}</p>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-1.5 mb-1.5">
            {message.attachments.map((att) => {
              const isImage = att.fileType.startsWith('image/');
              return isImage ? (
                <div key={att.id} className="rounded-lg overflow-hidden max-h-64 border border-black/10">
                  <img
                    src={`${SERVER_BASE_URL}${att.fileUrl}`}
                    alt={att.fileName}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95"
                    onClick={() => window.open(`${SERVER_BASE_URL}${att.fileUrl}`, '_blank')}
                  />
                </div>
              ) : (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 gap-3"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-[#00a884] flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-xs truncate">{att.fileName}</p>
                      <span className="text-[10px] text-[#8696a0]">
                        {(att.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <a
                    href={`${SERVER_BASE_URL}${att.fileUrl}`}
                    download
                    className="p-1.5 rounded-full hover:bg-black/30 text-[#8696a0] hover:text-[#e9edef]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Text Content */}
        <p className="break-words whitespace-pre-wrap">{message.content}</p>

        {/* Timestamp and Read Status */}
        <div className="flex items-center justify-end gap-1 mt-0.5 select-none float-right ml-3 -mb-0.5">
          <span className="text-[11px] text-[#8696a0] leading-none">{formattedTime}</span>
          {isSentByMe && (
            <span className="ml-0.5 inline-block">
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#8696a0]" />
              )}
            </span>
          )}
        </div>

        {/* Quick Reply Button on Hover */}
        <button
          onClick={() => onReply(message)}
          title="Reply"
          className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202c33] border border-[#2a3942] p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] shadow-md"
        >
          <Reply className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
