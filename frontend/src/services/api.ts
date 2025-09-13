import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { Toast } from '../utils/toast';

// Types for API responses
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Always get the latest token from localStorage
  this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // ALWAYS get fresh token from localStorage before making request
  this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('🚀 ApiService.request:', { 
      endpoint, 
      hasToken: !!this.token, 
      tokenPreview: this.token ? this.token.substring(0, 20) + '...' : 'null',
      headers: config.headers 
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle account disabled error (403) or unauthorized (401)
        if ((response.status === 403 || response.status === 401) && 
            (data.message?.includes('vô hiệu hóa') || data.message?.includes('disabled'))) {
          this.handleAccountDisabled(data.message);
          throw new Error(data.message || 'Account disabled');
        }
        
        // Handle general 401 unauthorized
        if (response.status === 401) {
          this.handleAccountDisabled('Phiên đăng nhập đã hết hạn hoặc tài khoản bị vô hiệu hóa');
          throw new Error('Unauthorized');
        }
        
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private handleAccountDisabled(message: string): void {
    // Chỉ show toast, không logout ngay - để heartbeat hook xử lý
    if (typeof window !== 'undefined') {
      Toast.error(message || 'Tài khoản đã bị vô hiệu hóa.', 3000);
    }
  }

  // Public request without authentication requirement
  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    type LoginLike = {
      success: boolean;
      token?: string;
      user?: unknown;
      data?: { token?: string; user?: unknown };
    };
    const resp = response as unknown as LoginLike;
    const token = resp.data?.token ?? resp.token;
    const user = resp.data?.user ?? resp.user;
    if (resp.success && token) {
      this.setToken(token);
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });

    this.removeToken();
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    return response;
  }

  // User methods
  async getProfile() {
    return this.request(API_ENDPOINTS.USER.PROFILE);
  }

  async updateProfile(profileData: Record<string, unknown>) {
    return this.request(API_ENDPOINTS.USER.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Assessment methods
  async createAssessment(type: 'placement' | 'progress' | 'final') {
    return this.request(API_ENDPOINTS.ASSESSMENT.CREATE, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async startAssessment(assessmentId: string) {
    return this.request(`${API_ENDPOINTS.ASSESSMENT.START}/${assessmentId}`, {
      method: 'POST',
    });
  }

  async submitAnswer(assessmentId: string, questionId: string, answer: number) {
    return this.request(API_ENDPOINTS.ASSESSMENT.SUBMIT_ANSWER, {
      method: 'POST',
      body: JSON.stringify({ assessmentId, questionId, selectedAnswer: answer }),
    });
  }

  async completeAssessment(assessmentId: string) {
    return this.request(`${API_ENDPOINTS.ASSESSMENT.COMPLETE}/${assessmentId}`, {
      method: 'POST',
    });
  }

  async getAssessmentResults(assessmentId: string) {
    return this.request(`${API_ENDPOINTS.ASSESSMENT.RESULTS}/${assessmentId}`);
  }

  // Progress methods
  async getProgress() {
    return this.request(API_ENDPOINTS.PROGRESS.GET);
  }

  async updateProgress(progressData: Record<string, unknown>) {
    return this.request(API_ENDPOINTS.PROGRESS.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  async getWeeklyActivity() {
    return this.request(API_ENDPOINTS.PROGRESS.WEEKLY_ACTIVITY);
  }

  // Learning methods
  async getLessons(level?: string, type?: string) {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.LEARNING.LESSONS}?${queryString}` : API_ENDPOINTS.LEARNING.LESSONS;
    
    return this.request(endpoint);
  }

  async getLessonDetail(lessonId: string) {
    return this.request(`${API_ENDPOINTS.LEARNING.LESSON_DETAIL}/${lessonId}`);
  }

  async completeLesson(lessonId: string, score?: number) {
    return this.request(API_ENDPOINTS.LEARNING.COMPLETE_LESSON, {
      method: 'POST',
      body: JSON.stringify({ lessonId, score }),
    });
  }

  async getRecommendations() {
    return this.request(API_ENDPOINTS.LEARNING.RECOMMENDATIONS);
  }

  // Chatbot methods - Smart routing based on authentication
  async sendMessage(message: string, type: string = 'general', sessionId?: string) {
    // Check if user is authenticated by checking localStorage token directly
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isAuthenticated = !!token;
    
    console.log('🤖 ApiService.sendMessage:', { 
      isAuthenticated, 
      token: token ? 'exists' : 'null',
      sessionId: sessionId || 'none',
      endpoint: isAuthenticated ? '/chatbot/message' : '/chatbot/simple/message' 
    });
    
    if (isAuthenticated) {
      // Use real data endpoint for authenticated users
      return this.request('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message, type, sessionId }),
      });
    } else {
      // Use simple endpoint for guests
      return this.publicRequest('/chatbot/simple/message', {
        method: 'POST',
        body: JSON.stringify({ message, type }),
      });
    }
  }

  async generateProgressAnalysis() {
    // Check if user is authenticated by checking localStorage token directly
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    const isAuthenticated = !!token;
    
    console.log('📊 ApiService.generateProgressAnalysis DEBUG:', { 
      isAuthenticated, 
      token: token ? `${token.substring(0, 20)}...` : 'null',
      user: user ? 'exists' : 'null',
      endpoint: isAuthenticated ? '/chatbot/analysis' : '/chatbot/simple/analysis',
      STORAGE_KEYS,
      localStorage_keys: Object.keys(localStorage)
    });
    
    if (isAuthenticated) {
      console.log('🔄 Using REAL DATA endpoint: /chatbot/analysis');
      return this.request('/chatbot/analysis', {
        method: 'POST',
      });
    } else {
      console.log('🔄 Using FAKE DATA endpoint: /chatbot/simple/analysis');
      return this.publicRequest('/chatbot/simple/analysis', {
        method: 'POST',
      });
    }
  }

  async generateLearningRecommendations() {
    // Check if user is authenticated by checking localStorage token directly
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isAuthenticated = !!token;
    
    console.log('💡 ApiService.generateLearningRecommendations:', { 
      isAuthenticated, 
      token: token ? 'exists' : 'null',
      endpoint: isAuthenticated ? '/chatbot/recommendations' : '/chatbot/simple/recommendations' 
    });
    
    if (isAuthenticated) {
      return this.request('/chatbot/recommendations', {
        method: 'POST',
      });
    } else {
      return this.publicRequest('/chatbot/simple/recommendations', {
        method: 'POST',
      });
    }
  }

  // Legacy methods for backward compatibility
  async getChatHistory(limit?: number, page?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/chatbot/history?${queryString}` : '/chatbot/history';
    
    return this.request(endpoint); // Requires auth
  }

  async getChatSession(sessionId: string) {
    return this.request(`/chatbot/session/${sessionId}`); // Requires auth
  }

  async generateAssessmentFeedback(assessmentId: string) {
    return this.publicRequest(`/chatbot/feedback/${assessmentId}`, {
      method: 'POST',
    });
  }

  async clearChatHistory() {
    return this.request('/chatbot/history', {
      method: 'DELETE',
    }); // Requires auth
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  removeToken() {
    this.token = null;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  isAuthenticated(): boolean {
    // Always check localStorage for the most current token
  this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
