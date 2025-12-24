import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  vocabulary: {
    learned: number;
    target: number;
    recentWords: IVocabularyItem[];
  };
  listening: {
    hoursCompleted: number;
    target: number;
    recentSessions: IListeningSession[];
  };
  testsCompleted: {
    completed: number;
    target: number;
    recentTests: ITestResult[];
  };
  studyStreak: {
    current: number;
    target: number;
    lastStudyDate: Date;
  };
  weeklyActivity: IWeeklyActivity[];
  totalStudyTime: number; // in hours
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  achievements: IAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IVocabularyItem {
  word: string;
  meaning: string;
  example: string;
  learnedAt: Date;
  reviewCount: number;
  masteryLevel: number; // 0-100
}

export interface IListeningSession {
  title: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  completedAt: Date;
}

export interface ITestResult {
  testName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: Date;
}

export interface IWeeklyActivity {
  week: string; // ISO week string
  days: {
    day: string;
    hours: number;
    activities: string[];
  }[];
  totalHours: number;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'vocabulary' | 'listening' | 'grammar' | 'streak' | 'test' | 'general';
}

const vocabularyItemSchema = new Schema<IVocabularyItem>({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String, required: true },
  learnedAt: { type: Date, required: true },
  reviewCount: { type: Number, default: 0 },
  masteryLevel: { type: Number, default: 0, min: 0, max: 100 }
});

const listeningSessionSchema = new Schema<IListeningSession>({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  score: { type: Number, required: true },
  completedAt: { type: Date, required: true }
});

const testResultSchema = new Schema<ITestResult>({
  testName: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  completedAt: { type: Date, required: true }
});

const weeklyActivitySchema = new Schema<IWeeklyActivity>({
  week: { type: String, required: true },
  days: [{
    day: { type: String, required: true },
    hours: { type: Number, required: true },
    activities: [{ type: String }]
  }],
  totalHours: { type: Number, required: true }
});

const achievementSchema = new Schema<IAchievement>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlockedAt: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['vocabulary', 'listening', 'grammar', 'streak', 'test', 'general'],
    required: true 
  }
});

const progressSchema = new Schema<IProgress>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  vocabulary: {
    learned: { type: Number, default: 0 },
    target: { type: Number, default: 5000 },
    recentWords: [vocabularyItemSchema]
  },
  listening: {
    hoursCompleted: { type: Number, default: 0 },
    target: { type: Number, default: 200 },
    recentSessions: [listeningSessionSchema]
  },
  testsCompleted: {
    completed: { type: Number, default: 0 },
    target: { type: Number, default: 60 },
    recentTests: [testResultSchema]
  },
  studyStreak: {
    current: { type: Number, default: 0 },
    target: { type: Number, default: 30 },
    lastStudyDate: { type: Date, default: Date.now }
  },
  weeklyActivity: [weeklyActivitySchema],
  totalStudyTime: { type: Number, default: 0 },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1' 
  },
  achievements: [achievementSchema]
}, {
  timestamps: true
});

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
