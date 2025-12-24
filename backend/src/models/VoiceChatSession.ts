import mongoose, { Document, Schema } from 'mongoose';

/**
 * Voice Chat Session Model
 * Track voice chat sessions để monitoring và billing
 */
export interface IVoiceChatSession extends Omit<Document, "_id"> {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  
  // STT Data
  transcriptText: string;
  transcriptLength: number;
  audioInputSize?: number; // bytes
  
  // AI Response
  responseText: string;
  responseLength: number;
  
  // TTS Data
  voiceUsed: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  audioOutputSize?: number; // bytes
  
  // Performance
  processingTimeMs: number;
  sttTimeMs?: number;
  aiTimeMs?: number;
  ttsTimeMs?: number;
  
  // Cost tracking
  estimatedCost?: number;
  
  // Status
  status: 'success' | 'partial_success' | 'failed';
  errorMessage?: string;
  
  // Metadata
  metadata?: {
    userLevel?: string;
    conversationTurn?: number;
    deviceType?: string;
    browserInfo?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const voiceChatSessionSchema = new Schema<IVoiceChatSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    
    // STT Data
    transcriptText: {
      type: String,
      required: true,
    },
    transcriptLength: {
      type: Number,
      required: true,
    },
    audioInputSize: {
      type: Number,
    },
    
    // AI Response
    responseText: {
      type: String,
      required: true,
    },
    responseLength: {
      type: Number,
      required: true,
    },
    
    // TTS Data
    voiceUsed: {
      type: String,
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      default: 'alloy',
    },
    audioOutputSize: {
      type: Number,
    },
    
    // Performance
    processingTimeMs: {
      type: Number,
      required: true,
    },
    sttTimeMs: {
      type: Number,
    },
    aiTimeMs: {
      type: Number,
    },
    ttsTimeMs: {
      type: Number,
    },
    
    // Cost
    estimatedCost: {
      type: Number,
    },
    
    // Status
    status: {
      type: String,
      enum: ['success', 'partial_success', 'failed'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
    
    // Metadata
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes để query nhanh
voiceChatSessionSchema.index({ userId: 1, createdAt: -1 });
voiceChatSessionSchema.index({ status: 1, createdAt: -1 });

// Virtual cho session duration
voiceChatSessionSchema.virtual('durationMinutes').get(function () {
  return this.duration ? this.duration / 60 : 0;
});

// Method để tính total cost của user
voiceChatSessionSchema.statics.getTotalCostByUser = async function (
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = { userId, status: { $ne: 'failed' } };
  
  if (startDate) {
    query.createdAt = { $gte: startDate };
  }
  if (endDate) {
    query.createdAt = { ...query.createdAt, $lte: endDate };
  }

  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$estimatedCost' },
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
      },
    },
  ]);

  return result[0] || { totalCost: 0, totalSessions: 0, totalDuration: 0 };
};

// Method để lấy usage stats
voiceChatSessionSchema.statics.getUsageStats = async function (
  userId: string,
  period: 'day' | 'week' | 'month' = 'month'
) {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  const sessions = await this.find({
    userId,
    createdAt: { $gte: startDate },
    status: { $ne: 'failed' },
  });

  const totalMinutes = sessions.reduce(
    (sum: number, session: IVoiceChatSession) =>
      sum + (session.duration || 0) / 60,
    0
  );

  const totalCost = sessions.reduce(
    (sum: number, session: IVoiceChatSession) =>
      sum + (session.estimatedCost || 0),
    0
  );

  return {
    period,
    totalSessions: sessions.length,
    totalMinutes: parseFloat(totalMinutes.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(4)),
    avgProcessingTime:
      sessions.length > 0
        ? sessions.reduce((sum: number, s: IVoiceChatSession) => sum + s.processingTimeMs, 0) /
          sessions.length
        : 0,
  };
};

const VoiceChatSession = mongoose.model<IVoiceChatSession>(
  'VoiceChatSession',
  voiceChatSessionSchema
);

export default VoiceChatSession;
