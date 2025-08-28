import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollmentProgress {
  completedLessons: string[];
  completedVocabulary: string[];
  completedGrammar: string[];
  completionPercentage: number;
}

export interface IQuiz {
  attempts: number;
  bestScore: number;
}

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'paused';
  progress: IEnrollmentProgress;
  quiz: IQuiz;
  lastAccessedAt: Date;
  achievements: string[];
}

const enrollmentSchema = new Schema<IEnrollment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  progress: {
    completedLessons: {
      type: [String],
      default: []
    },
    completedVocabulary: {
      type: [String],
      default: []
    },
    completedGrammar: {
      type: [String],
      default: []
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  quiz: {
    attempts: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    }
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  achievements: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Create compound index to ensure one enrollment per user per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;