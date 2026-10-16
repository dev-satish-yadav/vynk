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
    setPassword('12345678');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-gradient-to-br from-[#E8E6FF] via-[#F5F4FF] to-[#E0DBFE]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accentMint/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/30 mb-3">
            V
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Welcome to Vynk</h1>
          <p className="text-xs text-gray-400 mt-1">Modern Real-Time Team Messaging Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username</label>
                <div className="flex items-center px-3.5 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl focus-within:border-primary focus-within:bg-white transition">
                  <UserIcon className="w-4 h-4 text-gray-400 mr-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="satish2000"
                    className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="flex items-center px-3.5 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl focus-within:border-primary focus-within:bg-white transition">
                  <Mail className="w-4 h-4 text-gray-400 mr-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="satish@example.com"
                    className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="flex items-center px-3.5 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl focus-within:border-primary focus-within:bg-white transition">
                <UserIcon className="w-4 h-4 text-gray-400 mr-2.5" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="flex items-center px-3.5 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl focus-within:border-primary focus-within:bg-white transition">
              <Lock className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-700 p-0.5 ml-1.5 focus:outline-none shrink-0"
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-primary/25 disabled:opacity-50 active:scale-[0.99] transition mt-2"
          >
            {isLoading ? 'Processing...' : isRegister ? 'Create Vynk Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Test Accounts Hint */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Test account shortcut:
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => fillDemoAccount('satish2000')}
              className="px-3 py-1 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
            >
              Fill satish2000
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
