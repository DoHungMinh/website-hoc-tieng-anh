import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Square, Loader2, Volume2 } from 'lucide-react';
import styles from './PromptPractice.module.css';

// Word Score Interface (updated: 70% threshold)
interface PhoneScore {
    phone: string;
    soundMostLike: string;
    score: number;
}

interface WordScore {
    word: string;
    score: number;
    startTime: number;
    endTime: number;
    phoneScores: PhoneScore[];
}

interface PromptPracticeProps {
    onBack: () => void;
}

// 16 Prompts for practice - Difficulty increases gradually (max 25 words)
const PROMPTS = [
    // Level 1: Very Simple (7 words)
    "I like to travel around the world",
    
    // Level 2: Simple (10 words)
    "She studies English every morning before going to school",
    
    // Level 3: Simple compound (14 words)
    "The weather is beautiful today, so we decided to go for a walk",
    
    // Level 4: Medium simple (17 words)
    "We enjoy eating delicious food together with our family and friends on weekends at home",
    
    // Level 5: Medium (19 words)
    "He works hard every day to achieve his goals and dreams, always staying focused and determined",
    
    // Level 6: Medium-long (21 words)
    "Learning new languages opens many opportunities for personal growth and career advancement in today's global connected world",
    
    // Level 7: Longer (23 words)
    "My family loves spending time at the beach during summer vacation. We build sandcastles, swim in the ocean, and play volleyball",
    
    // Level 8: Complex (25 words)
    "Technology has changed our lives dramatically in recent years. We can now communicate instantly with people worldwide and access unlimited information online",
    
    // Level 9: Progressive (24 words)
    "Reading books helps improve vocabulary and knowledge significantly. When you read regularly, you expose yourself to new words and interesting ideas",
    
    // Level 10: Detailed (25 words)
    "Exercise and healthy eating are important for wellness. Regular physical activity strengthens your heart, builds muscle, and boosts energy levels throughout the day",
    
    // Level 11: Extended (23 words)
    "Music brings people together from different cultures and backgrounds. It transcends language barriers and creates emotional connections that last forever",
    
    // Level 12: Narrative (25 words)
    "Environmental protection is everyone's responsibility now. Climate change threatens our planet's future. We must act by reducing waste, conserving energy, and supporting sustainable practices",
    
    // Level 13: Discussion (24 words)
    "Communication skills are essential in the modern workplace. Effective communicators express ideas clearly, listen actively, and resolve conflicts diplomatically with patience and understanding",
    
    // Level 14: Explanation (25 words)
    "Traveling abroad broadens your perspective remarkably. When you visit foreign countries, you experience different cultures, taste exotic cuisines, and meet diverse interesting people everywhere",
    
    // Level 15: Academic (24 words)
    "Online education provides flexible learning opportunities worldwide. Students can access courses from prestigious universities, learn at their own pace, and balance education with work",
    
    // Level 16: Final challenge (25 words)
    "Developing good habits takes time, patience, and consistent effort. Whether exercising regularly, eating healthier, or reading more, start small and stay committed always"
];

/**
 * Prompt Practice Component
 * Practice screen for reading prompts with pronunciation scoring
 */
const PromptPractice: React.FC<PromptPracticeProps> = ({ onBack }) => {
    // Practice states
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [userTranscript, setUserTranscript] = useState<string>('');
    const [pronunciationScore, setPronunciationScore] = useState<number>(0);
    const [wordScores, setWordScores] = useState<WordScore[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [promptAudioUrl, setPromptAudioUrl] = useState<string>('');
    const [userAudioUrl, setUserAudioUrl] = useState<string>(''); // User's recorded audio URL
    
    // Historical result states
    const [hasHistory, setHasHistory] = useState(false);
    const [historicalDate, setHistoricalDate] = useState<string>('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(44);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const currentPrompt = PROMPTS[currentPromptIndex];
    const totalPrompts = PROMPTS.length;

    // Fetch latest session on mount or prompt change
    useEffect(() => {
        const fetchLatestSession = async () => {
            try {
                setIsLoadingHistory(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.warn('⚠️ No auth token found');
                    setHasHistory(false);
                    return;
                }

                console.log(`🔍 Fetching latest session for prompt ${currentPromptIndex}...`);

                const response = await fetch(
                    `/api/pronunciation/latest-session/${currentPromptIndex}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 404) {
                    // No history found - first time user
                    console.log('ℹ️ No history found - first attempt');
                    setHasHistory(false);
                    setShowResult(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }

                const result = await response.json();
                
                if (result.success && result.data) {
                    console.log('✅ History found:', result.data);
                    
                    // Load historical data
                    setUserTranscript(result.data.transcript);
                    setPronunciationScore(result.data.overallScore);
                    setWordScores(result.data.wordScores);
                    setUserAudioUrl(result.data.userAudioUrl || '');
                    
                    // Format date: "Hoàn thành lúc: 14/01/2026 15:30"
                    const completedDate = new Date(result.data.completedAt || Date.now());
                    const formattedDate = `Hoàn thành lúc: ${completedDate.toLocaleDateString('vi-VN')} ${completedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
                    setHistoricalDate(formattedDate);
                    
                    setHasHistory(true);
                    setShowResult(true); // Show 2-column layout
                } else {
                    setHasHistory(false);
                    setShowResult(false);
                }

            } catch (error) {
                console.error('❌ Failed to fetch latest session:', error);
                setHasHistory(false);
                setShowResult(false);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchLatestSession();
    }, [currentPromptIndex]);

    // Countdown timer effect
    useEffect(() => {
        if (isRecording && countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (isRecording && countdown === 0) {
            // Auto stop when countdown reaches 0
            handleStopRecording();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording, countdown]);

    const handleStopRecording = async () => {
        setIsRecording(false);
        setIsLoading(true);
        setError('');
        
        // Clear timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Stop MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            // Wait for ondataavailable to finish
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
            // Create audio blob from chunks
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            if (audioBlob.size === 0) {
                throw new Error('Không có dữ liệu audio được ghi nhận');
            }

            console.log('📤 Uploading audio for scoring...', audioBlob.size, 'bytes');

            // Prepare FormData
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('promptIndex', currentPromptIndex.toString());
            formData.append('promptText', currentPrompt);

            // Get token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            // Call API
            const response = await fetch('/api/pronunciation/score', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể chấm điểm');
            }

            const result = await response.json();
            console.log('✅ Scoring result:', result);

            // Update UI with new results
            setUserTranscript(result.data.transcript);
            setPronunciationScore(result.data.overallScore);
            setWordScores(result.data.wordScores);
            setUserAudioUrl(result.data.userAudioUrl || ''); // Save user's audio URL
            
            // Update historical data (this is now the new "latest")
            setHasHistory(true);
            const completedDate = new Date();
            const formattedDate = `Hoàn thành lúc: ${completedDate.toLocaleDateString('vi-VN')} ${completedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            setHistoricalDate(formattedDate);
            
            setShowResult(true);
            
        } catch (error: unknown) {
            console.error('❌ Scoring error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi chấm điểm';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setCountdown(44);
            audioChunksRef.current = [];
        }
    };

    const handleRecording = async () => {
        if (!isRecording) {
            // Start recording
            try {
                setError('');
                console.log('🎤 Requesting microphone access...');
                
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Create MediaRecorder
                const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm';
                
                const recorder = new MediaRecorder(stream, { mimeType });
                
                audioChunksRef.current = [];
                
                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };
                
                recorder.onstop = () => {
                    console.log('🛑 Recording stopped');
                    stream.getTracks().forEach(track => track.stop());
                };
                
                recorder.start();
                mediaRecorderRef.current = recorder;
                
                setIsRecording(true);
                setCountdown(44);
                
                console.log('✅ Recording started');
            } catch (error: unknown) {
                console.error('❌ Failed to start recording:', error);
                setError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
            }
        } else {
            // Stop recording manually
            await handleStopRecording();
        }
    };

    const playPromptAudio = async () => {
        try {
            // Fetch or use cached prompt audio
            let audioUrl = promptAudioUrl;
            
            if (!audioUrl) {
                console.log('🎵 Fetching prompt audio...');
                const response = await fetch(
                    `/api/pronunciation/prompt-audio/${currentPromptIndex}?promptText=${encodeURIComponent(currentPrompt)}`
                );
                
                if (!response.ok) {
                    throw new Error('Không thể tải audio');
                }
                
                const result = await response.json();
                audioUrl = result.data.audioUrl;
                setPromptAudioUrl(audioUrl);
            }
            
            // Play audio
            const audio = new Audio(audioUrl);
            audio.play();
            console.log('✅ Playing prompt audio');
            
        } catch (error: unknown) {
            console.error('❌ Failed to play prompt audio:', error);
            setError('Không thể phát audio');
        }
    };

    const playUserAudio = () => {
        if (!userAudioUrl) {
            console.warn('⚠️ No user audio URL available');
            setError('Chưa có audio của bạn');
            return;
        }
        
        try {
            console.log('🎤 Playing user audio:', userAudioUrl);
            const audio = new Audio(userAudioUrl);
            audio.play();
            console.log('✅ Playing user audio');
        } catch (error: unknown) {
            console.error('❌ Failed to play user audio:', error);
            setError('Không thể phát audio của bạn');
        }
    };

    const handleRetry = () => {
        // Clear all result states
        setShowResult(false);
        setUserTranscript('');
        setPronunciationScore(0);
        setWordScores([]);
        setUserAudioUrl('');
        
        // Clear historical states (back to first-time state)
        setHasHistory(false);
        setHistoricalDate('');
        
        // Reset recording states
        setIsRecording(false);
        setIsLoading(false);
        setCountdown(44);
        setError('');
        
        console.log('🔄 Retry: Reset to first-time state');
    };

    const handleNext = () => {
        if (currentPromptIndex < PROMPTS.length - 1) {
            setCurrentPromptIndex(currentPromptIndex + 1);
            setShowResult(false);
            setUserTranscript('');
            setPronunciationScore(0);
            setWordScores([]);
            setUserAudioUrl('');
            setPromptAudioUrl('');
            setIsRecording(false);
            setIsLoading(false);
            setCountdown(44);
            setError('');
        }
    };

    const handlePrevious = () => {
        if (currentPromptIndex > 0) {
            setCurrentPromptIndex(currentPromptIndex - 1);
            setShowResult(false);
            setUserTranscript('');
            setPronunciationScore(0);
            setWordScores([]);
            setUserAudioUrl('');
            setPromptAudioUrl('');
            setError('');
        }
    };

    return (
        <div className={styles.promptPracticeView}>
            {/* Header */}
            <div className={styles.practiceHeader}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Back
                </button>
                <h2 className={styles.practiceTitle}>
                    Đọc theo Prompt - Bài {currentPromptIndex + 1}/{totalPrompts}
                </h2>
            </div>

            {/* Main Content */}
            <div className={styles.practiceContent}>
                {/* Conditional Layout: Full-width prompt hoặc 2-column với result */}
                {!showResult ? (
                    /* Full-width centered prompt khi chưa có result */
                    <div className={styles.promptDisplayFullWidth}>
                        <p className={styles.promptText}>"{currentPrompt}"</p>
                        <button className={styles.listenButton} onClick={playPromptAudio}>
                            <Volume2 size={18} />
                            <span>Nghe cách đọc chuẩn</span>
                        </button>
                    </div>
                ) : (
                    /* 2-column layout: Prompt (Left) + Result Panel (Right) */
                    <div className={styles.topSection}>
                        {/* Prompt Display - Left */}
                        <div className={styles.promptDisplay}>
                            <p className={styles.promptText}>"{currentPrompt}"</p>
                            <button className={styles.listenButton} onClick={playPromptAudio}>
                                <Volume2 size={18} />
                                <span>Nghe cách đọc chuẩn</span>
                            </button>
                        </div>

                        {/* Result Panel - Right */}
                        <div className={styles.resultPanel}>
                            {/* Show loading indicator while fetching history */}
                            {isLoadingHistory ? (
                                <div className={styles.loadingHistory}>
                                    <Loader2 size={24} className={styles.spinner} />
                                    <p>Đang tải lịch sử...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Historical Audio Player (if has history) */}
                                    {hasHistory && userAudioUrl && (
                                        <div className={styles.resultPanelSection}>
                                            <h4 className={styles.resultPanelLabel}>📼 Recording lần trước</h4>
                                            <audio 
                                                controls 
                                                src={userAudioUrl}
                                                className={styles.audioPlayer}
                                                preload="metadata"
                                            >
                                                Trình duyệt không hỗ trợ audio player.
                                            </audio>
                                            {historicalDate && (
                                                <p className={styles.historicalTimestamp}>{historicalDate}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Transcript */}
                                    <div className={styles.resultPanelSection}>
                                        <h4 className={styles.resultPanelLabel}>Transcript của bạn:</h4>
                                        <div className={styles.transcriptBox}>
                                            <p className={styles.userTranscript}>{userTranscript}</p>
                                        </div>
                                    </div>

                            {/* Score */}
                            <div className={styles.resultPanelSection}>
                                <h4 className={styles.resultPanelLabel}>Pronunciation Score:</h4>
                                <div className={styles.scoreDisplay}>
                                    <span className={styles.scoreNumber}>{pronunciationScore}</span>
                                    <span className={styles.scoreMax}>/100</span>
                                </div>
                                <div className={styles.scoreBar}>
                                    <div
                                        className={styles.scoreBarFill}
                                        style={{
                                            width: `${pronunciationScore}%`,
                                            background:
                                                pronunciationScore >= 80
                                                    ? '#10b981'
                                                    : pronunciationScore >= 60
                                                    ? '#f59e0b'
                                                    : '#ef4444'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Word Details */}
                            <div className={styles.resultPanelSection}>
                                <h4 className={styles.resultPanelLabel}>Chi tiết từng từ:</h4>
                                <div className={styles.wordScoresGrid}>
                                    {wordScores.map((wordScore, index) => {
                                        const isCorrect = wordScore.score >= 70;
                                        return (
                                            <div
                                                key={index}
                                                className={`${styles.wordScoreItem} ${
                                                    isCorrect ? styles.wordScoreCorrect : styles.wordScoreError
                                                }`}
                                            >
                                                <span className={styles.wordScoreIcon}>
                                                    {isCorrect ? '✅' : '❌'}
                                                </span>
                                                <span className={styles.wordScoreWord}>{wordScore.word}</span>
                                                <span className={styles.wordScoreNumber}>({wordScore.score})</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Middle Section: Mic Button / Loading */}
                {!showResult && (
                    <div className={styles.practiceMicContainer}>
                        {error && (
                            <div className={styles.errorMessage}>
                                <p>{error}</p>
                            </div>
                        )}
                        {isLoading ? (
                            /* Loading State */
                            <>
                                <div className={styles.loadingSpinner}>
                                    <Loader2 size={40} className={styles.spinIcon} />
                                </div>
                                <p className={styles.micHint}>Đang chấm điểm...</p>
                            </>
                        ) : (
                            /* Recording Button */
                            <>
                                <button 
                                    className={`${styles.practiceMicButton} ${isRecording ? styles.recording : ''}`} 
                                    onClick={handleRecording}
                                    disabled={isLoading}
                                >
                                    {isRecording ? <Square size={40} /> : <Mic size={40} />}
                                </button>
                                {isRecording ? (
                                    <div className={styles.countdownContainer}>
                                        <p className={styles.countdownText}>{countdown}s</p>
                                        <p className={styles.micHint}>Click để dừng ghi âm</p>
                                    </div>
                                ) : (
                                    <p className={styles.micHint}>Click để bắt đầu ghi âm (tối đa 44 giây)</p>
                                )}
                            </>
                        )}
                    </div>
                )}
                {/* Bottom Section: Navigation Buttons */}
                <div className={styles.navigationButtons}>
                    {currentPromptIndex > 0 && (
                        <button className={styles.navButton} onClick={handlePrevious}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path
                                    d="M19 12H5M12 19l-7-7 7-7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>Bài trước</span>
                        </button>
                    )}
                    {currentPromptIndex < PROMPTS.length - 1 && (
                        <button className={`${styles.navButton} ${styles.navButtonPrimary}`} onClick={handleNext}>
                            <span>Bài tiếp</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path
                                    d="M5 12h14M12 5l7 7-7 7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Action Buttons (chỉ hiện khi có result) */}
                {showResult && (
                    <div className={styles.resultActions}>
                        <button 
                            className={styles.resultButton}
                            onClick={playUserAudio}
                            disabled={!userAudioUrl}
                        >
                            <Play size={18} />
                            <span>Nghe lại giọng bạn</span>
                        </button>
                        <button className={styles.resultButton} onClick={handleRetry}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path
                                    d="M1 4v6h6M23 20v-6h-6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>Thử lại</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptPractice;
