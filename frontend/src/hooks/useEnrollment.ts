import { useState, useEffect } from 'react';
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

export const useEnrollment = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const API_BASE = 'http://localhost:5002/api';

  // Fetch user enrollments
  const fetchEnrollments = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/courses/enrollments`, {
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

    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setError(err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
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

    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      setError(err.message || 'Failed to enroll in course');
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

    } catch (err: any) {
      console.error('Error updating lesson progress:', err);
      setError(err.message || 'Failed to update lesson progress');
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

    } catch (err: any) {
      console.error('Error fetching course progress:', err);
      setError(err.message || 'Failed to fetch course progress');
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
  }, [token]);

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
