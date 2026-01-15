import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/utils/constants';
import styles from './FreeSpeakingRecording.module.css';

interface FreeSpeakingRecordingProps {
    topicId: string;
    topicTitle: string;
    onBack: () => void;
    onViewResult: (data: any) => void;
}

interface TopicQuestions {
    [key: string]: string[];
}

const TOPIC_QUESTIONS: TopicQuestions = {
    food: [
        "What is your favorite dish to eat and why?",
        "What dish or food can you make and how do you make it?"
    ],
    family: [
        "How big is your family and who all are in it?",
        "What is your favorite memory with your family?"
    ],
    animals: [
        "What is your favorite animal and why?",
        "Do you think it is ok to keep animals in a zoo?"
    ]
};

const FreeSpeakingRecording: React.FC<FreeSpeakingRecordingProps> = ({
    topicId,
    topicTitle,
    onBack,
    onViewResult
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(44);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [resultData, setResultData] = useState<any>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const countdownIntervalRef = useRef<number | null>(null);

    const questions = TOPIC_QUESTIONS[topicId] || [];

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                handleSubmitRecording(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setCountdown(44);

            // Start countdown timer
            countdownIntervalRef.current = window.setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Stop recording when countdown reaches 0
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                            countdownIntervalRef.current = null;
                        }
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmitRecording = async (blob: Blob) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            formData.append('topicId', topicId);
            formData.append('topicTitle', topicTitle);
            formData.append('questions', JSON.stringify(questions));

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vui lòng đăng nhập để tiếp tục');
                setIsLoading(false);
                return;
            }

            console.log('📤 Submitting recording for topic:', topicId);

            const response = await fetch(`${API_BASE_URL}/free-speaking/score`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Scoring completed:', result.data);
                console.log('📊 Scores received:', result.data.scores);
                setResultData(result.data);
                setIsCompleted(true);
            } else {
                console.error('❌ Scoring failed:', result.error);
                alert(`Không thể chấm điểm: ${result.error}`);
                setIsLoading(false);
            }

        } catch (error) {
            console.error('❌ Error submitting recording:', error);
            alert('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
            setIsLoading(false);
        }
    };

    const handleViewResult = () => {
        if (resultData) {
            onViewResult(resultData);
        }
    };

    return (
        <div className={styles.recordingContainer}>
            {/* Main Card */}
            <div className={styles.recordingCard}>
                {/* Judge/Examiner Image */}
                <div className={styles.judgeSection}>
                    <img
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
                        alt="Examiner"
                        className={styles.judgeImage}
                    />
                </div>

                {/* Questions Section */}
                <div className={styles.questionsSection}>
                    <h2 className={styles.questionTitle}>
                        {topicTitle}
                    </h2>
                    {questions.map((question, index) => (
                        <p key={index} className={styles.question}>
                            {question}
                        </p>
                    ))}
                </div>

                {/* Recording Controls */}
                <div className={styles.controlsSection}>
                    {!isRecording && !isLoading && !isCompleted && (
                        <button
                            className={styles.micButton}
                            onClick={startRecording}
                        >
                            <Mic size={32} />
                        </button>
                    )}

                    {isRecording && (
                        <>
                            <div className={styles.recordingIndicator}>
                                <div className={styles.pulse}></div>
                                <span className={styles.recordingText}>Recording...</span>
                            </div>
                            <div className={styles.countdown}>{countdown}s</div>
                            <button
                                className={styles.stopButton}
                                onClick={stopRecording}
                            >
                                Dừng lại
                            </button>
                        </>
                    )}

                    {isLoading && !isCompleted && (
                        <div className={styles.loadingSection}>
                            <Loader2 size={48} className={styles.spinner} />
                            <p className={styles.loadingText}>Đang chấm điểm...</p>
                        </div>
                    )}

                    {isCompleted && (
                        <button
                            className={styles.viewResultButton}
                            onClick={handleViewResult}
                        >
                            Xem kết quả
                        </button>
                    )}
                </div>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className={styles.backButton}>
                ← Quay lại
            </button>
        </div>
    );
};

export default FreeSpeakingRecording;
