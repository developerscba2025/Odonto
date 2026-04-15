import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function ProtectedRoute() {
  const { user, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get('/auth/me');
        setAuth(response.data);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [setAuth, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl" />
          <p className="text-text-secondary font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
