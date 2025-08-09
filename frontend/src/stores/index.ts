import { create } from 'zustand';
import { User, Progress, ChatMessage } from '../types';
import { apiService } from '../services/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ProgressStore {
  progress: Progress | null;
  isLoading: boolean;
  fetchProgress: () => Promise<void>;
  updateProgress: (data: Partial<Progress>) => void;
}

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  clearMessages: () => void;
}

// Auth Store
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        const userData = response.data as { user: User; token: string };
        set({ 
          user: userData.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await apiService.register(userData);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      // Even if logout fails, clear local state
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false });
  }
}));

// Progress Store
export const useProgressStore = create<ProgressStore>((set) => ({
  progress: null,
  isLoading: false,

  fetchProgress: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getProgress();
      if (response.success) {
        set({ progress: response.data as Progress, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch progress:', error);
    }
  },

  updateProgress: (data: Partial<Progress>) => {
    set((state) => ({
      progress: state.progress ? { ...state.progress, ...data } : null
    }));
  }
}));

// Chat Store
export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [
    {
      id: '1',
      text: 'Xin chào! Tôi là AI Assistant của EnglishPro. Tôi có thể giúp bạn luyện tập tiếng Anh, giải đáp thắc mắc và hỗ trợ học tập. Bạn muốn bắt đầu với gì?',
      isBot: true,
      timestamp: new Date().toISOString()
    }
  ],
  isTyping: false,
  isConnected: false,

  sendMessage: async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    // Add user message
    set((state) => ({
      messages: [...state.messages, userMessage]
    }));

    // Set typing indicator
    set({ isTyping: true });

    try {
      const response = await apiService.sendMessage(message);
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || 'Xin lỗi, tôi không thể xử lý tin nhắn này lúc này.',
        isBot: true,
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isTyping: false
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
        isBot: true,
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false
      }));
    }
  },

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  setTyping: (isTyping: boolean) => {
    set({ isTyping });
  },

  setConnected: (isConnected: boolean) => {
    set({ isConnected });
  },

  clearMessages: () => {
    set({ 
      messages: [{
        id: '1',
        text: 'Xin chào! Tôi là AI Assistant của EnglishPro. Tôi có thể giúp bạn luyện tập tiếng Anh, giải đáp thắc mắc và hỗ trợ học tập. Bạn muốn bắt đầu với gì?',
        isBot: true,
        timestamp: new Date().toISOString()
      }]
    });
  }
}));

// Initialize auth state from localStorage
const initializeAuth = () => {
  const token = localStorage.getItem('english_learning_token');
  const userStr = localStorage.getItem('english_learning_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      useAuthStore.getState().setUser(user);
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('english_learning_token');
      localStorage.removeItem('english_learning_user');
    }
  }
};

// Initialize auth state
initializeAuth();
