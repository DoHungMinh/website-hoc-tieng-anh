import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/utils/constants';

interface IELTSQuestion {
  _id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
}

interface IELTSPassage {
  _id: string;
  title: string;
  content: string;
  audioUrl?: string;
  questions: IELTSQuestion[];
}

interface IELTSTest {
  _id: string;
  testCode: string;
  title: string;
  description: string;
  testType: string;
  timeLimit: number;
  passages: IELTSPassage[];
}

const TestInterface: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<IELTSTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const fetchTestData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ielts/test/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }

      const data = await response.json();
      setTest(data.data); // Assuming response structure { success: true, data: ... }
      setTimeRemaining(data.data.timeLimit * 60); // Convert minutes to seconds
      setError('');
    } catch (err: unknown) {
      setError('Failed to load test data');
      console.error('Error fetching test:', err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const handleSubmitTest = useCallback(async () => {
    try {
      // Stop any playing audio
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      const submissionData = {
        testId,
        answers,
        timeUsed: (test!.timeLimit * 60) - timeRemaining
      };

      // Here you would submit to your assessment endpoint
      console.log('Submitting test:', submissionData);
      alert('Test submitted successfully!');
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
    }
  }, [testId, answers, currentAudio, test, timeRemaining]);

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId, fetchTestData]);

  useEffect(() => {
    if (isTestStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTestStarted, timeRemaining, handleSubmitTest]);

  const startTest = () => {
    setIsTestStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play().then(() => {
      setCurrentAudio(audio);
    }).catch(error => {
      console.error('Error playing audio:', error);
      alert('Failed to load audio. Please check your internet connection.');
    });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Test</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTestData}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Test not found</h2>
        </div>
      </div>
    );
  }

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{test.title}</h1>
          <p className="text-gray-600 mb-6">{test.description}</p>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Test Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Test Type:</span>
                <span className="ml-2 text-gray-600">{test.testType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Time Limit:</span>
                <span className="ml-2 text-gray-600">{test.timeLimit} minutes</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Number of Passages:</span>
                <span className="ml-2 text-gray-600">{test.passages.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Questions:</span>
                <span className="ml-2 text-gray-600">
                  {test.passages.reduce((total, passage) => total + passage.questions.length, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              <li>• Once started, you cannot pause the test</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• For listening sections, you can play audio only once</li>
              <li>• Your answers will be automatically submitted when time expires</li>
            </ul>
          </div>

          <button
            onClick={startTest}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const currentPassage = test.passages[currentPassageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
            <span className="text-sm text-gray-500">
              Passage {currentPassageIndex + 1} of {test.passages.length}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              ⏰ {formatTime(timeRemaining)}
            </div>
            <button
              onClick={handleSubmitTest}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Passage content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{currentPassage.title}</h2>

              {/* Audio controls for listening passages */}
              {currentPassage.audioUrl && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playAudio(currentPassage.audioUrl!)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-1"
                  >
                    <span>🔊</span>
                    <span>Play Audio</span>
                  </button>
                  <button
                    onClick={stopAudio}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-1"
                  >
                    <span>⏹️</span>
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>

            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {currentPassage.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Right side - Questions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Questions</h3>

            <div className="space-y-6">
              {currentPassage.questions.map((question) => (
                <div key={question._id} className="border-b border-gray-200 pb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {question.questionNumber}. {question.questionText}
                  </h4>

                  {question.questionType === 'multiple-choice' && question.options ? (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={option}
                            checked={answers[question._id] === option}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentPassageIndex(prev => Math.max(0, prev - 1))}
            disabled={currentPassageIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold ${currentPassageIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
          >
            ← Previous Passage
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Questions answered: {Object.keys(answers).length} / {test.passages.reduce((total, passage) => total + passage.questions.length, 0)}
            </span>
          </div>

          <button
            onClick={() => setCurrentPassageIndex(prev => Math.min(test.passages.length - 1, prev + 1))}
            disabled={currentPassageIndex === test.passages.length - 1}
            className={`px-6 py-3 rounded-lg font-semibold ${currentPassageIndex === test.passages.length - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Next Passage →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;