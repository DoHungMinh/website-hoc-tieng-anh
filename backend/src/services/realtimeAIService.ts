import WebSocket from 'ws';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { RealtimeSession, IRealtimeSession } from '../models/RealtimeSession';
import { calculateRealtimeCost, logCostBreakdown, estimateAudioTokens } from '../utils/realtimeCostCalculator';

/**
 * OpenAI Realtime API Event Types
 */
interface RealtimeEvent {
    type: string;
    event_id?: string;
    [key: string]: any;
}

interface SessionConfig {
    modalities: string[];
    instructions: string;
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    turn_detection: {
        type: string;
        threshold: number;
        silence_duration_ms: number;
    };
}

/**
 * Realtime AI Service
 * Quản lý WebSocket connections với OpenAI Realtime API
 */
class RealtimeAIService {
    private io: SocketIOServer | null = null;
    private sessions: Map<string, {
        openaiWs: WebSocket;
        clientSocket: Socket;
        dbSession: IRealtimeSession;
        audioBuffer: Buffer[];
        currentTranscript: string;
        currentResponse: string;
    }> = new Map();

    /**
     * Set Socket.IO server instance
     */
    setSocketIO(io: SocketIOServer): void {
        this.io = io;
        console.log('✅ RealtimeAIService: Socket.IO instance set');
    }

    /**
     * Create new Realtime API session
     */
    async createSession(
        sessionId: string,
        userId: string,
        clientSocket: Socket
    ): Promise<void> {
        try {
            console.log(`🎙️ Creating Realtime API session: ${sessionId}`);

            // Create DB session
            const dbSession = await RealtimeSession.create({
                sessionId,
                userId,
                status: 'active',
                messages: [],
                tokenUsage: {
                    inputTokens: 0,
                    outputTokens: 0,
                    audioInputTokens: 0,
                    audioOutputTokens: 0,
                },
            });

            // Create WebSocket connection to OpenAI
            const openaiWs = new WebSocket(
                `wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'OpenAI-Beta': 'realtime=v1',
                    },
                }
            );

            // Store session
            this.sessions.set(sessionId, {
                openaiWs,
                clientSocket,
                dbSession,
                audioBuffer: [],
                currentTranscript: '',
                currentResponse: '',
            });

            // Setup WebSocket event handlers
            this.setupOpenAIWebSocket(sessionId, openaiWs, clientSocket);

            console.log(`✅ Realtime API session created: ${sessionId}`);
        } catch (error) {
            console.error(`❌ Failed to create session ${sessionId}:`, error);
            clientSocket.emit('realtime:error', {
                message: 'Failed to create session',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Setup OpenAI WebSocket event handlers
     */
    private setupOpenAIWebSocket(
        sessionId: string,
        ws: WebSocket,
        clientSocket: Socket
    ): void {
        ws.on('open', () => {
            console.log(`🔌 OpenAI WebSocket connected for session: ${sessionId}`);

            // Configure session
            const sessionConfig: SessionConfig = {
                modalities: ['text', 'audio'],
                instructions: `You are a helpful English learning assistant. Help users practice speaking English naturally. 
        Provide encouraging feedback and correct pronunciation gently. Keep responses conversational and engaging.`,
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    silence_duration_ms: 500,
                },
            };

            ws.send(JSON.stringify({
                type: 'session.update',
                session: sessionConfig,
            }));

            clientSocket.emit('realtime:connected', { sessionId });
        });

        ws.on('message', (data: WebSocket.Data) => {
            try {
                const event: RealtimeEvent = JSON.parse(data.toString());
                this.handleOpenAIEvent(sessionId, event, clientSocket);
            } catch (error) {
                console.error(`❌ Failed to parse OpenAI event:`, error);
            }
        });

        ws.on('error', (error: Error) => {
            console.error(`❌ OpenAI WebSocket error for session ${sessionId}:`, error);
            clientSocket.emit('realtime:error', {
                message: 'OpenAI connection error',
                error: error.message,
            });
        });

        ws.on('close', () => {
            console.log(`🔌 OpenAI WebSocket closed for session: ${sessionId}`);
            this.cleanupSession(sessionId);
        });
    }

    /**
     * Handle events from OpenAI Realtime API
     */
    private async handleOpenAIEvent(
        sessionId: string,
        event: RealtimeEvent,
        clientSocket: Socket
    ): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        switch (event.type) {
            case 'session.created':
                console.log(`✅ Session created on OpenAI: ${sessionId}`);
                break;

            case 'session.updated':
                console.log(`🔄 Session updated: ${sessionId}`);
                break;

            case 'conversation.item.created':
                // New message in conversation
                if (event.item?.role === 'user') {
                    session.currentTranscript = event.item.content?.[0]?.transcript || '';
                }
                break;

            case 'response.audio.delta':
                // Streaming audio chunk from AI
                const audioChunk = event.delta;
                if (audioChunk) {
                    session.audioBuffer.push(Buffer.from(audioChunk, 'base64'));
                    clientSocket.emit('realtime:audio-delta', {
                        audioChunk,
                    });
                }
                break;

            case 'response.audio.done':
                // Audio response complete
                console.log(`🔊 Audio response complete for session: ${sessionId}`);
                break;

            case 'response.text.delta':
                // Streaming text chunk from AI
                const textChunk = event.delta;
                if (textChunk) {
                    session.currentResponse += textChunk;
                    clientSocket.emit('realtime:text-delta', {
                        textChunk,
                    });
                }
                break;

            case 'response.text.done':
                // Text response complete
                console.log(`📝 Text response complete: ${session.currentResponse.substring(0, 50)}...`);
                break;

            case 'response.done':
                // Complete response finished
                await this.handleResponseComplete(sessionId, event);
                break;

            case 'input_audio_buffer.speech_started':
                console.log(`🎤 User started speaking: ${sessionId}`);
                clientSocket.emit('realtime:speech-started');
                break;

            case 'input_audio_buffer.speech_stopped':
                console.log(`🎤 User stopped speaking: ${sessionId}`);
                clientSocket.emit('realtime:speech-stopped');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                // User's speech transcribed
                const transcript = event.transcript;
                if (transcript) {
                    session.currentTranscript = transcript;
                    console.log(`📝 User transcript: ${transcript}`);

                    // Save user message to DB
                    session.dbSession.messages.push({
                        role: 'user',
                        content: transcript,
                        timestamp: new Date(),
                    });
                    await session.dbSession.save();

                    clientSocket.emit('realtime:transcript', {
                        role: 'user',
                        content: transcript,
                    });
                }
                break;

            case 'error':
                console.error(`❌ OpenAI error for session ${sessionId}:`, event.error);
                clientSocket.emit('realtime:error', {
                    message: 'OpenAI API error',
                    error: event.error,
                });
                break;

            default:
                // Log unknown events for debugging
                if (process.env.NODE_ENV === 'development') {
                    console.log(`📨 OpenAI event [${event.type}]:`, event);
                }
        }
    }

    /**
     * Handle complete response from AI
     */
    private async handleResponseComplete(
        sessionId: string,
        event: RealtimeEvent
    ): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        try {
            // Extract token usage from response
            const usage = event.response?.usage;
            if (usage) {
                session.dbSession.tokenUsage = {
                    inputTokens: session.dbSession.tokenUsage.inputTokens + (usage.input_tokens || 0),
                    outputTokens: session.dbSession.tokenUsage.outputTokens + (usage.output_tokens || 0),
                    audioInputTokens: session.dbSession.tokenUsage.audioInputTokens + (usage.input_token_details?.audio || 0),
                    audioOutputTokens: session.dbSession.tokenUsage.audioOutputTokens + (usage.output_token_details?.audio || 0),
                };
                await session.dbSession.save();

                // Calculate and update cost
                const cost = calculateRealtimeCost(session.dbSession.tokenUsage);
                session.dbSession.estimatedCost = cost;
                await session.dbSession.save();
            }

            // Save AI message to DB
            if (session.currentResponse) {
                session.dbSession.messages.push({
                    role: 'assistant',
                    content: session.currentResponse,
                    timestamp: new Date(),
                });
                await session.dbSession.save();

                session.clientSocket.emit('realtime:response-done', {
                    content: session.currentResponse,
                });

                // Reset for next turn
                session.currentResponse = '';
            }

            console.log(`✅ Response complete for session: ${sessionId}`);
        } catch (error) {
            console.error(`❌ Error handling response complete:`, error);
        }
    }

    /**
     * Send audio chunk to OpenAI
     */
    async sendAudioChunk(sessionId: string, audioData: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || session.openaiWs.readyState !== WebSocket.OPEN) {
            console.warn(`⚠️ Cannot send audio: session ${sessionId} not ready`);
            return;
        }

        try {
            session.openaiWs.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: audioData, // Base64 encoded PCM16 audio
            }));
        } catch (error) {
            console.error(`❌ Failed to send audio chunk:`, error);
        }
    }

    /**
     * Commit audio buffer (signal end of user input)
     */
    async commitAudioBuffer(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || session.openaiWs.readyState !== WebSocket.OPEN) {
            return;
        }

        try {
            session.openaiWs.send(JSON.stringify({
                type: 'input_audio_buffer.commit',
            }));
            console.log(`✅ Audio buffer committed for session: ${sessionId}`);
        } catch (error) {
            console.error(`❌ Failed to commit audio buffer:`, error);
        }
    }

    /**
     * Close session and cleanup
     */
    async closeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`⚠️ Session ${sessionId} not found for closing`);
            return;
        }

        try {
            console.log(`🔚 Closing session: ${sessionId}`);

            // Close OpenAI WebSocket
            if (session.openaiWs.readyState === WebSocket.OPEN) {
                session.openaiWs.close();
            }

            // Complete DB session
            session.dbSession.status = 'completed';
            session.dbSession.endedAt = new Date();
            session.dbSession.totalDuration = Math.floor(
                (session.dbSession.endedAt.getTime() - session.dbSession.startedAt.getTime()) / 1000
            );
            await session.dbSession.save();

            // Log cost breakdown
            logCostBreakdown(session.dbSession);

            // Notify client
            session.clientSocket.emit('realtime:session-closed', {
                sessionId,
                totalDuration: session.dbSession.totalDuration,
                messageCount: session.dbSession.messages.length,
                estimatedCost: session.dbSession.estimatedCost,
            });

            // Remove from active sessions
            this.sessions.delete(sessionId);

            console.log(`✅ Session closed: ${sessionId}`);
        } catch (error) {
            console.error(`❌ Error closing session ${sessionId}:`, error);

            // Mark as error in DB
            if (session.dbSession) {
                session.dbSession.status = 'error';
                session.dbSession.errorMessage = error instanceof Error ? error.message : 'Unknown error';
                session.dbSession.endedAt = new Date();
                await session.dbSession.save();
            }
        }
    }

    /**
     * Cleanup session on unexpected disconnect
     */
    private async cleanupSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        try {
            session.dbSession.status = 'completed';
            session.dbSession.endedAt = new Date();
            session.dbSession.totalDuration = Math.floor(
                (session.dbSession.endedAt.getTime() - session.dbSession.startedAt.getTime()) / 1000
            );
            await session.dbSession.save();
            this.sessions.delete(sessionId);
            console.log(`🧹 Session cleaned up: ${sessionId}`);
        } catch (error) {
            console.error(`❌ Error cleaning up session ${sessionId}:`, error);
        }
    }

    /**
     * Get active session count
     */
    getActiveSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Get session info
     */
    getSessionInfo(sessionId: string): any {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        return {
            sessionId,
            userId: session.dbSession.userId,
            messageCount: session.dbSession.messages.length,
            tokenUsage: session.dbSession.tokenUsage,
            estimatedCost: session.dbSession.estimatedCost,
            status: session.dbSession.status,
        };
    }
}

// Export singleton instance
export const realtimeAIService = new RealtimeAIService();
