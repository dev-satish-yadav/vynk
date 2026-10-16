import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  MessageSquare,
  Zap,
  Users,
  CheckCheck,
  Radio,
  ArrowRight,
  LogOut,
  Sparkles,
  Lock,
  Smartphone,
  Settings,
  Trash2,
  Clock,
  ShieldCheck,
  Search,
  Camera,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

interface LandingPageProps {
  onOpenChat: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenChat,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, token, logout } = useAuthStore();
  const isLoggedIn = Boolean(token && user && user.id);

  // Auto-advancing slider moving right-to-left one by one
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const screens = [
    {
      id: 'chat',
      title: 'Screen 1: Direct Real-Time Chat Workspace',
      subtitle: 'Live 1-on-1 messaging with instant read receipts and typing feedback',
      badge: 'Real-Time Sync',
    },
    {
      id: 'groups',
      title: 'Screen 2: Dynamic Group Channels & Collaboration',
      subtitle: 'Multi-participant team channels with instant message broadcasts',
      badge: 'Group Channels',
    },
    {
      id: 'search',
      title: 'Screen 3: Instant Directory & Contact Search',
      subtitle: 'Quickly find contacts and initiate conversations with zero latency',
      badge: 'Directory Search',
    },
    {
      id: 'profile',
      title: 'Screen 4: Profile & Identity Customization',
      subtitle: 'Personalize your presence with avatars, bios, and live status',
      badge: 'Profile & Status',
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, screens.length]);

  const handlePrev = () => {
    setCurrentScreen((prev) => (prev === 0 ? screens.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentScreen((prev) => (prev + 1) % screens.length);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-gray-900 flex flex-col selection:bg-[#635BFF]/10 selection:text-[#635BFF]">
      {/* 1. TOP HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#635BFF]/30">
              V
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-gray-900">Vynk</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
                v2.0
              </span>
            </div>
          </div>

          {/* Center Navigation Links (desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#screens" className="hover:text-[#635BFF] transition">App Screens</a>
            <a href="#features" className="hover:text-[#635BFF] transition">Features</a>
            <a href="#security" className="hover:text-[#635BFF] transition">Security</a>
            <a href="#performance" className="hover:text-[#635BFF] transition">Performance</a>
          </nav>

          {/* Right: Auth Options / User Details */}
          <div className="flex items-center gap-3">
            {isLoggedIn && user ? (
              /* LOGGED IN: DISPLAY USER DETAILS & QUICK ACTIONS */
              <div className="flex items-center gap-2 sm:gap-3">
                {/* User Details Pill */}
                <div
                  onClick={onOpenProfile}
                  title="Click to view & edit profile"
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-[#635BFF]/40 hover:bg-white cursor-pointer transition shadow-xs group"
                >
                  <div className="relative shrink-0">
                    <img
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#635BFF]/20 bg-gray-100"
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.username}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                  </div>

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight group-hover:text-[#635BFF] transition">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[110px]">
                      {user.about || user.email || 'Online'}
                    </span>
                  </div>

                  <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#635BFF] hidden sm:inline-block ml-0.5" />
                </div>

                {/* Primary CTA: Open Chat */}
                <button
                  onClick={onOpenChat}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#635BFF]/25 hover:shadow-lg hover:shadow-[#635BFF]/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline-block" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 sm:p-2.5 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* NOT LOGGED IN: DISPLAY SIGN IN & LOGIN OPTIONS */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:text-[#635BFF] hover:bg-gray-50 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#635BFF]/25 hover:shadow-lg hover:shadow-[#635BFF]/30 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline-block" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#635BFF]/15 via-[#8F85FF]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/20 text-[#635BFF] text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Real-Time Messaging Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Connect, Chat & Collaborate <br className="hidden sm:inline" />
            with <span className="text-[#635BFF]">Absolute Speed & Control</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience ultra-responsive real-time communication with instant delivery, double blue read receipts, live presence, message privacy controls, contact discovery, and infinite chat history.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onOpenChat}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#635BFF] hover:bg-[#5248E5] text-white font-bold text-sm shadow-xl shadow-[#635BFF]/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch Chat Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenProfile}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm border border-gray-200 shadow-xs hover:border-gray-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Edit Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#635BFF] hover:bg-[#5248E5] text-white font-bold text-sm shadow-xl shadow-[#635BFF]/30 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Chatting Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 shadow-xs hover:border-gray-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In to Your Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3. APPLICATION SCREENS (ONE BY ONE AUTO-SLIDER MOVING RIGHT TO LEFT) */}
      <section id="screens" className="py-12 sm:py-20 bg-[#F8F9FD] border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Controls */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Application Interface Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
              Explore Every Angle of Vynk
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Gliding seamlessly through our 4 core application screens. Hover to pause or use the arrows.
            </p>

            {/* Slider Status Pill & Auto-play Toggle */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-xs">
                Screen {currentScreen + 1} of {screens.length} • {screens[currentScreen].badge}
              </span>

              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#635BFF] hover:border-[#635BFF]/30 transition shadow-xs cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* SLIDER VIEWPORT CONTAINER */}
          <div
            className="max-w-4xl mx-auto relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left Nav Arrow */}
            <button
              onClick={handlePrev}
              title="Previous Screen"
              className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/95 border border-gray-200/90 shadow-xl flex items-center justify-center text-gray-700 hover:text-[#635BFF] hover:scale-105 active:scale-95 transition cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={handleNext}
              title="Next Screen"
              className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/95 border border-gray-200/90 shadow-xl flex items-center justify-center text-gray-700 hover:text-[#635BFF] hover:scale-105 active:scale-95 transition cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Window Outer Card */}
            <div className="relative rounded-3xl bg-white border border-gray-200/90 shadow-2xl shadow-indigo-100 overflow-hidden text-left">
              {/* Window Title Bar */}
              <div className="h-12 px-5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-semibold text-gray-600 truncate max-w-[240px] sm:max-w-md">
                    {screens[currentScreen].title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-emerald-600 hidden sm:inline">Live Active</span>
                </div>
              </div>

              {/* HORIZONTAL CAROUSEL TRACK (SLIDES ONE BY ONE FROM RIGHT TO LEFT) */}
              <div className="overflow-hidden">
                <div
                  className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: `translateX(-${currentScreen * 100}%)` }}
                >
                  {/* SCREEN 1: DIRECT REAL-TIME CHAT WORKSPACE */}
                  <div className="w-full shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 min-h-[430px]">
                      {/* Left Mini Sidebar */}
                      <div className="hidden md:block border-r border-gray-100 p-3 bg-[#FAFBFD] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
                          <span>Conversations</span>
                          <Search className="w-3 h-3 text-gray-400" />
                        </div>
                        {/* Active Chat Item */}
                        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#635BFF]/30 shadow-xs">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-xs">
                              AL
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900 truncate">Alex Rivera</span>
                              <span className="text-[10px] text-gray-400">Just now</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate mt-0.5">
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                              <span className="truncate">Sounds great, see you there!</span>
                            </div>
                          </div>
                        </div>

                        {/* Chat Item 2 */}
                        <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-100/60 transition cursor-pointer">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              DS
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700 truncate">Design Squad</span>
                              <span className="text-[10px] text-gray-400">10:18 AM</span>
                            </div>
                            <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                              Sarah: Team sync at 4 PM
                            </span>
                          </div>
                        </div>

                        {/* Chat Item 3 with Deleted Message Tombstone */}
                        <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-100/60 transition cursor-pointer">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                              SY
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-300 rounded-full ring-2 ring-white"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700 truncate">Satish Yadav</span>
                              <span className="text-[10px] text-gray-400">Yesterday</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 italic truncate mt-0.5">
                              <Trash2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">This message was deleted</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Chat Messages Viewport */}
                      <div className="col-span-2 flex flex-col justify-between p-4 sm:p-5 bg-white">
                        {/* Header Bar */}
                        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-xs">
                                AL
                              </div>
                              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"></span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">Alex Rivera</p>
                              <p className="text-[10px] text-emerald-600 font-medium">Online</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">Direct Chat</span>
                        </div>

                        {/* Messages Stream */}
                        <div className="space-y-3 flex-1 py-3">
                          <div className="flex items-end gap-2.5 max-w-[85%]">
                            <div className="w-7 h-7 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-[10px] shrink-0">
                              AL
                            </div>
                            <div>
                              <div className="p-3.5 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 text-xs sm:text-[13px] font-medium leading-relaxed">
                                Hey! Have you tested the new message deletion controls and infinite scroll features?
                              </div>
                              <span className="text-[10px] text-gray-400 pl-1 mt-1 block">10:14 AM</span>
                            </div>
                          </div>

                          {/* Deleted Message Notice (Tombstone) */}
                          <div className="flex items-center gap-2 max-w-[85%] pl-9">
                            <div className="px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200/60 text-gray-400 text-[11px] italic flex items-center gap-1.5 select-none">
                              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                              <span>This message was deleted</span>
                            </div>
                          </div>

                          {/* Outgoing Message with Double Blue Tick */}
                          <div className="flex items-end gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
                            <div className="w-7 h-7 rounded-full bg-[#635BFF] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                              ME
                            </div>
                            <div className="text-right">
                              <div className="p-3.5 rounded-2xl rounded-br-sm bg-[#635BFF] text-white text-xs sm:text-[13px] font-medium leading-relaxed text-left shadow-md shadow-[#635BFF]/25">
                                Yes, works flawlessly! The instant read receipts, message deletion, and infinite history scroll update in real time without refreshing.
                              </div>
                              <div className="flex items-center gap-1.5 justify-end pr-1 mt-1 text-[10px] text-gray-400">
                                <span>10:16 AM</span>
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                              </div>
                            </div>
                          </div>

                          {/* Live Typing Indicator */}
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#635BFF] animate-pulse pl-1">
                            <Radio className="w-3.5 h-3.5" />
                            <span>Alex is typing...</span>
                          </div>
                        </div>

                        {/* Input Mockup Box */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-400 font-medium">Type a message...</div>
                          <button
                            onClick={isLoggedIn ? onOpenChat : () => onOpenAuth('login')}
                            className="px-4 py-1.5 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5248E5] transition cursor-pointer"
                          >
                            {isLoggedIn ? 'Go to Chat' : 'Sign In to Try'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SCREEN 2: GROUP CHANNELS & COLLABORATION */}
                  <div className="w-full shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[430px] p-6 gap-6 bg-[#FAFAFC]">
                      {/* Left: Modal Dialog Preview */}
                      <div className="rounded-2xl bg-white border border-gray-200/90 shadow-md p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900">Create New Group Channel</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#635BFF]/10 text-[#635BFF]">
                              3 Selected
                            </span>
                          </div>

                          {/* Group Title Field */}
                          <div className="mt-4">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                              Channel Name
                            </label>
                            <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800">
                              🚀 Product & Engineering
                            </div>
                          </div>

                          {/* Member Selection List */}
                          <div className="mt-4">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                              Select Participants
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/20">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-xs">
                                    AR
                                  </div>
                                  <span className="text-xs font-bold text-gray-800">Alex Rivera</span>
                                </div>
                                <Check className="w-4 h-4 text-[#635BFF]" />
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/20">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                    PS
                                  </div>
                                  <span className="text-xs font-bold text-gray-800">Priya Sharma</span>
                                </div>
                                <Check className="w-4 h-4 text-[#635BFF]" />
                              </div>

                              <div className="flex items-center justify-between p-2 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/20">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                                    DC
                                  </div>
                                  <span className="text-xs font-bold text-gray-800">David Chen</span>
                                </div>
                                <Check className="w-4 h-4 text-[#635BFF]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={isLoggedIn ? onOpenChat : () => onOpenAuth('login')}
                          className="mt-4 w-full py-2.5 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5248E5] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#635BFF]/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Group Channel</span>
                        </button>
                      </div>

                      {/* Right: Group Room Preview */}
                      <div className="rounded-2xl bg-white border border-gray-200/90 shadow-md p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635BFF] to-indigo-400 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              PE
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">Product & Engineering</p>
                              <p className="text-[10px] text-gray-400">4 members • Active conversation</p>
                            </div>
                          </div>

                          {/* Group Messages */}
                          <div className="mt-4 space-y-3">
                            <div className="flex items-start gap-2 max-w-[90%]">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                                PS
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-emerald-600 block">Priya Sharma</span>
                                <div className="p-2.5 rounded-xl bg-gray-100 text-gray-800 text-xs mt-0.5">
                                  Sprint demo is scheduled for today at 3:00 PM!
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 max-w-[90%]">
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                                DC
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-purple-600 block">David Chen</span>
                                <div className="p-2.5 rounded-xl bg-gray-100 text-gray-800 text-xs mt-0.5">
                                  All participants received the real-time notification immediately.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-400 flex items-center justify-between">
                          <span>Message #product-and-engineering</span>
                          <span className="text-[10px] font-bold text-[#635BFF]">Group Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SCREEN 3: INSTANT DIRECTORY & CONTACT SEARCH */}
                  <div className="w-full shrink-0">
                    <div className="min-h-[430px] p-6 bg-[#FAFAFC] flex flex-col justify-between">
                      <div>
                        {/* Search Bar Bar */}
                        <div className="max-w-xl mx-auto">
                          <h4 className="text-base font-bold text-gray-900 text-center mb-1">
                            Instant Contact & Directory Search
                          </h4>
                          <p className="text-xs text-gray-500 text-center mb-4">
                            Find team members across your workspace with instant debounce filtering.
                          </p>

                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              readOnly
                              value="alex"
                              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#635BFF]/10 text-[#635BFF] px-2 py-0.5 rounded-md">
                              3 matches
                            </span>
                          </div>
                        </div>

                        {/* Search Results List */}
                        <div className="mt-5 max-w-xl mx-auto space-y-2.5">
                          {/* Result 1 */}
                          <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between hover:border-[#635BFF]/40 transition">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-xs">
                                  AR
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-900">Alex Rivera</h5>
                                <p className="text-[11px] text-gray-500">Design systems lead & UI • Online</p>
                              </div>
                            </div>
                            <button
                              onClick={isLoggedIn ? onOpenChat : () => onOpenAuth('login')}
                              className="px-3 py-1.5 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5248E5] transition cursor-pointer"
                            >
                              Message
                            </button>
                          </div>

                          {/* Result 2 */}
                          <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between hover:border-[#635BFF]/40 transition">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                  AS
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-900">Alexa Smith</h5>
                                <p className="text-[11px] text-gray-500">Full-stack engineer • Online</p>
                              </div>
                            </div>
                            <button
                              onClick={isLoggedIn ? onOpenChat : () => onOpenAuth('login')}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-[#635BFF] hover:text-white transition cursor-pointer"
                            >
                              Message
                            </button>
                          </div>

                          {/* Result 3 */}
                          <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between hover:border-[#635BFF]/40 transition">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                                  AB
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-300 rounded-full ring-2 ring-white"></span>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-900">Alexander Brown</h5>
                                <p className="text-[11px] text-gray-500">Product Manager • Offline</p>
                              </div>
                            </div>
                            <button
                              onClick={isLoggedIn ? onOpenChat : () => onOpenAuth('login')}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-[#635BFF] hover:text-white transition cursor-pointer"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-center pt-3 text-[11px] text-gray-400">
                        ⚡ Direct contact discovery connects you to 1-on-1 conversations in a single click.
                      </div>
                    </div>
                  </div>

                  {/* SCREEN 4: USER PROFILE & IDENTITY CUSTOMIZATION */}
                  <div className="w-full shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[430px] p-6 gap-6 bg-[#FAFAFC]">
                      {/* Left: Profile Form Card */}
                      <div className="rounded-2xl bg-white border border-gray-200/90 shadow-md p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900">User Profile Settings</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Active Account
                            </span>
                          </div>

                          {/* Avatar Display & Randomizer */}
                          <div className="mt-4 flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                              <img
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=vynk-user-preview"
                                alt="Avatar Preview"
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#635BFF]/20 shadow-md bg-gray-50"
                              />
                              <div className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-5 h-5 mb-0.5" />
                                <span className="text-[9px] font-semibold">Change</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="mt-2 text-xs font-semibold text-[#635BFF] hover:text-[#5248E5] flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate Avatar</span>
                            </button>
                          </div>

                          {/* Profile Input Fields */}
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                Username
                              </label>
                              <div className="px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                                satish2000
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                Status & Bio
                              </label>
                              <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800">
                                Building ultra-fast real-time messaging apps ⚡
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={isLoggedIn ? onOpenProfile : () => onOpenAuth('login')}
                            className="flex-1 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5248E5] transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Save Profile</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: How Profile Appears to Other Users */}
                      <div className="rounded-2xl bg-white border border-gray-200/90 shadow-md p-5 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-100">
                            Public Presence Preview
                          </h4>

                          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-[#635BFF]/5 to-indigo-50/50 border border-[#635BFF]/20 text-center">
                            <div className="relative inline-block">
                              <img
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=vynk-user-preview"
                                alt="Avatar"
                                className="w-16 h-16 rounded-full mx-auto ring-4 ring-white shadow-md"
                              />
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                            </div>
                            <h3 className="mt-2 text-sm font-bold text-gray-900">satish2000</h3>
                            <p className="text-xs text-gray-500 max-w-[220px] mx-auto mt-0.5">
                              Building ultra-fast real-time messaging apps ⚡
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Online & Available</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-gray-500 leading-relaxed border border-gray-200/60">
                          💡 Your presence and avatar update across all conversations and group channels in real time.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDER PROGRESS DOTS / MINI STEPPERS */}
              <div className="py-3 px-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {screens.map((s, index) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentScreen(index)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentScreen === index
                          ? 'w-8 bg-[#635BFF]'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={`Go to ${s.title}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="hidden sm:inline">{screens[currentScreen].subtitle}</span>
                  <div className="flex items-center gap-1 text-[#635BFF] pl-2 font-bold cursor-pointer" onClick={handleNext}>
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Engineered for Modern Communication
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500">
              Built for instant delivery, complete conversation control, and uncompromising privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Instant Real-Time Sync</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Persistent live data pipelines ensure your messages, updates, and notifications land across devices instantaneously without manual refresh.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Message Control & Deletion</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Retract messages anytime with &quot;Delete for everyone&quot; or keep your personal feed tidy with &quot;Delete for me&quot; with complete synchronization.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#53bdeb] flex items-center justify-center mb-4">
                <CheckCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Live Read Receipts</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Clear single checkmark when your message is delivered, transitioning to real-time double blue checkmarks the moment it is opened.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Presence & Typing Indicators</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Instant green badges display live online status, paired with real-time dynamic typing feedback as your contacts compose messages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Infinite History Scroll</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Effortlessly glide through past conversations with smooth infinite pagination that preserves your exact scroll position without page jumps.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Instant Directory Search</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Quickly discover contacts and start conversations with real-time query filtering across your entire team.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Direct & Group Conversations</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Engage in private 1-on-1 conversations or create dynamic group channels with multiple participants for team collaboration.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Authenticated Privacy</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Cryptographically protected sessions, secure token validation, and hardened access controls to keep your personal chats private.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Responsive Across Devices</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Fluid cross-platform interface customized for smartphones, tablets, and full desktop displays with touch-ready drawers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY & TRUST SECTION */}
      <section id="security" className="py-16 sm:py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Privacy First</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Your Conversations Belong to You.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                We believe messaging should be private, secure, and under your command. Every message transmission, contact lookup, and session handshake is strictly authorized and protected.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">True Message Revocation</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Deleting a message for everyone wipes its payload immediately across all participant views.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Protected Token Sessions</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Stateless cryptographic tokens prevent session spoofing and enforce identity boundaries.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Verified Group Membership</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Strict authorization ensures only active channel members can read or transmit messages.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-center">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Message Privacy</p>
                      <p className="text-[11px] text-gray-500">Sender-driven deletion & redaction</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Active</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Real-Time Sync Engine</p>
                      <p className="text-[11px] text-gray-500">Zero-polling bidirectional streaming</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-1 rounded-lg">Operational</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Cursor History Navigation</p>
                      <p className="text-[11px] text-gray-500">Seamless infinite scroll & caching</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PERFORMANCE & METRICS BANNER */}
      <section id="performance" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-bold text-[#635BFF] bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                High-Performance Infrastructure
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-4 tracking-tight leading-snug">
                Built for High-Speed Communication
              </h2>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                Engineered with an ultra-responsive interface, high-throughput message streaming, and distributed clustering for continuous availability.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold">
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  ⚡ &lt; 50ms Latency
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  🔒 Granular Message Privacy
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  📡 Instant Real-Time Sync
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  ∞ Seamless Infinite Scroll
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto py-8 bg-white border-t border-gray-100 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <div className="w-6 h-6 rounded-lg bg-[#635BFF] flex items-center justify-center text-white text-xs font-black">
              V
            </div>
            <span>Vynk Messaging Platform</span>
          </div>
          <p>© 2026 Vynk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
