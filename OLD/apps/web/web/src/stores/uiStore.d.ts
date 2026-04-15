interface UIState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}
export declare const useUIStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UIState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UIState, UIState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UIState) => void) => () => void;
        onFinishHydration: (fn: (state: UIState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UIState, UIState>>;
    };
}>;
export {};
