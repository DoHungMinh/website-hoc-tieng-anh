import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import styles from './FreeSpeakingResult.module.css';

interface FreeSpeakingResultProps {
    topicId: string;
    topicTitle: string;
    questions: string[];
    resultData: any;  // Real data từ API
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
    resultData,
    onBack
}) => {
    // Use real data from API
    const scores = resultData.scores || {
        overall: 0,
        pronunciation: 0,
        fluency: 0,
        vocabulary: 0,
        grammar: 0
    };

    const metrics = resultData.metrics || {
        badPauses: 0,
        accuracy: 0
    };

    const audioUrl = resultData.userAudioUrl || '';
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Debug log
    console.log('🎵 FreeSpeakingResult - Audio URL:', audioUrl);
    console.log('📊 FreeSpeakingResult - Scores:', scores);

    // Transform wordScores từ API sang format của UI
    const transcript = (resultData.wordScores || []).map((item: any) => ({
        word: item.word,
        isCorrect: item.score >= 70,  // Green if >= 70, Red if < 70
        score: item.score,
        pauseAfter: item.pauseAfter || false
    }));

    const getScoreColor = (score: number) => {
        if (score >= 8) return '#10b981'; // Green
        if (score >= 6.5) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const toggleAudio = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(err => {
                console.error('❌ Audio play failed:', err);
                alert('Không thể phát audio. Vui lòng thử lại.');
            });
            setIsPlaying(true);
        }
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
                    <audio 
                        ref={audioRef}
                        src={audioUrl} 
                        className={styles.audioElement}
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                    ></audio>
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
            </div>
        </div>
    );
};

export default FreeSpeakingResult;
