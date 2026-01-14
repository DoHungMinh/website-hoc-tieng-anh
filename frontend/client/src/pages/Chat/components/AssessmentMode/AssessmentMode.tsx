import React, { useState } from 'react';
import AssessmentCards from './components/AssessmentCards';
import PromptPractice from './components/PromptPractice';

// Assessment View Type
type AssessmentView = 'cards' | 'prompt-practice' | 'topic-practice';

/**
 * Assessment Mode Container Component
 * Manages view state and navigation between assessment screens
 */
const AssessmentMode: React.FC = () => {
    const [assessmentView, setAssessmentView] = useState<AssessmentView>('cards');

    const handlePromptPracticeClick = () => {
        setAssessmentView('prompt-practice');
    };

    const handleTopicPracticeClick = () => {
        setAssessmentView('topic-practice');
        // TODO: Implement Topic Practice component
    };

    const handleBackToCards = () => {
        setAssessmentView('cards');
    };

    return (
        <>
            {assessmentView === 'cards' && (
                <AssessmentCards
                    onPromptPracticeClick={handlePromptPracticeClick}
                    onTopicPracticeClick={handleTopicPracticeClick}
                />
            )}

            {assessmentView === 'prompt-practice' && (
                <PromptPractice onBack={handleBackToCards} />
            )}

            {assessmentView === 'topic-practice' && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Topic Practice - Coming Soon</h2>
                    <button onClick={handleBackToCards}>← Back to Cards</button>
                </div>
            )}
        </>
    );
};

export default AssessmentMode;
