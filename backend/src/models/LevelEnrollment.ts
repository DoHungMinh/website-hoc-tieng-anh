import mongoose, { Document, Schema } from 'mongoose';

/**
 * Level Enrollment Model - User enrollment trong level package
 * Đơn giản hóa, KHÔNG tracking progress chi tiết
 */
export interface ILevelEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  
  // Basic info
  enrolledAt: Date;
  status: 'active' | 'paused' | 'refunded';
  
  // Payment info
  orderCode?: number;
  paidAmount?: number;
  paymentDate?: Date;
  
  // Timestamps
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LevelEnrollmentSchema = new Schema<ILevelEnrollment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'refunded'],
    default: 'active'
  },
  orderCode: {
    type: Number
  },
  paidAmount: {
    type: Number
  },
  paymentDate: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: Một user chỉ có thể enroll 1 lần cho mỗi level
LevelEnrollmentSchema.index({ userId: 1, level: 1 }, { unique: true });

// Index for queries
LevelEnrollmentSchema.index({ userId: 1 });
LevelEnrollmentSchema.index({ level: 1 });
LevelEnrollmentSchema.index({ status: 1 });

export default mongoose.model<ILevelEnrollment>('LevelEnrollment', LevelEnrollmentSchema);
