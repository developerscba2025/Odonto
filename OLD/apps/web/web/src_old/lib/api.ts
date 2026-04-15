import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auto-logout on 401 and toast on other errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else {
      const message = error.response?.data?.error || 'Ocurrió un error inesperado';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
