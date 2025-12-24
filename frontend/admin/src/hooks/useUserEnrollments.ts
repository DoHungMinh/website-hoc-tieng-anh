import { useState, useEffect } from 'react';

interface CourseInfo {
  _id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  duration: string;
  instructor: string;
  lessonsCount: number;
  thumbnail: string;
  studentsCount: number;
}

interface EnrollmentProgress {
  completedLessons: string[];
  completedVocabulary: string[];
  completedGrammar: string[];
  completionPercentage: number;
}

interface QuizInfo {
  attempts: number;
  bestScore: number;
}

interface UserEnrollment {
  _id: string;
  userId: string;
  courseId: CourseInfo;
  status: 'active' | 'completed' | 'paused';
  progress: EnrollmentProgress;
  quiz: QuizInfo;
  enrolledAt: string;
  lastAccessedAt: string;
}

interface EnrollmentStats {
  enrollments: UserEnrollment[];
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  overallProgress: number;
}

export const useUserEnrollments = () => {
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5002/api/enrollment', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setEnrollments(data.enrollments || []);
      setStats(data);
    } catch (err) {
      console.error('Error fetching user enrollments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      setEnrollments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    stats,
    loading,
    error,
    refetch: fetchEnrollments
  };
};
