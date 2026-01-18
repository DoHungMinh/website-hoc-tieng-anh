import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    audioUrl?: string;
}

export interface UseRealtimeAI {
    // Connection state
    isConnected: boolean;
    isConnecting: boolean;
    sessionId: string | null;

    // Session management
    startSession: () => Promise<void>;
    endSession: () => Promise<void>;

    // Audio streaming
    sendAudioChunk: (chunk: Blob) => Promise<void>;
    commitAudio: () => Promise<void>;

    // Messages
    messages: ChatMessage[];
    currentAIResponse: string;

    // Status
    isAIResponding: boolean;
    isSpeechDetected: boolean;
    error: string | null;

    // Session info
    sessionInfo: {
        messageCount: number;
        estimatedCost: number;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
            audioInputTokens: number;
            audioOutputTokens: number;
        };
    } | null;
}

/**
 * Custom hook for OpenAI Realtime API integration
 * Manages WebSocket connection, audio streaming, and message handling
 */
export function useRealtimeAI(): UseRealtimeAI {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentAIResponse, setCurrentAIResponse] = useState('');
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [isSpeechDetected, setIsSpeechDetected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<UseRealtimeAI['sessionInfo']>(null);

    // Audio Playback Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        }
    }, []);

    const playAudioChunk = useCallback((base64Chunk: string) => {
        initAudioContext();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        try {
            const binaryString = atob(base64Chunk);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);

            // Normalize Int16 to Float32
            for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0;
            }

            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.getChannelData(0).set(float32);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const currentTime = ctx.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + buffer.duration;

            audioQueueRef.current.push(source);

            source.onended = () => {
                const index = audioQueueRef.current.indexOf(source);
                if (index > -1) {
                    audioQueueRef.current.splice(index, 1);
                }
            };

        } catch (err) {
            console.error('Error playing audio chunk:', err);
        }
    }, [initAudioContext]);

    const cancelPlayback = useCallback(() => {
        audioQueueRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) { /* ignore */ }
        });
        audioQueueRef.current = [];
        nextStartTimeRef.current = 0;
    }, []);

    // Initialize Socket.IO connection
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
            setError('Authentication required');
            return;
        }

        // Socket.IO connects to base URL (without /api)
        const socketURL = API_BASE_URL.replace('/api', '');

        const newSocket = io(socketURL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected');
            setIsConnected(true);
            setError(null);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket.IO disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket.IO connection error:', err);
            setError('Connection failed. Please check your internet.');
            setIsConnected(false);
        });

        // Realtime API event listeners
        newSocket.on('realtime:connected', (data: { sessionId: string }) => {
            console.log('✅ Realtime session connected:', data.sessionId);
            setIsConnecting(false);
        });

        newSocket.on('realtime:transcript', (data: { role: string; content: string }) => {
            console.log('📝 Transcript received:', data);
            if (data.role === 'user') {
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: data.content,
                    timestamp: new Date(),
                }]);
            }
        });

        newSocket.on('realtime:text-delta', (data: { textChunk: string }) => {
            setCurrentAIResponse(prev => prev + data.textChunk);
            setIsAIResponding(true);
        });

        newSocket.on('realtime:audio-delta', (data: { audioChunk: string }) => {
            // Play audio chunk immediately
            playAudioChunk(data.audioChunk);
        });

        newSocket.on('realtime:response-done', (data: { content: string }) => {
            console.log('✅ AI response complete');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
            }]);
            setCurrentAIResponse('');
            setIsAIResponding(false);
        });

        newSocket.on('realtime:speech-started', () => {
            console.log('🎤 Speech detected');
            setIsSpeechDetected(true);
            // Cancel current playback if user interrupts
            cancelPlayback();
        });

        newSocket.on('realtime:speech-stopped', () => {
            console.log('🎤 Speech ended');
            setIsSpeechDetected(false);
        });

        newSocket.on('realtime:session-closed', (data: {
            sessionId: string;
            totalDuration: number;
            messageCount: number;
            estimatedCost: number;
        }) => {
            console.log('🔚 Session closed:', data);
            setSessionInfo({
                messageCount: data.messageCount,
                estimatedCost: data.estimatedCost,
            });
            setSessionId(null);
        });

        newSocket.on('realtime:error', (data: { message: string; error?: any }) => {
            console.error('❌ Realtime API error:', JSON.stringify(data, null, 2));
            setError(data.message);
            setIsAIResponding(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Start new session
    const startSession = useCallback(async () => {
        if (!socket || !isConnected) {
            setError('Not connected to server');
            return;
        }

        // Initialize AudioContext on user interaction
        initAudioContext();
        if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        try {
            setIsConnecting(true);
            setError(null);

            const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Get real user ID from localStorage
            const userDataStr = localStorage.getItem(STORAGE_KEYS.USER);
            let userId = 'anonymous';

            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    userId = userData._id || userData.id || 'anonymous';
                } catch (e) {
                    console.warn('Failed to parse user data:', e);
                }
            }

            setSessionId(newSessionId);
            setMessages([]);
            setCurrentAIResponse('');

            socket.emit('realtime:start-session', {
                sessionId: newSessionId,
                userId,
            });

            console.log('🎙️ Starting Realtime session:', newSessionId);
        } catch (err) {
            console.error('❌ Failed to start session:', err);
            setError('Failed to start session');
            setIsConnecting(false);
        }
    }, [socket, isConnected]);

    // End session
    const endSession = useCallback(async () => {
        if (!socket || !sessionId) {
            return;
        }

        try {
            socket.emit('realtime:end-session', { sessionId });
            console.log('🔚 Ending session:', sessionId);
        } catch (err) {
            console.error('❌ Failed to end session:', err);
        }
    }, [socket, sessionId]);

    // Send audio chunk
    const sendAudioChunk = useCallback(async (chunk: Blob | ArrayBuffer | string | Int16Array) => {
        if (!socket || !sessionId) {
            // console.warn('⚠️ Cannot send audio: no active session');
            return;
        }

        try {
            let base64 = '';

            if (typeof chunk === 'string') {
                base64 = chunk;
            } else if (chunk instanceof Blob) {
                const arrayBuffer = await chunk.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                base64 = btoa(binary);
            } else if (chunk instanceof Int16Array) {
                const bytes = new Uint8Array(chunk.buffer);
                const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                base64 = btoa(binary);
            } else if (chunk instanceof ArrayBuffer) {
                const bytes = new Uint8Array(chunk);
                const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                base64 = btoa(binary);
            }

            socket.emit('realtime:audio-chunk', {
                sessionId,
                audioChunk: base64,
            });
        } catch (err) {
            console.error('❌ Failed to send audio chunk:', err);
        }
    }, [socket, sessionId]);

    // Commit audio buffer (signal end of user speech)
    const commitAudio = useCallback(async () => {
        if (!socket || !sessionId) {
            return;
        }

        try {
            socket.emit('realtime:commit-audio', { sessionId });
            console.log('✅ Audio committed');
        } catch (err) {
            console.error('❌ Failed to commit audio:', err);
        }
    }, [socket, sessionId]);

    return {
        isConnected,
        isConnecting,
        sessionId,
        startSession,
        endSession,
        sendAudioChunk,
        commitAudio,
        messages,
        currentAIResponse,
        isAIResponding,
        isSpeechDetected,
        error,
        sessionInfo,
    };
}
