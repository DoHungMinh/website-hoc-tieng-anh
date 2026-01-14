import React, { useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import styles from './FreeSpeakingPractice.module.css';

interface FreeSpeakingPracticeProps {
    topicId: string;
    topicTitle: string;
    topicDescription: string;
    onBack: () => void;
    onStartRecording: () => void;
}

const FreeSpeakingPractice: React.FC<FreeSpeakingPracticeProps> = ({
    topicId,
    topicTitle,
    topicDescription,
    onBack,
    onStartRecording
}) => {
    const [lastScore] = useState<number | null>(5.8);

    const handleReviewLastScore = () => {
        console.log('Review last score');
        // TODO: Navigate to review page
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
                    <div className={styles.completedBadge}>0 of 1 completed</div>
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
                        <p className={styles.cardDescription}>{topicDescription}</p>
                        <div className={styles.cardFooter}>
                            <div className={styles.scoreBadge} style={{ background: '#dc2626' }}>
                                My last score: {lastScore}
                            </div>
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
                        <div className={styles.scoreBadge} style={{ background: '#6b7280', opacity: 0.5 }}>
                            My score: -
                        </div>
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
