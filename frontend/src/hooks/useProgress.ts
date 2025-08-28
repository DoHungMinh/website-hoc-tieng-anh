import { useState, useEffect } from 'react';

interface ProgressData {
  _id: string;
  userId: string;
  vocabulary: {
    learned: number;
    target: number;
    recentWords: VocabularyItem[];
  };
  listening: {
    hoursCompleted: number;
    target: number;
    recentSessions: ListeningSession[];
  };
  testsCompleted: {
    completed: number;
    target: number;
    recentTests: TestResult[];
  };
  studyStreak: {
    current: number;
    target: number;
    lastStudyDate: string;
  };
  weeklyActivity: WeeklyActivity[];
  totalStudyTime: number;
  level: string;
  achievements: Achievement[];
  createdAt: string;
  updatedAt: string;
}

interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
  learnedAt: string;
  reviewCount: number;
  masteryLevel: number;
}

interface ListeningSession {
  title: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  completedAt: string;
}

interface TestResult {
  testName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

interface WeeklyActivity {
  week: string;
  days: {
    day: string;
    hours: number;
    activities: string[];
  }[];
  totalHours: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'vocabulary' | 'listening' | 'grammar' | 'streak' | 'test' | 'general';
}

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user progress
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Chưa đăng nhập');
        return;
      }

      const response = await fetch('http://localhost:5002/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProgress(data.data);
        setError(null);
      } else {
        // If no progress exists, try to initialize
        if (response.status === 404) {
          await initializeProgress();
        } else {
          setError(data.message || 'Lỗi khi tải tiến độ');
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Initialize progress for new user
  const initializeProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Chưa đăng nhập');
        return false;
      }

      const response = await fetch('http://localhost:5002/api/progress/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProgress(data.data);
        setError(null);
        return true;
      } else {
        setError(data.message || 'Lỗi khi khởi tạo tiến độ');
        return false;
      }
    } catch (err) {
      console.error('Error initializing progress:', err);
      setError('Lỗi kết nối');
      return false;
    }
  };

  // Update vocabulary progress
  const updateVocabularyProgress = async (word: string, meaning: string, example: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      const response = await fetch('http://localhost:5002/api/progress/vocabulary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, meaning, example })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh progress data
        await fetchProgress();
        return {
          success: true,
          vocabularyLearned: data.data.vocabularyLearned,
          newWord: data.data.newWord
        };
      } else {
        throw new Error(data.message || 'Lỗi khi cập nhật từ vựng');
      }
    } catch (err) {
      console.error('Error updating vocabulary:', err);
      throw err;
    }
  };

  // Update listening progress
  const updateListeningProgress = async (
    title: string, 
    duration: number, 
    difficulty: 'beginner' | 'intermediate' | 'advanced', 
    score: number
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      const response = await fetch('http://localhost:5002/api/progress/listening', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, duration, difficulty, score })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh progress data
        await fetchProgress();
        return {
          success: true,
          hoursCompleted: data.data.hoursCompleted,
          sessionScore: data.data.sessionScore
        };
      } else {
        throw new Error(data.message || 'Lỗi khi cập nhật listening');
      }
    } catch (err) {
      console.error('Error updating listening:', err);
      throw err;
    }
  };

  // Update test progress
  const updateTestProgress = async (
    testName: string,
    score: number,
    maxScore: number,
    percentage: number
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      const response = await fetch('http://localhost:5002/api/progress/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testName, score, maxScore, percentage })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh progress data
        await fetchProgress();
        return {
          success: true,
          testsCompleted: data.data.testsCompleted,
          testScore: data.data.testScore
        };
      } else {
        throw new Error(data.message || 'Lỗi khi cập nhật test');
      }
    } catch (err) {
      console.error('Error updating test:', err);
      throw err;
    }
  };

  // Auto-fetch progress on mount
  useEffect(() => {
    fetchProgress();
  }, []);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    initializeProgress,
    updateVocabularyProgress,
    updateListeningProgress,
    updateTestProgress
  };
};
