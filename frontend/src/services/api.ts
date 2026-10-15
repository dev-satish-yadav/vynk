import axios from 'axios';

// Dynamically use current hostname so mobile on local Wi-Fi automatically connects to your PC
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
export const SERVER_BASE_URL = `http://${host}:5000`;
export const API_BASE_URL = `${SERVER_BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vynk_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vynk_token');
      localStorage.removeItem('vynk_user');
    }
    return Promise.reject(error);
  }
);
