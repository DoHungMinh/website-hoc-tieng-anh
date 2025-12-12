import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    type: 'vocabulary' | 'grammar';
    level: string;
    duration: string;
    instructor: string;
    lessonsCount: number;
    thumbnail?: string;
    studentsCount: number;
  };
  enrolledAt: string;
  status: 'active' | 'completed' | 'paused';
  progress: {
    completedLessons: string[];
    completedVocabulary: string[];
    completedGrammar: string[];
    completionPercentage: number;
    lastAccessedAt?: string;
  };
  quiz: {
    attempts: number;
    bestScore: number;
    lastAttemptAt?: string;
  };
  achievements: string[];
}

interface EnrollmentStats {
  enrollments: Enrollment[];
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const CACHE_DURATION = 30000; // 30 seconds cache

export const useEnrollment = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { token } = useAuthStore();

  // Fetch user enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Check cache - but don't use enrollments.length as it creates circular dependency
    const now = Date.now();
    if (lastFetch && (now - lastFetch) < CACHE_DURATION) {
      console.log('📋 Using cached enrollment data');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching fresh enrollment data');
      const response = await fetch(`${API_BASE}/course/enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEnrollments(data.enrollments);
      setStats({
        enrollments: data.enrollments,
        totalCourses: data.totalCourses,
        activeCourses: data.activeCourses,
        completedCourses: data.completedCourses
      });
      setLastFetch(now);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      console.error('Error fetching enrollments:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, lastFetch]);

  // Enroll in a course
  const enrollInCourse = async (courseId: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/course/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh enrollments after successful enrollment
      await fetchEnrollments();
      
      return {
        success: true,
        enrollment: data.enrollment,
        message: data.message
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      console.error('Error enrolling in course:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update lesson progress
  const updateLessonProgress = async (
    courseId: string, 
    lessonId: string, 
    lessonType: 'vocabulary' | 'grammar' | 'lesson'
  ) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/enrollment/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId, lessonId, lessonType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Refresh enrollments to get updated progress
      await fetchEnrollments();
      
      return {
        success: true,
        enrollment: data.enrollment,
        message: data.message
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson progress';
      console.error('Error updating lesson progress:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get course progress
  const getCourseProgress = async (courseId: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/enrollment/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course progress';
      console.error('Error fetching course progress:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch enrollments when token is available
  useEffect(() => {
    if (token) {
      fetchEnrollments();
    }
  }, [token, fetchEnrollments]);

  return {
    enrollments,
    stats,
    loading,
    error,
    fetchEnrollments,
    enrollInCourse,
    updateLessonProgress,
    getCourseProgress
  };
};
