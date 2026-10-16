import React from 'react';
import { Reply, FileText, Download, Check, CheckCheck, Trash2, Ban } from 'lucide-react';
import { Message } from '../../types';
import { format } from 'date-fns';
import { SERVER_BASE_URL } from '../../services/api';

interface MessageBubbleProps {
  message: Message;
  isSentByMe: boolean;
  showSenderName: boolean;
  onReply: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSentByMe,
  showSenderName,
  onReply,
  onDelete,
}) => {
  const formattedTime = format(new Date(message.createdAt), 'h:mm a');
  const isDeleted = !!message.isDeletedEveryone;

  const senderAvatar =
    message.sender?.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${message.sender?.username || 'user'}`;

  return (
    <div
      className={`group flex items-end gap-2.5 max-w-[85%] sm:max-w-[70%] mb-3 ${
        isSentByMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* User Avatar */}
      <img
        src={senderAvatar}
        alt={message.sender?.username || 'user'}
        className={`w-7 h-7 rounded-full object-cover shrink-0 ring-1 ${
          isSentByMe ? 'ring-primary/30' : 'ring-gray-200'
        }`}
      />

      {/* Bubble + Timestamp */}
      <div className="flex flex-col min-w-0">
        {/* Group Sender Name */}
        {showSenderName && !isSentByMe && message.sender && !isDeleted && (
          <span className="text-[11px] font-bold text-primary mb-1 pl-1">
            {message.sender.username}
          </span>
        )}

        {/* Quoted Message Preview */}
        {!isDeleted && message.replyTo && (
          <div
            className={`mb-1 p-2 rounded-xl text-xs border-l-4 text-left ${
              isSentByMe
                ? 'bg-purple-900/20 border-white text-white/90'
                : 'bg-gray-100 border-primary text-gray-700'
            }`}
          >
            <span className="font-bold text-[10px] block opacity-80">
              {message.replyTo.sender?.username || 'Message'}
            </span>
            <p className="truncate text-[11px]">{message.replyTo.content}</p>
          </div>
        )}

        {/* Bubble Box */}
        <div
          className={`relative p-3.5 text-xs sm:text-[13px] font-medium leading-relaxed break-words select-text text-left ${
            isDeleted
              ? 'rounded-2xl bg-gray-100 text-gray-500 border border-gray-200/80 shadow-none'
              : isSentByMe
              ? 'rounded-2xl rounded-br-sm bg-[#635BFF] text-white shadow-md shadow-primary/25'
              : 'rounded-2xl rounded-bl-sm bg-white text-gray-900 border border-borderSubtle shadow-bubble'
          }`}
        >
          {/* Deleted Message State */}
          {isDeleted ? (
            <div className="flex items-center gap-2 italic text-xs text-gray-500 select-none py-0.5">
              <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>This message was deleted</span>
            </div>
          ) : (
            <>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {message.attachments.map((att) => {
                    const isImage = att.fileType.startsWith('image/');
                    return isImage ? (
                      <div key={att.id} className="rounded-xl overflow-hidden max-h-60 border border-black/10">
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
                        className={`flex items-center justify-between p-2 rounded-xl gap-3 ${
                          isSentByMe ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 shrink-0 text-primary" />
                          <div className="truncate">
                            <p className="font-medium text-xs truncate">{att.fileName}</p>
                            <span className="text-[10px] opacity-70">
                              {(att.fileSize / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <a
                          href={`${SERVER_BASE_URL}${att.fileUrl}`}
                          download
                          className="p-1 rounded-full hover:bg-black/10"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Text */}
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Quick actions: Reply & Delete */}
              <div
                className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 p-0.5 rounded-full shadow-xs ${
                  isSentByMe
                    ? 'bg-[#5248E5]/90 text-white'
                    : 'bg-white/95 text-gray-600 border border-borderSubtle'
                }`}
              >
                <button
                  onClick={() => onReply(message)}
                  title="Reply"
                  className="p-1 rounded-full hover:bg-black/10 transition cursor-pointer"
                >
                  <Reply className="w-3 h-3" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(message)}
                    title="Delete message"
                    className="p-1 rounded-full hover:bg-red-500 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div
          className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 select-none ${
            isSentByMe ? 'justify-end pr-1' : 'justify-start pl-1'
          }`}
        >
          <span>{formattedTime}</span>
          {isSentByMe && !isDeleted && (
            <span
              className="inline-flex items-center"
              title={
                message.status === 'read'
                  ? 'Read'
                  : message.status === 'delivered'
                  ? 'Delivered'
                  : 'Sent'
              }
            >
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
