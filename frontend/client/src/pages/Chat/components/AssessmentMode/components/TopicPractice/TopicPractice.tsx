import React from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './TopicPractice.module.css';

interface TopicPracticeProps {
    onBack: () => void;
    onSelectTopic: (topicId: string, topicTitle: string, topicDescription: string) => void;
}

interface Topic {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    progress: number;
    total: number;
    gradient: string;
}

const TOPICS: Topic[] = [
    {
        id: 'food',
        title: 'Food',
        description: 'Speaking test on food',
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
        progress: 0,
        total: 1,
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
    },
    {
        id: 'family',
        title: 'Family',
        description: 'Speaking test on family',
        imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
        progress: 0,
        total: 1,
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)'
    },
    {
        id: 'animals',
        title: 'Animals',
        description: 'Speaking test on animals',
        imageUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=300&fit=crop',
        progress: 0,
        total: 1,
        gradient: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)'
    }
];

const TopicPractice: React.FC<TopicPracticeProps> = ({ onBack, onSelectTopic }) => {
    const handleStartTopic = (topicId: string) => {
        const topic = TOPICS.find(t => t.id === topicId);
        if (topic) {
            onSelectTopic(topicId, topic.title, topic.description);
        }
    };

    return (
        <div className={styles.topicPracticeContainer}>
            {/* Header with Back Button */}
            <div className={styles.topicHeader}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.mainTitle}>Speaking Tests</h1>
            </div>

            {/* Topics Grid */}
            <div className={styles.topicsGrid}>
                {TOPICS.map((topic) => (
                    <div
                        key={topic.id}
                        className={styles.topicCard}
                        style={{ background: topic.gradient }}
                    >
                        {/* Topic Image */}
                        <div className={styles.topicImageContainer}>
                            <img
                                src={topic.imageUrl}
                                alt={topic.title}
                                className={styles.topicImage}
                            />
                        </div>

                        {/* Topic Content */}
                        <div className={styles.topicContent}>
                            <h3 className={styles.topicTitle}>{topic.title}</h3>
                            <p className={styles.topicDescription}>{topic.description}</p>

                            {/* Progress Badge and Start Button */}
                            <div className={styles.topicFooter}>
                                <div className={styles.progressBadge}>
                                    {topic.progress}/{topic.total}
                                </div>
                                <button
                                    className={styles.startButton}
                                    onClick={() => handleStartTopic(topic.id)}
                                >
                                    Start
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicPractice;
