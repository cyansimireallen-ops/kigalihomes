import axios from 'axios';

// In dev, VITE_API_URL is unset, so baseURL is just '/api' and Vite's proxy
// (see vite.config.js) forwards it to the local backend. In production, set
// VITE_API_URL to your deployed backend's URL (e.g. https://your-api.onrender.com)
// as a build-time environment variable on your hosting provider.
const API_ORIGIN = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;