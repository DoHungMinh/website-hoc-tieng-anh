import mongoose, { Document, Schema } from 'mongoose';

/**
 * Word Audio Model
 * Cache audio từng từ riêng lẻ (TTS generated)
 */
export interface IWordAudio extends Omit<Document, '_id'> {
  _id: string;
  word: string;
  audioUrl: string;
  audioPublicId: string;
  duration: number;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  generatedAt: Date;
  timesUsed: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

const wordAudioSchema = new Schema<IWordAudio>(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    audioPublicId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    voice: {
      type: String,
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      default: 'alloy',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    timesUsed: {
      type: Number,
      default: 1,
    },
    format: {
      type: String,
      default: 'mp3',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
wordAudioSchema.index({ word: 1 });
wordAudioSchema.index({ timesUsed: -1 }); // For analytics

const WordAudio = mongoose.model<IWordAudio>('WordAudio', wordAudioSchema);

export default WordAudio;
