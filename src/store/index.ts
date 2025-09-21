// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  userInfo: any | null;
  isAuthenticated: boolean;
  setUserInfo: (userInfo: any) => void;
  logout: () => void;
}

export const useAppStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      isAuthenticated: false,
      setUserInfo: (userInfo: any) => 
        set({ userInfo, isAuthenticated: true }),
      
      logout: () => {
        // Clear the state first
        set({ userInfo: null, isAuthenticated: false });
        
        // Clear all possible storage locations
        if (typeof window !== 'undefined') {
          // Clear the specific persistent store
          localStorage.removeItem('auth-storage');
          sessionStorage.removeItem('auth-storage');
          
          // Clear any JWT tokens or other auth data
          const authKeys = [
            'token', 
            'accessToken', 
            'refreshToken', 
            'access_token',
            'user',
            'userInfo'
          ];
          
          authKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });

          // Force clear the entire localStorage if needed (optional)
          // localStorage.clear();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
