import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Omit<Document, "_id"> {
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  duration: string;
  price: number;
  originalPrice?: number;
  instructor: string;
  status: 'draft' | 'active' | 'archived';
  thumbnail?: string;
  studentsCount: number;
  lessonsCount: number;
  vocabulary?: Array<{
    id: string;
    word: string;
    pronunciation?: string;
    audioUrl?: string;
    meaning: string;
    example?: string;
  }>;
  grammar?: Array<{
    id: string;
    rule: string;
    structure?: string;
    explanation: string;
    example: string;
  }>;
  requirements: string[];
  benefits: string[];
  curriculum: Array<{
    module: string;
    lessons: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['vocabulary', 'grammar'], required: true },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  instructor: { type: String, required: true },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  thumbnail: { type: String },
  studentsCount: { type: Number, default: 0 },
  lessonsCount: { type: Number, default: 0 },
  vocabulary: [{
    id: String,
    word: String,
    pronunciation: String,
    audioUrl: String,
    meaning: String,
    example: String
  }],
  grammar: [{
    id: String,
    rule: String,
    structure: String,
    explanation: String,
    example: String
  }],
  requirements: [String],
  benefits: [String],
  curriculum: [{
    module: String,
    lessons: [String]
  }]
}, {
  timestamps: true
});

export default mongoose.model<ICourse>('Course', CourseSchema);
