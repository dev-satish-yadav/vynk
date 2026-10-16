import React from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  MessageSquare,
  Shield,
  Zap,
  Users,
  CheckCheck,
  Radio,
  ArrowRight,
  LogOut,
  Sparkles,
  Lock,
  Smartphone,
  Layers,
  Settings,
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
            <a href="#features" className="hover:text-[#635BFF] transition">Features</a>
            <a href="#preview" className="hover:text-[#635BFF] transition">Live Preview</a>
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
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#635BFF]/15 via-[#8F85FF]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/20 text-[#635BFF] text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ultra-Fast Real-Time Messaging Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Connect, Chat & Collaborate <br className="hidden sm:inline" />
            with <span className="text-[#635BFF]">Instant Speed</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience ultra-fast real-time messaging with live online presence, single and double blue read receipts, rich multi-line conversations, and seamless group collaboration.
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
                  <span>Sign In with Username</span>
                </button>
              </>
            )}
          </div>

          {/* 3. INTERACTIVE CHAT UI PREVIEW MOCKUP */}
          <div id="preview" className="mt-14 max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-white border border-gray-200/90 shadow-2xl shadow-indigo-100 overflow-hidden text-left">
              {/* Window Title Bar */}
              <div className="h-12 px-5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-semibold text-gray-500">Vynk Real-Time Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-emerald-600">Live Active</span>
                </div>
              </div>

              {/* Chat Interface Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[380px]">
                {/* Left Mini Sidebar */}
                <div className="hidden md:block border-r border-gray-100 p-3 bg-[#FAFBFD] space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
                    Conversations
                  </div>
                  {/* Chat Item 1 (Active) */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#635BFF]/30 shadow-xs">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-xs">
                        TY
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">test007</span>
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
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        SY
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-300 rounded-full ring-2 ring-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 truncate">satish2000</span>
                        <span className="text-[10px] text-gray-400">10:18 AM</span>
                      </div>
                      <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                        I'm here
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Chat Messages Viewport */}
                <div className="col-span-2 flex flex-col justify-between p-4 sm:p-5 bg-white">
                  {/* Messages Stream */}
                  <div className="space-y-3.5 flex-1">
                    {/* Incoming Message */}
                    <div className="flex items-end gap-2.5 max-w-[80%]">
                      <div className="w-7 h-7 rounded-full bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center text-[10px] shrink-0">
                        TY
                      </div>
                      <div>
                        <div className="p-3.5 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 text-xs sm:text-[13px] font-medium leading-relaxed">
                          Hey! Have you tested the new instant read receipts and presence features?
                        </div>
                        <span className="text-[10px] text-gray-400 pl-1 mt-1 block">10:15 AM</span>
                      </div>
                    </div>

                    {/* Outgoing Message with Double Blue Tick */}
                    <div className="flex items-end gap-2.5 max-w-[80%] ml-auto flex-row-reverse">
                      <div className="w-7 h-7 rounded-full bg-[#635BFF] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        ME
                      </div>
                      <div className="text-right">
                        <div className="p-3.5 rounded-2xl rounded-br-sm bg-[#635BFF] text-white text-xs sm:text-[13px] font-medium leading-relaxed text-left shadow-md shadow-[#635BFF]/25">
                          Yes! Everything updates in real time with single tick for sent and double blue tick for read.
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
                      <span>test007 is typing...</span>
                    </div>
                  </div>

                  {/* Input Mockup Box */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400 font-medium">Type a message (max 500 characters)...</div>
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
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Engineered for Modern Communication
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500">
              Built for speed, simplicity, and rock-solid reliability across every conversation.
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
                Persistent live connections ensure messages and updates are delivered instantly without delays or manual refreshing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#53bdeb] flex items-center justify-center mb-4">
                <CheckCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Smart Read Receipts</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Accurate single checkmark for sent messages and real-time double blue checkmarks when opened by the recipient.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Live Presence & Typing</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Know when contacts are active with real-time online status and live typing feedback directly in the conversation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Direct & Group Messaging</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Engage in private 1-on-1 conversations or create dynamic group channels with multiple participants.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Encrypted session authentication with secure password protection and private conversations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:border-[#635BFF]/30 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Responsive Experience</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Adaptive user interface designed for mobile phones, tablets, and full desktop displays with touch drawers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PERFORMANCE & METRICS BANNER */}
      <section id="performance" className="py-16 bg-white">
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
                Designed with an ultra-responsive interface, high-throughput message streaming, and distributed session clustering for maximum reliability.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold">
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  ⚡ &lt; 50ms Latency
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  🔒 Enterprise Security
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">
                  📡 Instant Sync
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
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
