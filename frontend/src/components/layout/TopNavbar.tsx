import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface TopNavbarProps {
  onOpenProfile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenProfile }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#EBEEF5] flex items-center justify-between shrink-0 select-none z-20 shadow-sm">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#635BFF]/30">
          V
        </div>
        <span className="text-xl font-extrabold tracking-tight text-gray-900">Vynk</span>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-2 pl-2 group">
        <div
          onClick={onOpenProfile}
          title="Click to edit profile"
          className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-gray-100 cursor-pointer transition border border-transparent hover:border-gray-200"
        >
          <div className="relative shrink-0">
            <img
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#635BFF]/20 bg-gray-100"
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
              alt={user?.username || 'User'}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">
              {user?.username || 'User'}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">
              {user?.about || user?.email || 'Available'}
            </span>
          </div>

          <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 ml-0.5 hidden sm:inline-block" />
        </div>

        <button
          onClick={logout}
          title="Log out"
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
