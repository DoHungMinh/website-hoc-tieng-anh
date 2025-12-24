import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: string;
    assessmentId?: string;
    auto?: boolean;
  };
}

export interface IChatSession extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  messages: IChatMessage[];
  context: {
    lastInteraction?: Date;
    messageCount?: number;
    currentLevel?: string;
    recentTopics?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: {
      type: String
    },
    assessmentId: String,
    auto: Boolean
  }
});

const chatSessionSchema = new Schema<IChatSession>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [chatMessageSchema],
  context: {
    lastInteraction: Date,
    messageCount: Number,
    currentLevel: String,
    recentTopics: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });

const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
export default ChatSession;
