import mongoose, { Document, Schema } from 'mongoose';

/**
 * Phone Score Interface (reuse từ UserPracticeSession)
 */
export interface IPhoneScore {
  phone: string;
  soundMostLike: string;
  score: number;
  stressLevel?: number;
}

/**
 * Word Score Interface cho Free Speaking
 * Thêm pauseAfter flag để detect pause sau từ
 */
export interface IWordScore {
  word: string;
  score: number;
  startTime: number;
  endTime: number;
  pauseAfter?: boolean;  // true nếu có pause sau từ này
  phoneScores: IPhoneScore[];
}

/**
 * Free Speaking Session Model
 * Lưu lịch sử luyện nói tự do của user
 */
export interface IFreeSpeakingSession extends Omit<Document, '_id'> {
  _id: string;
  userId: string;
  topicId: 'food' | 'family' | 'animals';
  topicTitle: string;
  questions: string[];
  
  // Audio
  userAudioUrl: string;
  userAudioPublicId: string;
  recordingDuration: number;
  
  // Transcription
  transcript: string;
  
  // IELTS Scores (0-9)
  scores: {
    overall: number;
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
  };
  
  // Word-level analysis
  wordScores: IWordScore[];
  
  // Metrics
  metrics: {
    badPauses: number;
    accuracy: number;
  };
  
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const phoneScoreSchema = new Schema<IPhoneScore>(
  {
    phone: {
      type: String,
      required: true,
    },
    soundMostLike: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    stressLevel: {
      type: Number,
      min: 0,
      max: 2,
    },
  },
  { _id: false }
);

const wordScoreSchema = new Schema<IWordScore>(
  {
    word: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
      required: true,
    },
    pauseAfter: {
      type: Boolean,
      default: false,
    },
    phoneScores: {
      type: [phoneScoreSchema],
      default: [],
    },
  },
  { _id: false }
);

const freeSpeakingSessionSchema = new Schema<IFreeSpeakingSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      enum: ['food', 'family', 'animals'],
      index: true,
    },
    topicTitle: {
      type: String,
      required: true,
    },
    questions: {
      type: [String],
      required: true,
    },
    userAudioUrl: {
      type: String,
      required: true,
    },
    userAudioPublicId: {
      type: String,
      required: true,
    },
    recordingDuration: {
      type: Number,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    scores: {
      overall: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      pronunciation: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      fluency: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      vocabulary: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      grammar: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
    },
    wordScores: {
      type: [wordScoreSchema],
      default: [],
    },
    metrics: {
      badPauses: {
        type: Number,
        required: true,
        default: 0,
      },
      accuracy: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
freeSpeakingSessionSchema.index({ userId: 1, topicId: 1 });
freeSpeakingSessionSchema.index({ userId: 1, completedAt: -1 });

const FreeSpeakingSession = mongoose.model<IFreeSpeakingSession>(
  'FreeSpeakingSession',
  freeSpeakingSessionSchema
);

export default FreeSpeakingSession;
