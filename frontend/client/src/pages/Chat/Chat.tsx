import React, { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, Loader2, Volume2, ChevronDown, Play, Pause } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { voiceChatAPI } from '@/services/voiceChatAPI';
import type { VoiceOption } from '@/services/voiceChatAPI';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/components/common/Logo/Logo';
import styles from './Chat.module.css';

/**
 * Voice Chat Page Component
 * Full-page voice chat interface with modern design
 */
const VoiceChatPage: React.FC = () => {
    // Voice states
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('nova');
    const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

    // Hooks
    const recorder = useAudioRecorder();
    const player = useAudioPlayer();
    const user = useAuthStore((state) => state.user);

    // Get user's display name
    const displayName = useMemo(() => {
        if (user?.fullName) return user.fullName;
        if (user?.email) return user.email.split('@')[0];
        return 'bạn';
    }, [user]);

    // Load available voices on mount
    useEffect(() => {
        const loadVoices = async () => {
            try {
                const voices = await voiceChatAPI.getAvailableVoices();
                setAvailableVoices(voices);
            } catch (err) {
                console.error('Failed to load voices:', err);
                setAvailableVoices(['nova', 'alloy', 'echo', 'fable', 'onyx', 'shimmer']);
            }
        };
        loadVoices();
    }, []);

    // Handle recording start
    const handleStartRecording = async () => {
        setError(null);
        setTranscript('');
        setAiResponse('');
        recorder.controls.clearRecording();

        try {
            await recorder.controls.startRecording();
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.');
        }
    };

    // Handle recording stop and send to backend
    const handleStopRecording = async () => {
        try {
            if (recorder.state.recordingTime < 1) {
                setError('Vui lòng nói ít nhất 1 giây');
                recorder.controls.clearRecording();
                return;
            }

            const audioBlob = await recorder.controls.stopRecording();

            if (audioBlob && audioBlob.size > 0) {
                if (audioBlob.size < 1000) {
                    setError('Ghi âm quá ngắn. Vui lòng nói rõ hơn.');
                    return;
                }
                await processVoiceMessage(audioBlob);
            } else {
                setError('Không thể ghi âm. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error stopping recording:', err);
            setError('Lỗi dừng ghi âm. Vui lòng thử lại.');
        }
    };

    // Process voice message
    const processVoiceMessage = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setError(null);

        try {
            const result = await voiceChatAPI.sendVoiceMessage(
                audioBlob,
                selectedVoice,
                conversationHistory
            );

            setTranscript(result.transcript);
            setAiResponse(result.response);

            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: result.transcript },
                { role: 'assistant', content: result.response }
            ]);

            // Play audio response
            if (result.audioData) {
                const audioResponseBlob = base64ToBlob(result.audioData, 'audio/mpeg');
                player.controls.loadAudio(audioResponseBlob);
                setTimeout(() => {
                    player.controls.play();
                }, 500);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi xử lý tin nhắn';
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Convert base64 to Blob
    const base64ToBlob = (base64: string, type: string): Blob => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type });
    };

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get status text
    const getStatusText = () => {
        if (isProcessing) return 'Đang xử lý...';
        if (recorder.state.isRecording) return 'Đang ghi âm... Nhấn để dừng';
        if (player.state.isPlaying) return 'Đang phát...';
        return 'Nhấn để bắt đầu nói';
    };

    return (
        <div className={styles.container}>
            {/* Header - Voice Selection */}
            <div className={styles.pageHeader}>
                <div
                    className={styles.modelSelector}
                    onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                >
                    <Volume2 size={18} />
                    <span className={styles.modelName}>
                        {selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}
                    </span>
                    <ChevronDown
                        size={16}
                        className={styles.dropdownIcon}
                        style={{ transform: showVoiceDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
                    />

                    {showVoiceDropdown && (
                        <div className={styles.modelDropdown} onClick={(e) => e.stopPropagation()}>
                            {availableVoices.map((voice) => (
                                <div
                                    key={voice}
                                    className={`${styles.modelOption} ${selectedVoice === voice ? styles.modelOptionActive : ''}`}
                                    onClick={() => {
                                        setSelectedVoice(voice);
                                        setShowVoiceDropdown(false);
                                    }}
                                >
                                    <div className={styles.modelOptionInfo}>
                                        <div className={styles.modelOptionName}>
                                            {voice.charAt(0).toUpperCase() + voice.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Logo with GoPro text */}
                <div className={styles.logoSection}>
                    <Logo height={60} color="#8b5cf6" />
                    <span className={styles.logoText}>GoPro 4.2</span>
                </div>

                {/* Greeting */}
                <div className={styles.greeting}>
                    <h1 className={styles.greetingTitle}>
                        <span className={styles.greetingHighlight}>Xin chào, {displayName}</span>
                    </h1>
                    <p className={styles.greetingSubtitle}>
                        Luyện Speaking cùng AI - Nói tự nhiên, học hiệu quả
                    </p>
                </div>

                {/* Voice Orb / Recording Indicator */}
                <div className={styles.voiceOrbContainer}>
                    <button
                        onClick={recorder.state.isRecording ? handleStopRecording : handleStartRecording}
                        disabled={isProcessing}
                        className={`${styles.voiceOrb} ${recorder.state.isRecording ? styles.voiceOrbRecording : ''
                            } ${player.state.isPlaying ? styles.voiceOrbPlaying : ''} ${isProcessing ? styles.voiceOrbProcessing : ''
                            }`}
                    >
                        <div className={styles.voiceOrbInner}>
                            {isProcessing ? (
                                <Loader2 size={32} className={styles.spinIcon} />
                            ) : recorder.state.isRecording ? (
                                <MicOff size={32} />
                            ) : (
                                <Mic size={32} />
                            )}
                        </div>

                        {/* Pulse rings when recording */}
                        {recorder.state.isRecording && (
                            <>
                                <div className={styles.pulseRing}></div>
                                <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }}></div>
                            </>
                        )}
                    </button>

                    {/* Recording Time */}
                    {recorder.state.isRecording && (
                        <div className={styles.recordingTime}>
                            {formatTime(recorder.state.recordingTime)}
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <p className={styles.statusText}>{getStatusText()}</p>

                {/* Error Display */}
                {error && (
                    <div className={styles.errorBox}>
                        <p>{error}</p>
                    </div>
                )}

                {/* Transcript & Response */}
                {(transcript || aiResponse) && (
                    <div className={styles.transcriptContainer}>
                        {transcript && (
                            <div className={styles.transcriptBox}>
                                <span className={styles.transcriptLabel}>Bạn nói:</span>
                                <p className={styles.transcriptText}>{transcript}</p>
                            </div>
                        )}
                        {aiResponse && (
                            <div className={styles.responseBox}>
                                <span className={styles.responseLabel}>AI:</span>
                                <p className={styles.responseText}>{aiResponse}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Audio Player Controls */}
                {player.state.duration > 0 && (
                    <div className={styles.audioPlayer}>
                        <button
                            onClick={player.state.isPlaying ? player.controls.pause : player.controls.play}
                            className={styles.playButton}
                        >
                            {player.state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max={player.state.duration}
                            value={player.state.currentTime}
                            onChange={(e) => player.controls.seek(Number(e.target.value))}
                            className={styles.progressBar}
                        />
                        <span className={styles.audioTime}>
                            {formatTime(Math.floor(player.state.currentTime))} / {formatTime(Math.floor(player.state.duration))}
                        </span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VoiceChatPage;
