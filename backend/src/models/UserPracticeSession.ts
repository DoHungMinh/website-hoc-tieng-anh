import mongoose, { Document, Schema } from 'mongoose';

/**
 * Phone Score Interface
 * Chi tiết điểm số từng âm vị (syllable)
 */
export interface IPhoneScore {
  phone: string;
  soundMostLike: string;
  score: number;
  stressLevel?: number;
}

/**
 * Word Score Interface
 * Chi tiết điểm số từng từ
 */
export interface IWordScore {
  word: string;
  score: number;
  startTime: number;
  endTime: number;
  phoneScores: IPhoneScore[];
}

/**
 * User Practice Session Model
 * Lưu lịch sử luyện tập phát âm của user
 */
export interface IUserPracticeSession extends Omit<Document, '_id'> {
  _id: string;
  userId: string;
  promptIndex: number;
  userAudioUrl: string;
  userAudioPublicId: string;
  transcript: string;
  overallScore: number;
  fluencyScore?: number;
  pronunciationScore?: number;
  wordScores: IWordScore[];
  completedAt: Date;
  recordingDuration: number;
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
    phoneScores: {
      type: [phoneScoreSchema],
      default: [],
    },
  },
  { _id: false }
);

const userPracticeSessionSchema = new Schema<IUserPracticeSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    promptIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 15,
    },
    userAudioUrl: {
      type: String,
      required: true,
    },
    userAudioPublicId: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    fluencyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    pronunciationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    wordScores: {
      type: [wordScoreSchema],
      default: [],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    recordingDuration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
userPracticeSessionSchema.index({ userId: 1, promptIndex: 1 });
userPracticeSessionSchema.index({ userId: 1, completedAt: -1 });
userPracticeSessionSchema.index({ completedAt: -1 });

const UserPracticeSession = mongoose.model<IUserPracticeSession>(
  'UserPracticeSession',
  userPracticeSessionSchema
);

export default UserPracticeSession;
