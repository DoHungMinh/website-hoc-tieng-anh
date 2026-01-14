import React, { useState } from 'react';
import { MessageCircle, Target } from 'lucide-react';
import ConversationMode from './components/ConversationMode';
import AssessmentMode from './components/AssessmentMode/AssessmentMode';
import type { SpeakingMode } from './types';
import styles from './Chat.module.css';

/**
 * Voice Chat Page Component
 * Main container for AI Speaking practice with 2 modes
 */
const VoiceChatPage: React.FC = () => {
    const [speakingMode, setSpeakingMode] = useState<SpeakingMode>('conversation');

    return (
        <div className={styles.pageWrapper}>
            {/* Mode Toggle */}
            <div className={styles.modeToggleContainer}>
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeToggleBtn} ${
                            speakingMode === 'conversation' ? styles.modeToggleBtnActive : ''
                        }`}
                        onClick={() => setSpeakingMode('conversation')}
                    >
                        <MessageCircle size={18} />
                        <span>Conversation Mode</span>
                    </button>
                    <button
                        className={`${styles.modeToggleBtn} ${
                            speakingMode === 'assessment' ? styles.modeToggleBtnActive : ''
                        }`}
                        onClick={() => setSpeakingMode('assessment')}
                    >
                        <Target size={18} />
                        <span>Assessment Mode</span>
                    </button>
                </div>
            </div>

            {/* Mode Content */}
            <div className={styles.container}>
                {speakingMode === 'conversation' && <ConversationMode />}
                {speakingMode === 'assessment' && <AssessmentMode />}
            </div>
        </div>
    );
};

export default VoiceChatPage;
