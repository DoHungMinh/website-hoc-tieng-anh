import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Play, XCircle } from 'lucide-react';
import { useRealtimeAI } from '@/hooks/useRealtimeAI';
import Logo from '@/components/common/Logo/Logo';
import styles from './ConversationMode.module.css';

/**
 * Conversation Mode Component  
 * Voice chat interface with AI using OpenAI Realtime API
 */
const ConversationMode: React.FC = () => {
    const {
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

    } = useRealtimeAI();

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAudioDataRef = useRef<boolean>(false);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentAIResponse]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionId) {
                endSession();
            }
            stopRecording();
        };
    }, [sessionId, endSession]);

    // Start recording
    const startRecording = async () => {
        try {
            // Start session if not already started
            if (!sessionId) {
                await startSession();
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 24000,
                },
            });
            streamRef.current = stream;

            // AudioContext setup for PCM16 conversion
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Buffer = new Int16Array(inputData.length);

                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                sendAudioChunk(int16Buffer as any);
                hasAudioDataRef.current = true;
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);

            // Start recording timer
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('❌ Failed to start recording:', err);
            alert('Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.');
        }
    };

    // Stop recording
    const stopRecording = () => {
        // Disconnect and cleanup Audio Nodes
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }

        // Commit remaining audio
        if (isRecording && sessionId) {
            commitAudio();
        }

        setIsRecording(false);
        setRecordingTime(0);
    };



    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get status text
    const getStatusText = () => {
        if (!isConnected) return 'Đang kết nối...';
        if (isConnecting) return 'Đang khởi tạo session...';
        if (!sessionId) return 'Nhấn "Start Session" để bắt đầu';
        if (isRecording) return 'Đang ghi âm... Nhấn để dừng';
        if (isAIResponding) return 'AI đang trả lời...';
        if (isSpeechDetected) return 'Đang phát hiện giọng nói...';
        return 'Nhấn để bắt đầu nói';
    };

    const hasConversation = messages.length > 0 || currentAIResponse;

    return (
        <>
            {/* Main Content */}
            <div className={styles.mainArea}>
                {/* Header - Hidden for cleaner UI */}
                {/* <div className={styles.pageHeader}>
                    <div className={styles.modelSelector}>
                        <span className={styles.modelName}>OpenAI Realtime API (Mini)</span>
                        <span className={styles.modelBadge}>
                            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                        </span>
                    </div>
                </div> */}

                <main className={styles.mainContent}>
                    {/* Welcome Screen - Always visible */}
                    <div className={styles.logoSection}>
                        <Logo height={60} color="#8b5cf6" />
                        <span className={styles.logoText}>Realtime AI</span>
                    </div>

                    <div className={styles.greeting}>
                        <h1 className={styles.greetingTitle}>
                            <span className={styles.greetingHighlight}>Realtime Voice Chat</span>
                        </h1>
                        <p className={styles.greetingSubtitle}>
                            Low-latency AI conversation với OpenAI Realtime API
                        </p>
                    </div>



                    {/* Chat Messages */}
                    {hasConversation && (
                        <div className={styles.chatMessages}>
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`${styles.messageRow} ${message.role === 'user'
                                        ? styles.messageRowUser
                                        : styles.messageRowAssistant
                                        }`}
                                >
                                    <div className={styles.messageContent}>
                                        <div className={styles.messageAvatar}>
                                            {message.role === 'user' ? (
                                                <span>U</span>
                                            ) : (
                                                <Logo height={24} color="#8b5cf6" />
                                            )}
                                        </div>
                                        <div className={styles.messageText}>
                                            <div className={styles.messageSender}>
                                                {message.role === 'user' ? 'Bạn' : 'AI'}
                                            </div>
                                            <p>{message.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Current AI Response (streaming) */}
                            {currentAIResponse && (
                                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                                    <div className={styles.messageContent}>
                                        <div className={styles.messageAvatar}>
                                            <Logo height={24} color="#8b5cf6" />
                                        </div>
                                        <div className={styles.messageText}>
                                            <div className={styles.messageSender}>AI</div>
                                            <p>{currentAIResponse}</p>
                                            <span className={styles.typingIndicator}>●●●</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Voice Orb / Recording Indicator */}
                    <div className={styles.voiceOrbContainer}>
                        {!sessionId ? (
                            <button
                                onClick={startSession}
                                disabled={!isConnected || isConnecting}
                                className={styles.startSessionBtn}
                            >
                                {isConnecting ? (
                                    <>
                                        <Loader2 size={20} className={styles.spinIcon} />
                                        <span>Đang khởi tạo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} />
                                        <span>Start Session</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isAIResponding}
                                className={`${styles.voiceOrb} ${isRecording ? styles.voiceOrbRecording : ''
                                    } ${isAIResponding ? styles.voiceOrbProcessing : ''}`}
                            >
                                <div className={styles.voiceOrbInner}>
                                    {isAIResponding ? (
                                        <Loader2 size={20} className={styles.spinIcon} />
                                    ) : isRecording ? (
                                        <MicOff size={20} />
                                    ) : (
                                        <Mic size={20} />
                                    )}
                                </div>

                                {/* Pulse rings when recording */}
                                {isRecording && (
                                    <>
                                        <div className={styles.pulseRing}></div>
                                        <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }}></div>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Recording Time */}
                        {isRecording && (
                            <div className={styles.recordingTime}>{formatTime(recordingTime)}</div>
                        )}
                    </div>

                    {/* Status Text */}
                    <p className={styles.statusText}>{getStatusText()}</p>

                    {/* Error Display */}
                    {error && (
                        <div className={styles.errorBox}>
                            <XCircle size={16} />
                            <p>{error}</p>
                        </div>
                    )}


                    {/* Session Info - Hidden for cleaner UI */}
                    {/* {sessionId && (
                        <div className={styles.sessionInfoBox}>
                            <p className={styles.sessionId}>Session: {sessionId.substring(0, 20)}...</p>
                            {messages.length > 0 && (
                                <p className={styles.messageCount}>{messages.length} messages</p>
                            )}
                        </div>
                    )} */}
                </main>
            </div >
        </>
    );
};

export default ConversationMode;
