import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, API_BASE_URL } from '../utils/constants';

interface User {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  phone?: string;
  birthDate?: string;
  bio?: string;
  learningGoal?: string;
  level?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User, token: string) => void;
  logout: () => void;
  forceLogout: (message?: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User, token: string) => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },

      logout: async () => {
        try {
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          if (token) {
            // Call logout API to set user offline
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Clear local storage and state regardless of API call result
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
        }
      },

      forceLogout: (message?: string) => {
        // Show notification if message provided
        if (message) {
          if (typeof window !== 'undefined') {
            // Create a simple notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-sm';
            notification.innerHTML = `
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${message}</span>
                <button class="ml-4 text-white hover:text-gray-200 text-lg font-bold" onclick="this.parentElement.parentElement.remove()">&times;</button>
              </div>
            `;
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
              if (notification.parentElement) {
                notification.remove();
              }
            }, 5000);
          }
        }
        
        // Force clear all auth data
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem('auth-storage');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        
        // Redirect to home
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
