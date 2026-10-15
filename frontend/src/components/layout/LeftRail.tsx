import React from 'react';
import { MessageSquare, CircleDashed, Users2, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface LeftRailProps {
  onOpenSettings?: () => void;
}

export const LeftRail: React.FC<LeftRailProps> = () => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden md:flex w-16 bg-[#202c33] border-r border-[#2a3942] flex-col justify-between items-center py-3 select-none flex-shrink-0 z-20">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* App Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00a884] to-[#06cf9c] flex items-center justify-center text-white shadow-lg shadow-[#00a884]/20 cursor-pointer mb-2">
          <span className="font-bold text-lg tracking-wider">V</span>
        </div>

        {/* Chats (Active) */}
        <button
          title="Chats"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2a3942] text-[#00a884] transition-colors relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884]" />
        </button>

        {/* Status / Stories */}
        <button
          title="Status"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
        >
          <CircleDashed className="w-5 h-5" />
        </button>

        {/* Communities / Groups */}
        <button
          title="Communities"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
        >
          <Users2 className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          title="Settings"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={logout}
          title="Log Out"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#8696a0] hover:text-red-400 hover:bg-[#2a3942] transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div
          title={user?.username || 'My Profile'}
          className="relative w-10 h-10 rounded-full overflow-hidden border border-[#2a3942] cursor-pointer hover:ring-2 hover:ring-[#00a884] transition-all"
        >
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
            alt={user?.username}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] ring-2 ring-[#202c33]" />
        </div>
      </div>
    </aside>
  );
};
