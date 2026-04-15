import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@dentalflow/shared';

interface AuthState {
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'dentalflow-auth' }
  )
);
