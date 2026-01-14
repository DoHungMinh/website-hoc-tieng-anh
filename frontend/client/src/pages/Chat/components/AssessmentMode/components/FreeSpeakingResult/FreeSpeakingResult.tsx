import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import styles from './FreeSpeakingResult.module.css';

interface FreeSpeakingResultProps {
    topicId: string;
    topicTitle: string;
    questions: string[];
    onBack: () => void;
}

interface ScoreData {
    overall: number;
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
}

interface TranscriptWord {
    word: string;
    isCorrect: boolean;
    score: number;
    pauseAfter?: boolean; // true if there's a pause after this word
}

const FreeSpeakingResult: React.FC<FreeSpeakingResultProps> = ({
    topicId,
    topicTitle,
    questions,
    onBack
}) => {
    // Mock data - TODO: Replace with real data from API
    const [scores] = useState<ScoreData>({
        overall: 7.5,
        pronunciation: 8.5,
        fluency: 9,
        vocabulary: 6,
        grammar: 6.5
    });

    const [metrics] = useState({
        badPauses: 2,
        accuracy: 93
    });

    const [audioUrl] = useState('https://example.com/audio.mp3');
    const [isPlaying, setIsPlaying] = useState(false);

    const [transcript] = useState<TranscriptWord[]>([
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'got', isCorrect: true, score: 99 },
        { word: 'my', isCorrect: true, score: 92 },
        { word: 'first', isCorrect: true, score: 88 },
        { word: 'computer', isCorrect: true, score: 94 },
        { word: 'when', isCorrect: true, score: 97 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'was', isCorrect: false, score: 50 },
        { word: 'eight.', isCorrect: true, score: 91, pauseAfter: true },
        { word: 'And', isCorrect: true, score: 96 },
        { word: 'the', isCorrect: false, score: 49 },
        { word: 'first', isCorrect: true, score: 88 },
        { word: 'time', isCorrect: true, score: 93 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'wrote', isCorrect: true, score: 89 },
        { word: 'a', isCorrect: true, score: 98 },
        { word: 'program,', isCorrect: true, score: 87 },
        { word: 'it', isCorrect: true, score: 97 },
        { word: 'was', isCorrect: true, score: 94 },
        { word: 'in', isCorrect: true, score: 96 },
        { word: 'simple', isCorrect: true, score: 85 },
        { word: 'basic', isCorrect: true, score: 90 },
        { word: 'and', isCorrect: true, score: 98 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'just', isCorrect: true, score: 92 },
        { word: 'got', isCorrect: true, score: 99 },
        { word: 'this', isCorrect: true, score: 93 },
        { word: 'feeling', isCorrect: true, score: 86 },
        { word: 'they', isCorrect: true, score: 71 },
        { word: 'got', isCorrect: true, score: 99 },
        { word: 'when', isCorrect: true, score: 97 },
        { word: 'you', isCorrect: true, score: 96, pauseAfter: true },
        { word: 'were', isCorrect: false, score: 48 },
        { word: 'able', isCorrect: true, score: 90 },
        { word: 'to', isCorrect: true, score: 98 },
        { word: 'create', isCorrect: true, score: 87 },
        { word: 'something', isCorrect: true, score: 84 },
        { word: 'and', isCorrect: true, score: 98 },
        { word: 'realized', isCorrect: true, score: 82 },
        { word: 'that', isCorrect: false, score: 52 },
        { word: 'the', isCorrect: true, score: 96 },
        { word: 'freedom', isCorrect: true, score: 81 },
        { word: 'that', isCorrect: true, score: 94 },
        { word: 'you', isCorrect: true, score: 96 },
        { word: 'get', isCorrect: true, score: 97 },
        { word: 'with', isCorrect: true, score: 95 },
        { word: 'programming', isCorrect: true, score: 79 },
        { word: 'your', isCorrect: false, score: 47 },
        { word: 'ability', isCorrect: true, score: 83 },
        { word: 'to', isCorrect: false, score: 51 },
        { word: 'create.', isCorrect: true, score: 89 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'just', isCorrect: true, score: 92 },
        { word: 'fell', isCorrect: true, score: 88 },
        { word: 'in', isCorrect: false, score: 46 },
        { word: 'love', isCorrect: true, score: 94 },
        { word: 'with', isCorrect: true, score: 95 },
        { word: 'that.', isCorrect: true, score: 93 },
        { word: 'And', isCorrect: true, score: 96 },
        { word: 'from', isCorrect: true, score: 91 },
        { word: 'that', isCorrect: false, score: 48 },
        { word: 'point', isCorrect: true, score: 87 },
        { word: 'onwards.', isCorrect: true, score: 85 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'knew', isCorrect: true, score: 86 },
        { word: 'that', isCorrect: true, score: 94 },
        { word: 'I', isCorrect: true, score: 95 },
        { word: 'wanted', isCorrect: true, score: 84 },
        { word: 'to', isCorrect: false, score: 49 },
        { word: 'be', isCorrect: false, score: 50 },
        { word: 'a', isCorrect: true, score: 98 },
        { word: 'software', isCorrect: false, score: 45 },
        { word: 'engineer.', isCorrect: false }
    ]);

    const getScoreColor = (score: number) => {
        if (score >= 8) return '#10b981'; // Green
        if (score >= 6.5) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const toggleAudio = () => {
        setIsPlaying(!isPlaying);
        // TODO: Implement actual audio play/pause
    };

    return (
        <div className={styles.resultContainer}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backButton}>
                    ← Quay lại
                </button>
                <h1 className={styles.questionTitle}>
                    Question 1: {questions.join(' ')}
                </h1>
            </div>

            {/* Overall Score Card */}
            <div className={styles.scoreCard}>
                <div className={styles.overallScore}>
                    <div className={styles.ieltsLabel}>IELTS</div>
                    <div className={styles.scoreValue}>{scores.overall}/9</div>
                </div>

                <div className={styles.scoreBreakdown}>
                    {/* Pronunciation */}
                    <div className={styles.scoreRow}>
                        <span className={styles.scoreLabel}>Pronunciation</span>
                        <div className={styles.scoreBar}>
                            <div
                                className={styles.scoreBarFill}
                                style={{
                                    width: `${(scores.pronunciation / 9) * 100}%`,
                                    background: getScoreColor(scores.pronunciation)
                                }}
                            ></div>
                        </div>
                        <span className={styles.scoreNumber} style={{ color: getScoreColor(scores.pronunciation) }}>
                            {scores.pronunciation}/9
                        </span>
                    </div>

                    {/* Fluency */}
                    <div className={styles.scoreRow}>
                        <span className={styles.scoreLabel}>Fluency</span>
                        <div className={styles.scoreBar}>
                            <div
                                className={styles.scoreBarFill}
                                style={{
                                    width: `${(scores.fluency / 9) * 100}%`,
                                    background: getScoreColor(scores.fluency)
                                }}
                            ></div>
                        </div>
                        <span className={styles.scoreNumber} style={{ color: getScoreColor(scores.fluency) }}>
                            {scores.fluency}/9
                        </span>
                    </div>

                    {/* Vocabulary */}
                    <div className={styles.scoreRow}>
                        <span className={styles.scoreLabel}>Vocabulary</span>
                        <div className={styles.scoreBar}>
                            <div
                                className={styles.scoreBarFill}
                                style={{
                                    width: `${(scores.vocabulary / 9) * 100}%`,
                                    background: getScoreColor(scores.vocabulary)
                                }}
                            ></div>
                        </div>
                        <span className={styles.scoreNumber} style={{ color: getScoreColor(scores.vocabulary) }}>
                            {scores.vocabulary}/9
                        </span>
                    </div>

                    {/* Grammar */}
                    <div className={styles.scoreRow}>
                        <span className={styles.scoreLabel}>Grammar</span>
                        <div className={styles.scoreBar}>
                            <div
                                className={styles.scoreBarFill}
                                style={{
                                    width: `${(scores.grammar / 9) * 100}%`,
                                    background: getScoreColor(scores.grammar)
                                }}
                            ></div>
                        </div>
                        <span className={styles.scoreNumber} style={{ color: getScoreColor(scores.grammar) }}>
                            {scores.grammar}/9
                        </span>
                    </div>
                </div>
            </div>

            {/* Transcript Section */}
            <div className={styles.transcriptSection}>
                <div className={styles.transcriptHeader}>
                    <h3 className={styles.sectionTitle}>Fluency | Pronunciation</h3>
                    <div className={styles.metrics}>
                        <div className={styles.metric}>
                            <div className={styles.metricBadge} style={{ background: '#f59e0b' }}>
                                {metrics.badPauses}
                            </div>
                            <span className={styles.metricLabel}>bad pauses</span>
                        </div>
                        <div className={styles.metric}>
                            <div className={styles.metricBadge} style={{ background: '#10b981' }}>
                                {metrics.accuracy}%
                            </div>
                            <span className={styles.metricLabel}>Accuracy</span>
                        </div>
                    </div>
                </div>

                {/* Audio Player */}
                <div className={styles.audioPlayer}>
                    <button className={styles.playButton} onClick={toggleAudio}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <audio src={audioUrl} className={styles.audioElement}></audio>
                </div>

                {/* Transcript Text */}
                <div className={styles.transcriptText}>
                    {transcript.map((item, index) => (
                        <React.Fragment key={index}>
                            <div className={`${styles.wordBox} ${item.isCorrect ? styles.wordBoxCorrect : styles.wordBoxError}`}>
                                <span className={styles.wordIcon}>
                                    {item.isCorrect ? '✓' : '✕'}
                                </span>
                                <span className={styles.wordText}>{item.word}</span>
                                <span className={styles.wordScore}>({item.score})</span>
                            </div>
                            {item.pauseAfter && <span className={styles.pauseMarker}>●</span>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Pronunciation Score */}
                <div className={styles.pronunciationScore}>
                    <div className={styles.scoreCircle}>
                        {scores.pronunciation}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeSpeakingResult;
