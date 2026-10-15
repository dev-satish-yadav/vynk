import React from 'react';
import { X, Bell, BellOff, ShieldAlert, Image, FileText, Lock, Users } from 'lucide-react';
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
    ? conversation.title || 'Group Info'
    : otherParticipant?.username || 'Contact Info';

  const avatar = conversation.isGroup
    ? conversation.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.id}`
    : otherParticipant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`;

  return (
    <aside className="absolute md:relative inset-0 md:inset-auto w-full md:w-[340px] bg-[#111b21] border-l border-[#202c33] flex flex-col h-full overflow-y-auto select-none flex-shrink-0 z-30">
      {/* Header */}
      <div className="h-16 px-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#e9edef]">
          {conversation.isGroup ? 'Group info' : 'Contact info'}
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Details Card */}
        <div className="bg-[#182229] rounded-2xl p-6 flex flex-col items-center text-center border border-[#2a3942]/40 shadow-sm">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#2a3942] bg-[#202c33]">
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            </div>
            {!conversation.isGroup && isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00a884] ring-2 ring-[#182229]" />
            )}
          </div>
          <h2 className="text-lg font-bold text-[#e9edef]">{displayName}</h2>
          <p className="text-xs text-[#8696a0] mt-0.5">
            {conversation.isGroup
              ? `${conversation.participants.length} members`
              : otherParticipant?.email}
          </p>
        </div>

        {/* About / Bio */}
        {!conversation.isGroup && (
          <div className="bg-[#182229] rounded-2xl p-4 border border-[#2a3942]/40">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
              About
            </h4>
            <p className="text-sm text-[#e9edef]">{otherParticipant?.about || 'Hey there! I am using Vynk.'}</p>
          </div>
        )}

        {/* Group Participants List */}
        {conversation.isGroup && (
          <div className="bg-[#182229] rounded-2xl p-4 border border-[#2a3942]/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {conversation.participants.length} Participants
              </h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {conversation.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                      alt={p.username}
                      className="w-7 h-7 rounded-full object-cover border border-[#2a3942]"
                    />
                    <span className="text-xs font-medium text-[#e9edef]">
                      {p.id === currentUserId ? 'You' : p.username}
                    </span>
                  </div>
                  {p.id === conversation.createdById && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00a884]/20 text-[#00a884] font-semibold">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media & Docs Summary */}
        <div className="bg-[#182229] rounded-2xl p-4 border border-[#2a3942]/40 space-y-3">
          <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
            Media, Links and Docs
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202c33] text-[#8696a0]">
              <Image className="w-4 h-4 text-[#00a884]" />
              <span>Media</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202c33] text-[#8696a0]">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Documents</span>
            </div>
          </div>
        </div>

        {/* Security & Encryption Info */}
        <div className="bg-[#182229] rounded-2xl p-4 border border-[#2a3942]/40 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#00a884] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-[#e9edef] block mb-0.5">Encryption</span>
            <span className="text-[#8696a0]">Messages and calls are end-to-end encrypted. Tap to verify.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#182229] rounded-2xl p-2 border border-[#2a3942]/40 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#e9edef] hover:bg-[#202c33] rounded-xl transition-colors">
            <BellOff className="w-4 h-4 text-[#8696a0]" />
            Mute notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-[#202c33] rounded-xl transition-colors">
            <ShieldAlert className="w-4 h-4" />
            Block & Report
          </button>
        </div>
      </div>
    </aside>
  );
};
