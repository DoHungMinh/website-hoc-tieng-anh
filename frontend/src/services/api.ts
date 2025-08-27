import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('english_learning_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
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

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('english_learning_user', JSON.stringify(response.data.user));
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
    localStorage.removeItem('english_learning_user');
    localStorage.removeItem('english_learning_refresh_token');

    return response;
  }

  // User methods
  async getProfile() {
    return this.request(API_ENDPOINTS.USER.PROFILE);
  }

  async updateProfile(profileData: any) {
    return this.request(API_ENDPOINTS.USER.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
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

  async updateProgress(progressData: any) {
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
  async sendMessage(message: string, type: string = 'general') {
    // Check if user is authenticated
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      // Use real data endpoint for authenticated users
      return this.request('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message, type }),
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
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      return this.request('/chatbot/analysis', {
        method: 'POST',
      });
    } else {
      return this.publicRequest('/chatbot/simple/analysis', {
        method: 'POST',
      });
    }
  }

  async generateLearningRecommendations() {
    const isAuthenticated = this.isAuthenticated();
    
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
    localStorage.setItem('english_learning_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('english_learning_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
