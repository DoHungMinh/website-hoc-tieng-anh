import mongoose, { Document, Schema } from 'mongoose';

/**
 * Realtime Session Model
 * Lưu trữ thông tin session cho OpenAI Realtime API conversations
 */

export interface IRealtimeMessage {
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
    timestamp: Date;
}

export interface ITokenUsage {
    inputTokens: number;
    outputTokens: number;
    audioInputTokens: number;
    audioOutputTokens: number;
}

export interface IRealtimeSession extends Document {
    sessionId: string;
    userId: string; // Changed from ObjectId to String
    startedAt: Date;
    endedAt?: Date;
    messages: IRealtimeMessage[];
    totalDuration: number; // seconds
    tokenUsage: ITokenUsage;
    estimatedCost: number;
    status: 'active' | 'completed' | 'error';
    errorMessage?: string;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        deviceType?: string;
    };
}

const RealtimeMessageSchema = new Schema<IRealtimeMessage>({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    audioUrl: {
        type: String,
        required: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const TokenUsageSchema = new Schema<ITokenUsage>({
    inputTokens: {
        type: Number,
        default: 0,
    },
    outputTokens: {
        type: Number,
        default: 0,
    },
    audioInputTokens: {
        type: Number,
        default: 0,
    },
    audioOutputTokens: {
        type: Number,
        default: 0,
    },
}, { _id: false });

const RealtimeSessionSchema = new Schema<IRealtimeSession>({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: String, // Changed from ObjectId to String to support both real IDs and 'anonymous'
        required: true,
        index: true,
    },
    startedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    endedAt: {
        type: Date,
        required: false,
    },
    messages: {
        type: [RealtimeMessageSchema],
        default: [],
    },
    totalDuration: {
        type: Number,
        default: 0,
    },
    tokenUsage: {
        type: TokenUsageSchema,
        default: () => ({
            inputTokens: 0,
            outputTokens: 0,
            audioInputTokens: 0,
            audioOutputTokens: 0,
        }),
    },
    estimatedCost: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'error'],
        default: 'active',
    },
    errorMessage: {
        type: String,
        required: false,
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        deviceType: String,
    },
}, {
    timestamps: true,
});

// Indexes
RealtimeSessionSchema.index({ userId: 1, startedAt: -1 });
RealtimeSessionSchema.index({ sessionId: 1, status: 1 });

// Methods
RealtimeSessionSchema.methods.addMessage = function (message: IRealtimeMessage) {
    this.messages.push(message);
    return this.save();
};

RealtimeSessionSchema.methods.updateTokenUsage = function (usage: Partial<ITokenUsage>) {
    this.tokenUsage = {
        ...this.tokenUsage,
        ...usage,
    };
    return this.save();
};

RealtimeSessionSchema.methods.complete = function () {
    this.status = 'completed';
    this.endedAt = new Date();
    this.totalDuration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
    return this.save();
};

RealtimeSessionSchema.methods.markError = function (errorMessage: string) {
    this.status = 'error';
    this.errorMessage = errorMessage;
    this.endedAt = new Date();
    return this.save();
};

export const RealtimeSession = mongoose.model<IRealtimeSession>('RealtimeSession', RealtimeSessionSchema);
