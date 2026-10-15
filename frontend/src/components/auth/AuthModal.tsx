import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Lock, Mail, User as UserIcon, Sparkles, Eye, EyeOff } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!username || !email || !password) return;
      await register(username.trim(), email.trim(), password);
    } else {
      if (!loginUsername || !password) return;
      await login(loginUsername.trim(), password);
    }
  };

  const fillDemoAccount = (name: string) => {
    setIsRegister(false);
    setLoginUsername(name.toLowerCase());
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1317] p-3 sm:p-4 overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00a884]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00a884] to-[#06cf9c] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#00a884]/25 mb-3">
            V
          </div>
          <h1 className="text-2xl font-bold text-[#e9edef] tracking-tight">Welcome to Vynk</h1>
          <p className="text-xs text-[#8696a0] mt-1">Real-Time Messaging with WhatsApp Web Experience</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#202c33] p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              !isRegister ? 'bg-[#00a884] text-black' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isRegister ? 'bg-[#00a884] text-black' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-medium text-[#8696a0] mb-1">Username</label>
                <div className="flex items-center px-3.5 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl focus-within:border-[#00a884]">
                  <UserIcon className="w-4 h-4 text-[#8696a0] mr-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. satish"
                    className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8696a0] mb-1">Email Address</label>
                <div className="flex items-center px-3.5 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl focus-within:border-[#00a884]">
                  <Mail className="w-4 h-4 text-[#8696a0] mr-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="satish@example.com"
                    className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1">Username or Email</label>
              <div className="flex items-center px-3.5 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl focus-within:border-[#00a884]">
                <UserIcon className="w-4 h-4 text-[#8696a0] mr-2.5" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#8696a0] mb-1">Password</label>
            <div className="flex items-center px-3.5 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl focus-within:border-[#00a884]">
              <Lock className="w-4 h-4 text-[#8696a0] mr-2.5 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#8696a0] hover:text-[#e9edef] transition-colors p-0.5 ml-1.5 focus:outline-none flex-shrink-0"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#00a884] hover:bg-[#06cf9c] text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#00a884]/20 disabled:opacity-50 active:scale-[0.99] mt-2"
          >
            {isLoading ? 'Processing...' : isRegister ? 'Create Vynk Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Test Accounts Hint */}
        <div className="mt-6 pt-5 border-t border-[#2a3942]/60 text-center">
          <p className="text-xs text-[#8696a0] flex items-center justify-center gap-1.5 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#00a884]" /> Quick testing demo accounts:
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => fillDemoAccount('alice')}
              className="px-2.5 py-1 rounded bg-[#202c33] text-xs text-[#e9edef] hover:bg-[#2a3942] border border-[#2a3942]"
            >
              Fill Alice
            </button>
            <button
              onClick={() => fillDemoAccount('bob')}
              className="px-2.5 py-1 rounded bg-[#202c33] text-xs text-[#e9edef] hover:bg-[#2a3942] border border-[#2a3942]"
            >
              Fill Bob
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
