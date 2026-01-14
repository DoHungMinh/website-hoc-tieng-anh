import React from 'react';
import { BookOpen, MessageSquare } from 'lucide-react';
import styles from './AssessmentCards.module.css';

interface AssessmentCardsProps {
    onPromptPracticeClick: () => void;
    onTopicPracticeClick: () => void;
}

/**
 * Assessment Cards Component
 * Two cards for selecting practice mode: Prompt or Topic
 */
const AssessmentCards: React.FC<AssessmentCardsProps> = ({
    onPromptPracticeClick,
    onTopicPracticeClick
}) => {
    return (
        <div className={styles.assessmentMode}>
            {/* Welcome Text */}
            <div className={styles.assessmentWelcome}>
                <h2 className={styles.assessmentTitle}>Chọn chế độ luyện tập</h2>
                <p className={styles.assessmentSubtitle}>
                    Cải thiện kỹ năng Speaking của bạn với 2 phương pháp khác nhau
                </p>
            </div>

            {/* Two Cards */}
            <div className={styles.assessmentCards}>
                {/* Card 1: Read Prompt */}
                <div
                    className={styles.assessmentCard}
                    style={{
                        background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                        cursor: 'pointer'
                    }}
                    onClick={onPromptPracticeClick}
                >
                    <div
                        className={styles.cardIcon}
                        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}
                    >
                        <BookOpen size={32} color="white" />
                    </div>
                    <h3 className={styles.cardTitle}>Đọc theo Prompt</h3>
                    <p className={styles.cardDescription}>
                        Luyện phát âm chính xác từng từ, cải thiện pronunciation score
                    </p>
                    <button
                        className={styles.cardButton}
                        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}
                    >
                        Tiếp tục
                    </button>
                </div>

                {/* Card 2: Free Speaking */}
                <div
                    className={styles.assessmentCard}
                    style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
                    onClick={onTopicPracticeClick}
                >
                    <div
                        className={styles.cardIcon}
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                    >
                        <MessageSquare size={32} color="white" />
                    </div>
                    <h3 className={styles.cardTitle}>Nói tự do với Topic</h3>
                    <p className={styles.cardDescription}>
                        Luyện giao tiếp tự nhiên, nâng cao fluency và vocabulary
                    </p>
                    <button
                        className={styles.cardButton}
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentCards;
