// Message interface
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    audioUrl?: string;
}

// Session interface
export interface ConversationSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

// Speaking Mode Type
export type SpeakingMode = 'conversation' | 'assessment';
