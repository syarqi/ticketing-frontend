import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nst_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nst_token');
      localStorage.removeItem('nst_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  return fallback;
}
