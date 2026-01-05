import mongoose, { Document, Schema } from 'mongoose';

/**
 * Level Package Model - Đại diện cho các hộp thẻ khóa học A1-C2
 * User mua level package sẽ được truy cập TẤT CẢ courses trong level đó
 */
export interface ILevelPackage extends Document {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  
  // Features & Benefits
  features: string[];
  benefits: string[];
  duration: string;
  
  // Statistics (auto-calculated)
  totalCourses: number;
  totalVocabulary: number;
  totalGrammar: number;
  studentsCount: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const LevelPackageSchema = new Schema<ILevelPackage>({
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  thumbnail: {
    type: String
  },
  features: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  duration: {
    type: String,
    default: '3-6 tháng'
  },
  totalCourses: {
    type: Number,
    default: 0
  },
  totalVocabulary: {
    type: Number,
    default: 0
  },
  totalGrammar: {
    type: Number,
    default: 0
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
LevelPackageSchema.index({ level: 1 });
LevelPackageSchema.index({ status: 1 });

export default mongoose.model<ILevelPackage>('LevelPackage', LevelPackageSchema);
