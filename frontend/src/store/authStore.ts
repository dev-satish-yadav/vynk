import { create } from 'zustand';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (loginIdentifier: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const getStoredToken = (): string | null => {
  const token = localStorage.getItem('vynk_token');
  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    localStorage.removeItem('vynk_token');
    return null;
  }
  return token;
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('vynk_user');
    if (!raw || raw === 'undefined' || raw === 'null') {
      localStorage.removeItem('vynk_user');
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.id) return null;
    return parsed;
  } catch {
    localStorage.removeItem('vynk_user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,

  login: async (loginIdentifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { loginIdentifier, password });
      const { user, token } = response.data.data;

      localStorage.setItem('vynk_token', token);
      localStorage.setItem('vynk_user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      socketService.connect(token);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('vynk_token', token);
      localStorage.setItem('vynk_user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      socketService.connect(token);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('vynk_token');
    localStorage.removeItem('vynk_user');
    socketService.disconnect();
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      get().logout();
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      localStorage.setItem('vynk_user', JSON.stringify(user));
      set({ user, token });
      socketService.connect(token);
    } catch (err) {
      get().logout();
    }
  },

  updateUser: (updatedFields) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updatedFields };
      localStorage.setItem('vynk_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));
