export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  level: LearningLevel;
  isEmailVerified: boolean;
  learningGoals: string[];
  preferences: UserPreferences;
  streakCount: number;
  totalStudyHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export type LearningLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface Assessment {
  _id: string;
  userId: string;
  type: 'placement' | 'progress' | 'final';
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  questions: Question[];
  userAnswers: UserAnswer[];
  results?: AssessmentResult;
  timeLimit: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audio?: string;
  passage?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: LearningLevel;
  skillBreakdown: SkillBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SkillBreakdown {
  grammar: SkillScore;
  vocabulary: SkillScore;
  reading: SkillScore;
  listening: SkillScore;
}

export interface SkillScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface Progress {
  _id: string;
  userId: string;
  vocabulary: VocabularyProgress;
  listening: ListeningProgress;
  testsCompleted: TestProgress;
  studyStreak: StreakProgress;
  weeklyActivity: WeeklyActivity[];
  totalStudyTime: number;
  level: LearningLevel;
  achievements: Achievement[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyProgress {
  learned: number;
  target: number;
  recentWords: VocabularyItem[];
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
  learnedAt: string;
  reviewCount: number;
  masteryLevel: number;
}

export interface ListeningProgress {
  hoursCompleted: number;
  target: number;
  recentSessions: ListeningSession[];
}

export interface ListeningSession {
  title: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  completedAt: string;
}

export interface TestProgress {
  completed: number;
  target: number;
  recentTests: TestResult[];
}

export interface TestResult {
  testName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

export interface StreakProgress {
  current: number;
  target: number;
  lastStudyDate: string;
}

export interface WeeklyActivity {
  week: string;
  days: DayActivity[];
  totalHours: number;
}

export interface DayActivity {
  day: string;
  hours: number;
  activities: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'vocabulary' | 'listening' | 'grammar' | 'streak' | 'test' | 'general';
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
  userId?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  level: LearningLevel;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'speaking';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  content: LessonContent;
  isCompleted: boolean;
  progress: number;
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  exercises: Exercise[];
  summary: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  examples: string[];
  media?: {
    type: 'audio' | 'video' | 'image';
    url: string;
    caption?: string;
  };
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'audio' | 'speaking';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  audio?: string;
}
