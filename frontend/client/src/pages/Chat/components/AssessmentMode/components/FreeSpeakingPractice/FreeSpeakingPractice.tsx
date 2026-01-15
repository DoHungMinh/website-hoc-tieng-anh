import React, { useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/utils/constants';
import styles from './FreeSpeakingPractice.module.css';

interface FreeSpeakingPracticeProps {
    topicId: string;
    topicTitle: string;
    topicDescription: string;
    onBack: () => void;
    onStartRecording: () => void;
    onReviewLastScore: (data: any) => void;
}

const FreeSpeakingPractice: React.FC<FreeSpeakingPracticeProps> = ({
    topicId,
    topicTitle,
    topicDescription,
    onBack,
    onStartRecording,
    onReviewLastScore
}) => {
    const [lastScore] = useState<number | null>(5.8);

    const handleReviewLastScore = async () => {
        console.log('Review last score');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vui lòng đăng nhập để xem kết quả');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/free-speaking/latest/${topicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result.success && result.data) {
                console.log('✅ Latest session loaded:', result.data);
                onReviewLastScore(result.data);
            } else {
                alert('Chưa có lịch sử làm bài cho topic này');
            }
        } catch (error) {
            console.error('❌ Error loading latest session:', error);
            alert('Lỗi khi tải kết quả. Vui lòng thử lại.');
        }
    };

    const handleStartPractice = () => {
        console.log('Start practice for topic:', topicId);
        onStartRecording();
    };

    return (
        <div className={styles.freeSpeakingContainer}>
            {/* Header Section */}
            <div className={styles.headerSection}>
                <button onClick={onBack} className={styles.backLink}>
                    <ArrowLeft size={20} />
                    <span>Back to My Assessments</span>
                </button>
                <div className={styles.headerContent}>
                    <h1 className={styles.topicTitle}>{topicTitle}</h1>
                </div>
            </div>

            {/* Two Cards Container */}
            <div className={styles.cardsGrid}>
                {/* Card 1: Last Score (if exists) */}
                {lastScore && (
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>
                            <MessageSquare size={28} color="#8b5cf6" />
                        </div>
                        <h3 className={styles.cardTitle}>{topicTitle}</h3>
                        <p className={styles.cardDescription}>Click here to see your last result</p>
                        <div className={styles.cardFooter}>
                            <button 
                                className={styles.actionButton}
                                style={{ background: '#3b82f6', color: 'white' }}
                                onClick={handleReviewLastScore}
                            >
                                Review
                            </button>
                        </div>
                    </div>
                )}

                {/* Card 2: Current/New Practice */}
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <MessageSquare size={28} color="#8b5cf6" />
                    </div>
                    <h3 className={styles.cardTitle}>{topicTitle}</h3>
                    <p className={styles.cardDescription}>{topicDescription}</p>
                    <div className={styles.cardFooter}>
                        <button 
                            className={styles.actionButton}
                            style={{ background: '#3b82f6', color: 'white' }}
                            onClick={handleStartPractice}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeSpeakingPractice;
