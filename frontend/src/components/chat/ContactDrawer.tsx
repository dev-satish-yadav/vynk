import React from 'react';
import { UserCheck, FileText, Folder, Star, CloudDownload, X, Mail, Phone, AtSign, ChevronRight } from 'lucide-react';
import { Conversation, User } from '../../types';

interface ContactDrawerProps {
  conversation: Conversation;
  currentUserId: string;
  isOnline: boolean;
  onClose: () => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  conversation,
  currentUserId,
  isOnline,
  onClose,
}) => {
  const otherParticipant: User | undefined = conversation.isGroup
    ? undefined
    : conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0];

  const displayName = conversation.isGroup
    ? conversation.title || 'Group'
    : otherParticipant?.username || 'Contact';

  const avatar = conversation.isGroup
    ? conversation.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`
    : otherParticipant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

  return (
    <aside className="absolute xl:relative inset-y-0 right-0 w-full sm:w-[320px] xl:w-[300px] shrink-0 bg-[#F8F9FD] border-l border-[#EBEEF5] flex flex-col p-4 space-y-3 overflow-y-auto z-30 shadow-2xl xl:shadow-none">
      {/* Mobile close button */}
      <div className="flex xl:hidden items-center justify-between pb-2 border-b border-[#EBEEF5]">
        <span className="text-xs font-bold text-gray-800">Contact Details</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-500 hover:bg-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Contact Identity Card (Coordonnées) */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBEEF5] shadow-card space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <UserCheck className="w-4 h-4 text-[#635BFF]" />
          <span>Contact Details</span>
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <div className="relative shrink-0">
            <img
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#635BFF]/15"
              src={avatar}
              alt={displayName}
            />
            {!conversation.isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-gray-900 truncate">{displayName}</h3>
            <p className="text-[10px] text-gray-400 truncate">
              {conversation.isGroup
                ? `${conversation.participants.length} participants`
                : otherParticipant?.about || 'Product Lead at Castorama'}
            </p>
          </div>
        </div>

        <div className="pt-2.5 border-t border-gray-100 space-y-2 text-[11px] text-gray-600">
          <div className="flex items-center gap-2 text-gray-500 hover:text-[#635BFF] transition cursor-pointer truncate">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{otherParticipant?.email || `${displayName.toLowerCase()}@castorama.fr`}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>06 55 28 37 56</span>
          </div>
          <div className="flex items-center gap-2 text-[#635BFF] font-medium">
            <AtSign className="w-3.5 h-3.5 text-[#635BFF] shrink-0" />
            <span>@{displayName.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* 2. Notes Card */}
      <div
        onClick={() => alert('Personal notes for this contact')}
        className="p-3.5 rounded-2xl bg-white border border-[#EBEEF5] shadow-card flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
          <FileText className="w-4 h-4 text-gray-400" />
          <span>Notes</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>

      {/* 3. Shared Files */}
      <div
        onClick={() => alert('Shared files in this chat')}
        className="p-3.5 rounded-2xl bg-white border border-[#EBEEF5] shadow-card flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
          <Folder className="w-4 h-4 text-gray-400" />
          <span>Shared Files</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>

      {/* 4. Starred Messages */}
      <div
        onClick={() => alert('Starred messages in this conversation')}
        className="p-3.5 rounded-2xl bg-white border border-[#EBEEF5] shadow-card flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
          <Star className="w-4 h-4 text-gray-400" />
          <span>Starred Messages</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>

      {/* 5. Download Chat */}
      <div
        onClick={() => alert('Export conversation history')}
        className="p-3.5 rounded-2xl bg-white border border-[#EBEEF5] shadow-card flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800">
          <CloudDownload className="w-4 h-4 text-gray-400" />
          <span>Export Conversation</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </aside>
  );
};
