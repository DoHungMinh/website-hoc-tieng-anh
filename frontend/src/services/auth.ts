// API service cho authentication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role?: string;
  };
  token?: string;
  message?: string;
}

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Lỗi kết nối không xác định');
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Lỗi kết nối không xác định');
    }
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log('Logout error (non-critical):', error);
    } finally {
      localStorage.removeItem('token');
    }
  },
};
