import { Schema, model, Document } from 'mongoose';

interface IAnswer {
  questionId: string;
  userAnswer: string | number;
  correctAnswer?: string | number;
  isCorrect: boolean;
}

interface IIELTSTestResult extends Omit<Document, "_id"> {
  userId: string;
  examId: string;
  examTitle: string;
  examType: 'reading' | 'listening';
  answers: IAnswer[];
  score: {
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    bandScore?: number;
    description?: string;
  };
  timeSpent: number; // in seconds
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ieltsTestResultSchema = new Schema<IIELTSTestResult>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  examId: {
    type: String,
    required: true
  },
  examTitle: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['reading', 'listening'],
    required: true
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      required: true
    },
    correctAnswer: {
      type: Schema.Types.Mixed
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    correctAnswers: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    bandScore: {
      type: Number
    },
    description: {
      type: String
    }
  },
  timeSpent: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ieltsTestResultSchema.index({ userId: 1, completedAt: -1 });
ieltsTestResultSchema.index({ examId: 1, userId: 1 });

export default model<IIELTSTestResult>('IELTSTestResult', ieltsTestResultSchema);
