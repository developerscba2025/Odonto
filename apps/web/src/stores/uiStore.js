import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUIStore = create()(persist((set) => ({
    isDarkMode: false,
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    setDarkMode: (value) => set({ isDarkMode: value }),
}), {
    name: 'dentalflow-ui-storage',
}));
