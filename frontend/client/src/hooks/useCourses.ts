import { useState, useEffect } from 'react';
import { vocabularyCourses, grammarCourses } from '../data/coursesData';
import { logger } from '../utils/logger';

export interface Course {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  originalPrice?: number;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  description: string;
  features: string[];
  curriculum: {
    module: string;
    lessons: string[];
  }[];
  instructor: {
    name: string;
    title: string;
    experience: string;
    avatar: string;
  };
  whatYouLearn: string[];
  requirements: string[];
  isPopular?: boolean;
  type: 'vocabulary' | 'grammar';
  thumbnail: string;
}

/**
 * Custom hook for managing courses data
 * Provides fetching, filtering, and enrollment functionality
 */
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (type?: 'vocabulary' | 'grammar') => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      let allCourses = [...vocabularyCourses, ...grammarCourses];

      if (type) {
        allCourses = allCourses.filter(course => course.type === type);
      }

      setCourses(allCourses);
    } catch {
      setError('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const getCourseById = (id: string): Course | undefined => {
    return [...vocabularyCourses, ...grammarCourses].find(course => course.id === id);
  };

  const enrollCourse = async (courseId: string) => {
    try {
      // Simulate API call for enrollment
      await new Promise(resolve => setTimeout(resolve, 1000));

      logger.log('Enrolled in course:', courseId);
      return { success: true, message: 'Đăng ký khóa học thành công!' };
    } catch {
      return { success: false, message: 'Đăng ký thất bại, vui lòng thử lại!' };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCourseById,
    enrollCourse
  };
};
