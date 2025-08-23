import { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronLeft, 
  ChevronRight, 
  Flag,
  CheckCircle,
  ArrowLeft,
  Clock
} from 'lucide-react';

interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank' | 'map-labeling' | 'matching';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  section: number;
  audioTimestamp?: number; // Seconds into the audio when this question is relevant
}

interface Section {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  questions: number[];
}

const IELTSListeningTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(2400); // 40 minutes
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);

  const sections: Section[] = [
    {
      id: 1,
      title: 'Section 1: Conversation in Social Context',
      description: 'A conversation between two people set in an everyday social context (e.g. booking accommodation)',
      audioUrl: '/audio/listening-section1.mp3',
      duration: 300, // 5 minutes
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
      id: 2,
      title: 'Section 2: Monologue in Social Context',
      description: 'A monologue set in an everyday social context (e.g. a speech about local facilities)',
      audioUrl: '/audio/listening-section2.mp3',
      duration: 350,
      questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      id: 3,
      title: 'Section 3: Educational/Training Context',
      description: 'A conversation between up to four people set in an educational context (e.g. university students discussing an assignment)',
      audioUrl: '/audio/listening-section3.mp3',
      duration: 380,
      questions: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    },
    {
      id: 4,
      title: 'Section 4: Academic Lecture',
      description: 'A monologue on an academic subject (e.g. a university lecture)',
      audioUrl: '/audio/listening-section4.mp3',
      duration: 420,
      questions: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
    }
  ];

  const questions: Question[] = [
    // Section 1 Questions
    {
      id: 1,
      section: 1,
      type: 'fill-blank',
      question: 'The caller wants to book accommodation for _______ people.',
      audioTimestamp: 15
    },
    {
      id: 2,
      section: 1,
      type: 'multiple-choice',
      question: 'What type of accommodation is the caller looking for?',
      options: ['Hotel room', 'Shared apartment', 'Guest house', 'Private apartment'],
      audioTimestamp: 45
    },
    {
      id: 3,
      section: 1,
      type: 'fill-blank',
      question: 'The accommodation should be available from _______.',
      audioTimestamp: 78
    },
    {
      id: 4,
      section: 1,
      type: 'multiple-choice',
      question: 'What is the maximum rent the caller can afford per week?',
      options: ['£120', '£150', '£180', '£200'],
      audioTimestamp: 120
    },
    {
      id: 5,
      section: 1,
      type: 'fill-blank',
      question: 'The caller\'s phone number is _______.',
      audioTimestamp: 165
    },

    // Section 2 Questions
    {
      id: 11,
      section: 2,
      type: 'multiple-choice',
      question: 'The sports center opens at:',
      options: ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM'],
      audioTimestamp: 25
    },
    {
      id: 12,
      section: 2,
      type: 'fill-blank',
      question: 'The swimming pool is _______ meters long.',
      audioTimestamp: 55
    },
    {
      id: 13,
      section: 2,
      type: 'map-labeling',
      question: 'Label the map: Where is the reception desk located?',
      options: ['A', 'B', 'C', 'D'],
      audioTimestamp: 90
    },

    // Section 3 Questions
    {
      id: 21,
      section: 3,
      type: 'multiple-choice',
      question: 'What is the main topic of the students\' presentation?',
      options: ['Climate change', 'Renewable energy', 'Ocean pollution', 'Deforestation'],
      audioTimestamp: 30
    },
    {
      id: 22,
      section: 3,
      type: 'matching',
      question: 'Match the student with their responsibility:',
      options: ['Research data collection', 'Presentation slides', 'Bibliography', 'Introduction'],
      audioTimestamp: 75
    },

    // Section 4 Questions
    {
      id: 31,
      section: 4,
      type: 'fill-blank',
      question: 'The lecture focuses on _______ century architecture.',
      audioTimestamp: 20
    },
    {
      id: 32,
      section: 4,
      type: 'multiple-choice',
      question: 'According to the lecturer, Gothic architecture first appeared in:',
      options: ['Italy', 'France', 'England', 'Germany'],
      audioTimestamp: 60
    }
  ];

  const transcripts = {
    1: `Receptionist: Good morning, City Accommodation Services. How may I help you?
    
Caller: Hi, I'm looking for accommodation for three people. We're university students starting our course next month.

Receptionist: Certainly. What type of accommodation are you interested in?

Caller: We'd prefer a shared apartment if possible. We want to live together but don't need anything too expensive.

Receptionist: I see. And when would you need this accommodation to be available from?

Caller: From September 15th. That's when our semester starts.

Receptionist: Alright, September 15th. What's your budget range?

Caller: We can't afford more than £150 per week each. Is that reasonable?

Receptionist: That should be fine. Let me take your contact details. What's your phone number?

Caller: It's 07892 456 123.`,
    
    2: `Welcome to the Riverside Sports Center. I'd like to tell you about our facilities and opening hours.

We open every day at 6:30 in the morning and close at 10 PM on weekdays, 9 PM on weekends.

Our main attraction is the swimming pool, which is 25 meters long and has six lanes. It's perfect for both recreational swimming and training.

If you look at the map on your screen, you'll see the reception desk is located at point B, right at the main entrance. The swimming pool is marked as area C, and the gymnasium is at point A.`,

    3: `Student A: So, for our group presentation on environmental issues, what should our main focus be?

Student B: I think we should concentrate on ocean pollution. It's a really current topic.

Student C: Good idea. Now, let's divide up the work. Sarah, could you handle the research and data collection?

Student A: Sure, I'm good with statistics. What about the presentation slides?

Student B: I can do those. I'm quite good with PowerPoint and design.

Student C: That leaves me with the bibliography and the introduction. I don't mind doing the writing parts.`,

    4: `Today's lecture will examine 12th century architecture, particularly the emergence of the Gothic style.

Gothic architecture first appeared in France in the mid-12th century. The style was revolutionary because it allowed for much taller buildings and larger windows than previous architectural styles.

The key innovations included the pointed arch, which distributed weight more effectively than the rounded arches used in earlier Romanesque buildings.`
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      const nextQ = questions[currentQuestion + 1];
      if (nextQ.section !== currentSection + 1) {
        setCurrentSection(nextQ.section - 1);
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQ = questions[currentQuestion - 1];
      if (prevQ.section !== currentSection + 1) {
        setCurrentSection(prevQ.section - 1);
      }
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const currentSectionData = sections[currentSection];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IELTS Listening Test</h1>
                <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-lg font-bold text-green-600">{answeredCount}/{questions.length}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-lg font-bold text-red-600">{formatTime(timeRemaining)}</p>
              </div>
              
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Player Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {currentSectionData.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentSectionData.description}
              </p>
            </div>
            
            <div className="p-6">
              {/* Audio Controls */}
              <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Audio Player</h3>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-600" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 w-8">{volume}%</span>
                  </div>
                </div>

                {/* Play Controls */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  
                  <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{formatTime(audioCurrentTime)}</span>
                      <span>{formatTime(currentSectionData.duration)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(audioCurrentTime / currentSectionData.duration) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Audio Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-600">{isPlaying ? 'Playing' : 'Paused'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">Section {currentSection + 1} of 4</span>
                  </div>
                </div>
              </div>

              {/* Transcript Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </button>
              </div>

              {/* Transcript */}
              {showTranscript && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-2">Section {currentSection + 1} Transcript</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {transcripts[currentSection + 1 as keyof typeof transcripts]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Question {currentQuestion + 1}
                </h3>
                <button
                  onClick={() => toggleFlag(currentQuestionData.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    flaggedQuestions.has(currentQuestionData.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-900 font-medium mb-4">
                  {currentQuestionData.question}
                </p>

                {/* Multiple Choice */}
                {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options && (
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={index}
                          checked={answers[currentQuestionData.id] === index}
                          onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                          className="mt-1 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in the Blank */}
                {currentQuestionData.type === 'fill-blank' && (
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestionData.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                )}

                {/* Map Labeling */}
                {currentQuestionData.type === 'map-labeling' && currentQuestionData.options && (
                  <div>
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
                      <p className="text-gray-600">Map/Diagram would be displayed here</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestionData.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionData.id}`}
                            value={index}
                            checked={answers[currentQuestionData.id] === index}
                            onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching */}
                {currentQuestionData.type === 'matching' && currentQuestionData.options && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">Select the correct match:</p>
                    {currentQuestionData.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={index}
                          checked={answers[currentQuestionData.id] === index}
                          onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {answers[currentQuestionData.id] !== undefined && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {flaggedQuestions.has(currentQuestionData.id) && (
                    <Flag className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Overview */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Question Overview</h3>
          
          <div className="grid grid-cols-10 md:grid-cols-20 gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isFlagged = flaggedQuestions.has(question.id);
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm relative transition-all ${
                    isCurrent
                      ? 'bg-green-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-gray-600">Not answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-gray-600">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSListeningTest;
