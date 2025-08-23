import mongoose, { Document, Schema } from 'mongoose';

// Interface cho câu hỏi
interface IQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-notgiven' | 'matching' | 'map-labeling';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  audioTimestamp?: number; // Cho listening questions
}

// Interface cho passage (Reading)
interface IPassage {
  id: string;
  title: string;
  content: string;
  questions: IQuestion[];
}

// Interface cho section (Listening)
interface ISection {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  audioPublicId?: string; // Cloudinary public ID
  duration: number; // in minutes
  questions: IQuestion[];
}

// Interface cho IELTS Exam
export interface IIELTSExam extends Document {
  title: string;
  type: 'reading' | 'listening';
  difficulty: string;
  duration: number; // in minutes
  totalQuestions: number;
  description: string;
  status: 'draft' | 'published';
  passages?: IPassage[]; // For reading tests
  sections?: ISection[]; // For listening tests
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho câu hỏi
const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['multiple-choice', 'fill-blank', 'true-false-notgiven', 'matching', 'map-labeling']
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String },
  audioTimestamp: { type: Number }
});

// Schema cho passage
const PassageSchema = new Schema<IPassage>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  questions: [QuestionSchema]
});

// Schema cho section
const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  audioUrl: { type: String },
  audioPublicId: { type: String },
  duration: { type: Number, required: true },
  questions: [QuestionSchema]
});

// Schema cho IELTS Exam
const IELTSExamSchema = new Schema<IIELTSExam>({
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['reading', 'listening']
  },
  difficulty: { type: String, required: true },
  duration: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  description: { type: String },
  status: { 
    type: String, 
    required: true,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  passages: [PassageSchema],
  sections: [SectionSchema],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Indexes for better performance
IELTSExamSchema.index({ type: 1 });
IELTSExamSchema.index({ difficulty: 1 });
IELTSExamSchema.index({ status: 1 });
IELTSExamSchema.index({ createdAt: -1 });

export const IELTSExam = mongoose.model<IIELTSExam>('IELTSExam', IELTSExamSchema);
