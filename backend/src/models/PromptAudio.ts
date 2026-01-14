import mongoose, { Document, Schema } from 'mongoose';

/**
 * Prompt Audio Model
 * Cache audio chuẩn cho 16 prompts (TTS generated)
 */
export interface IPromptAudio extends Omit<Document, '_id'> {
  _id: string;
  promptIndex: number;
  promptText: string;
  audioUrl: string;
  audioPublicId: string;
  duration: number;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  generatedAt: Date;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

const promptAudioSchema = new Schema<IPromptAudio>(
  {
    promptIndex: {
      type: Number,
      required: true,
      unique: true,
      min: 0,
      max: 15,
    },
    promptText: {
      type: String,
      required: true,
      trim: true,
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
    format: {
      type: String,
      default: 'mp3',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup
promptAudioSchema.index({ promptIndex: 1 });

const PromptAudio = mongoose.model<IPromptAudio>('PromptAudio', promptAudioSchema);

export default PromptAudio;
