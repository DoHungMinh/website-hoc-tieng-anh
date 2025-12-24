import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessment extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  type: 'placement' | 'progress' | 'final';
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  questions: IQuestion[];
  userAnswers: IUserAnswer[];
  results?: IAssessmentResult;
  timeLimit: number; // in minutes
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audio?: string; // for listening questions
  passage?: string; // for reading questions
}

export interface IUserAnswer {
  questionId: string;
  selectedAnswer: number;
  timeSpent: number; // in seconds
  isCorrect: boolean;
}

export interface IAssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skillBreakdown: {
    grammar: { score: number; maxScore: number; percentage: number };
    vocabulary: { score: number; maxScore: number; percentage: number };
    reading: { score: number; maxScore: number; percentage: number };
    listening: { score: number; maxScore: number; percentage: number };
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const questionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['grammar', 'vocabulary', 'reading', 'listening'],
    required: true 
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true 
  },
  audio: { type: String },
  passage: { type: String }
});

const userAnswerSchema = new Schema<IUserAnswer>({
  questionId: { type: String, required: true },
  selectedAnswer: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true }
});

const assessmentResultSchema = new Schema<IAssessmentResult>({
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true 
  },
  skillBreakdown: {
    grammar: {
      score: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      percentage: { type: Number, required: true }
    },
    vocabulary: {
      score: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      percentage: { type: Number, required: true }
    },
    reading: {
      score: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      percentage: { type: Number, required: true }
    },
    listening: {
      score: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      percentage: { type: Number, required: true }
    }
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }]
});

const assessmentSchema = new Schema<IAssessment>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['placement', 'progress', 'final'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'expired'],
    default: 'pending'
  },
  questions: [questionSchema],
  userAnswers: [userAnswerSchema],
  results: assessmentResultSchema,
  timeLimit: {
    type: Number,
    required: true,
    default: 30
  },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
