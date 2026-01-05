import { API_BASE_URL } from '@/utils/constants';

export interface LevelPackage {
  _id?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  features: string[];
  benefits: string[];
  duration: string;
  status: 'active' | 'inactive';
  order: number;
  isActive: boolean;
  totalCourses?: number;
  totalVocabulary?: number;
  totalGrammar?: number;
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelEnrollment {
  _id?: string;
  userId: string;
  level: string;
  enrolledAt: Date;
  status: 'active' | 'paused' | 'refunded';
  orderCode?: number;
  paidAmount?: number;
  paymentDate?: Date;
  lastAccessedAt?: Date;
  packageInfo?: LevelPackage;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    qrCode: string;
    checkoutUrl: string;
    orderCode: number;
    amount: number;
    level?: string;
  };
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED' | 'NOT_FOUND';
  data?: Record<string, unknown>;
  message?: string;
}

/**
 * Lấy tất cả level packages
 */
export const getAllLevelPackages = async (): Promise<{ success: boolean; data: LevelPackage[] }> => {
  const response = await fetch(`${API_BASE_URL}/level-packages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch level packages');
  }

  return response.json();
};

/**
 * Lấy chi tiết level package kèm courses
 */
export const getLevelPackageDetail = async (level: string): Promise<{ 
  success: boolean; 
  data: {
    package: LevelPackage;
    courses: Array<{
      _id: string;
      title: string;
      type: string;
      level: string;
      [key: string]: unknown;
    }>;
  }
}> => {
  const response = await fetch(`${API_BASE_URL}/level-packages/${level}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch level package detail');
  }

  return response.json();
};

/**
 * Lấy danh sách level enrollments của user
 */
export const getUserLevelEnrollments = async (token: string): Promise<{
  success: boolean;
  data: LevelEnrollment[];
  totalLevels: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/level-enrollments/my-enrollments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user enrollments');
  }

  return response.json();
};

/**
 * Kiểm tra user có enrolled trong level không
 */
export const checkLevelEnrollment = async (token: string, level: string): Promise<{
  success: boolean;
  isEnrolled: boolean;
  enrollment: LevelEnrollment | null;
}> => {
  const response = await fetch(`${API_BASE_URL}/level-enrollments/check/${level}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to check enrollment');
  }

  return response.json();
};

/**
 * Tạo payment link cho level package
 */
export const createLevelPayment = async (token: string, level: string): Promise<PaymentResponse> => {
  const response = await fetch(`${API_BASE_URL}/payos/create-level-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ level })
  });

  if (!response.ok) {
    throw new Error('Failed to create payment');
  }

  return response.json();
};

/**
 * Kiểm tra trạng thái payment
 */
export const checkLevelPaymentStatus = async (token: string, orderCode: number): Promise<PaymentStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/payos/level-payment-status/${orderCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return response.json();
};

/**
 * Confirm payment và tạo level enrollment
 */
export const confirmLevelPayment = async (token: string, orderCode: number, level: string): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(`${API_BASE_URL}/payos/level-payment-success`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderCode, level })
  });

  if (!response.ok) {
    throw new Error('Failed to confirm payment');
  }

  return response.json();
};

export const levelPackageAPI = {
  getAllLevelPackages,
  getLevelPackageDetail,
  getUserLevelEnrollments,
  checkLevelEnrollment,
  createLevelPayment,
  checkLevelPaymentStatus,
  confirmLevelPayment
};
