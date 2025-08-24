// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete'
  },
  
  // Assessment
  ASSESSMENT: {
    CREATE: '/assessment/create',
    START: '/assessment/start',
    SUBMIT_ANSWER: '/assessment/submit-answer',
    COMPLETE: '/assessment/complete',
    RESULTS: '/assessment/results',
    HISTORY: '/assessment/history'
  },
  
  // Learning
  LEARNING: {
    LESSONS: '/learning/lessons',
    LESSON_DETAIL: '/learning/lesson',
    COMPLETE_LESSON: '/learning/complete',
    RECOMMENDATIONS: '/learning/recommendations'
  },
  
  // Progress
  PROGRESS: {
    GET: '/progress',
    UPDATE: '/progress/update',
    WEEKLY_ACTIVITY: '/progress/weekly-activity',
    ACHIEVEMENTS: '/progress/achievements'
  },
  
  // Chatbot
  CHATBOT: {
    SEND_MESSAGE: '/chatbot/message',
    CONVERSATION_HISTORY: '/chatbot/history',
    CLEAR_HISTORY: '/chatbot/clear'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet của bạn.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  UNKNOWN_ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  REGISTER: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
  LOGOUT: 'Đăng xuất thành công!',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công!',
  ASSESSMENT_COMPLETED: 'Hoàn thành bài đánh giá thành công!',
  LESSON_COMPLETED: 'Hoàn thành bài học thành công!'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'english_learning_token',
  REFRESH_TOKEN: 'english_learning_refresh_token',
  USER: 'english_learning_user',
  THEME: 'english_learning_theme',
  LANGUAGE: 'english_learning_language'
};

// Assessment configuration
export const ASSESSMENT_CONFIG = {
  PLACEMENT_TEST: {
    TIME_LIMIT: 30, // minutes
    TOTAL_QUESTIONS: 40,
    QUESTIONS_PER_SKILL: 10,
    SKILLS: ['grammar', 'vocabulary', 'reading', 'listening']
  }
};

// Learning levels
export const LEARNING_LEVELS = {
  A1: { name: 'Beginner', color: 'green-500' },
  A2: { name: 'Elementary', color: 'green-600' },
  B1: { name: 'Intermediate', color: 'lime-500' },
  B2: { name: 'Upper Intermediate', color: 'lime-600' },
  C1: { name: 'Advanced', color: 'orange-500' },
  C2: { name: 'Proficient', color: 'red-500' }
};
