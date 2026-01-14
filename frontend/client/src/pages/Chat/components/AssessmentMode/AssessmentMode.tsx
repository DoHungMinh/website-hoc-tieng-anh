import React, { useState, useEffect } from 'react';
import AssessmentCards from './components/AssessmentCards';
import PromptPractice from './components/PromptPractice';
import TopicPractice from './components/TopicPractice';
import FreeSpeakingPractice from './components/FreeSpeakingPractice';
import FreeSpeakingRecording from './components/FreeSpeakingRecording';
import FreeSpeakingResult from './components/FreeSpeakingResult';

// Assessment View Type
type AssessmentView = 'cards' | 'prompt-practice' | 'topic-practice' | 'free-speaking' | 'recording' | 'result';

interface AssessmentModeProps {
    onToggleVisibility: (show: boolean) => void;
}

/**
 * Assessment Mode Container Component
 * Manages view state and navigation between assessment screens
 */
const AssessmentMode: React.FC<AssessmentModeProps> = ({ onToggleVisibility }) => {
    const [assessmentView, setAssessmentView] = useState<AssessmentView>('cards');
    const [selectedTopic, setSelectedTopic] = useState<{ id: string; title: string; description: string } | null>(null);

    // Show/hide mode toggle based on current view
    useEffect(() => {
        if (assessmentView === 'cards') {
            onToggleVisibility(true); // Show mode toggle on cards screen
        } else {
            onToggleVisibility(false); // Hide mode toggle when inside practice
        }
    }, [assessmentView, onToggleVisibility]);

    const handlePromptPracticeClick = () => {
        setAssessmentView('prompt-practice');
    };

    const handleTopicPracticeClick = () => {
        setAssessmentView('topic-practice');
    };

    const handleSelectTopic = (topicId: string, topicTitle: string, topicDescription: string) => {
        setSelectedTopic({ id: topicId, title: topicTitle, description: topicDescription });
        setAssessmentView('free-speaking');
    };

    const handleStartRecording = () => {
        setAssessmentView('recording');
    };

    const handleViewResult = () => {
        setAssessmentView('result');
    };

    const handleBackToCards = () => {
        setAssessmentView('cards');
        setSelectedTopic(null);
    };

    const handleBackToTopics = () => {
        setAssessmentView('topic-practice');
        setSelectedTopic(null);
    };

    const handleBackToFreeSpeaking = () => {
        setAssessmentView('free-speaking');
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
                <TopicPractice 
                    onBack={handleBackToCards}
                    onSelectTopic={handleSelectTopic}
                />
            )}

            {assessmentView === 'free-speaking' && selectedTopic && (
                <FreeSpeakingPractice
                    topicId={selectedTopic.id}
                    topicTitle={selectedTopic.title}
                    topicDescription={selectedTopic.description}
                    onBack={handleBackToTopics}
                    onStartRecording={handleStartRecording}
                />
            )}

            {assessmentView === 'recording' && selectedTopic && (
                <FreeSpeakingRecording
                    topicId={selectedTopic.id}
                    topicTitle={selectedTopic.title}
                    onBack={handleBackToFreeSpeaking}
                    onViewResult={handleViewResult}
                />
            )}

            {assessmentView === 'result' && selectedTopic && (
                <FreeSpeakingResult
                    topicId={selectedTopic.id}
                    topicTitle={selectedTopic.title}
                    questions={
                        selectedTopic.id === 'food' ? [
                            "What is your favorite dish to eat and why?",
                            "What dish or food can you make and how do you make it?"
                        ] : selectedTopic.id === 'family' ? [
                            "How big is your family and who all are in it?",
                            "What is your favorite memory with your family?"
                        ] : [
                            "What is your favorite animal and why?",
                            "Do you think it is ok to keep animals in a zoo?"
                        ]
                    }
                    onBack={handleBackToFreeSpeaking}
                />
            )}
        </>
    );
};

export default AssessmentMode;
