import { useState, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Timer
} from 'lucide-react';

interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  audioUrl?: string;
}

interface TestSection {
  id: number;
  title: string;
  type: 'listening';
  duration: number;
  questions: Question[];
  instructions: string;
}

const IELTSTest = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(2400); // 40 minutes in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [testStarted, setTestStarted] = useState(false);

  const testSections: TestSection[] = [
    {
      id: 1,
      title: 'Section 1: Social Conversation',
      type: 'listening',
      duration: 600, // 10 minutes
      instructions: 'Bạn sẽ nghe một cuộc hội thoại giữa hai người về tình huống xã hội hàng ngày.',
      questions: [
        {
          id: 1,
          type: 'multiple-choice',
          question: 'What is the main topic of the conversation?',
          options: ['Booking a hotel room', 'Ordering food', 'Making travel plans', 'Shopping for clothes'],
          audioUrl: '/audio/section1-q1.mp3'
        },
        {
          id: 2,
          type: 'fill-blank',
          question: 'The meeting is scheduled for _______ at 3 PM.',
          audioUrl: '/audio/section1-q2.mp3'
        },
        {
          id: 3,
          type: 'multiple-choice',
          question: 'How much does the service cost?',
          options: ['$25', '$35', '$45', '$55'],
          audioUrl: '/audio/section1-q3.mp3'
        }
      ]
    },
    {
      id: 2,
      title: 'Section 2: Monologue',
      type: 'listening',
      duration: 600,
      instructions: 'Bạn sẽ nghe một bài thuyết trình về một chủ đề cụ thể.',
      questions: [
        {
          id: 4,
          type: 'multiple-choice',
          question: 'What is the speaker\'s main purpose?',
          options: ['To inform', 'To persuade', 'To entertain', 'To instruct'],
          audioUrl: '/audio/section2-q1.mp3'
        },
        {
          id: 5,
          type: 'fill-blank',
          question: 'The program runs for _______ weeks.',
          audioUrl: '/audio/section2-q2.mp3'
        }
      ]
    },
    {
      id: 3,
      title: 'Section 3: Academic Discussion',
      type: 'listening',
      duration: 600,
      instructions: 'Bạn sẽ nghe một cuộc thảo luận giữa nhiều người trong bối cảnh học thuật.',
      questions: [
        {
          id: 6,
          type: 'multiple-choice',
          question: 'What is the main topic of the discussion?',
          options: ['Research methods', 'Study groups', 'Assignment deadlines', 'Course selection'],
          audioUrl: '/audio/section3-q1.mp3'
        },
        {
          id: 7,
          type: 'fill-blank',
          question: 'The assignment is due on _______.',
          audioUrl: '/audio/section3-q2.mp3'
        }
      ]
    },
    {
      id: 4,
      title: 'Section 4: Academic Lecture',
      type: 'listening',
      duration: 600,
      instructions: 'Bạn sẽ nghe một bài giảng học thuật về một chủ đề chuyên môn.',
      questions: [
        {
          id: 8,
          type: 'multiple-choice',
          question: 'According to the lecture, what is the main factor?',
          options: ['Environmental conditions', 'Economic factors', 'Social influences', 'Technological advances'],
          audioUrl: '/audio/section4-q1.mp3'
        },
        {
          id: 9,
          type: 'fill-blank',
          question: 'The study was conducted over _______ years.',
          audioUrl: '/audio/section4-q2.mp3'
        }
      ]
    }
  ];

  useEffect(() => {
    if (!testStarted) return;
    
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
  }, [testStarted]);

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

  const nextQuestion = () => {
    const section = testSections[currentSection];
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < testSections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSection = testSections[currentSection - 1];
      setCurrentQuestion(prevSection.questions.length - 1);
    }
  };

  const startTest = () => {
    setTestStarted(true);
  };

  if (!testStarted) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                IELTS Listening Test
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Bài kiểm tra chính thức IELTS - Phần Nghe
              </p>
            </div>

            {/* Test Info */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Headphones className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Listening Test</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• 4 phần hoàn chỉnh</li>
                  <li>• 40 câu hỏi</li>
                  <li>• Thời gian: 40 phút</li>
                  <li>• Điểm tối đa: 40 điểm</li>
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-2">Lưu ý quan trọng:</h4>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• Đảm bảo kết nối internet ổn định</li>
                    <li>• Sử dụng tai nghe để có trải nghiệm tốt nhất</li>
                    <li>• Kiểm tra micro trước khi bắt đầu</li>
                    <li>• Không thoát khỏi trang trong quá trình làm bài</li>
                    <li>• Bài test sẽ tự động nộp khi hết thời gian</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Equipment Check */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Kiểm tra âm thanh</h4>
                <div className="flex items-center gap-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
                    <Play className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">Test audio sample</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startTest}
                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Bắt đầu bài test
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSectionData = testSections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = testSections.reduce((sum, section) => sum + section.questions.length, 0);
  const currentQuestionNumber = testSections
    .slice(0, currentSection)
    .reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion + 1;

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentSectionData.title}</h1>
              <p className="text-gray-600">Câu hỏi {currentQuestionNumber} / {totalQuestions}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-xl">
                <Timer className="h-5 w-5 text-red-600" />
                <span className="font-mono text-lg font-bold text-red-700">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Volume Control (for listening sections) */}
              {currentSectionData.type === 'listening' && (
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-gray-600" />
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
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Section Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800">{currentSectionData.instructions}</p>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {currentQuestionData.question}
                </h3>

                {/* Listening Question */}
                {currentSectionData.type === 'listening' && (
                  <div className="space-y-4">
                    {/* Audio Player */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </button>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <button className="text-gray-600 hover:text-gray-800">
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Answer Options */}
                    {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options && (
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestionData.id}`}
                              value={index}
                              onChange={(e) => handleAnswer(currentQuestionData.id, parseInt(e.target.value))}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="text-gray-800">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestionData.type === 'fill-blank' && (
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời của bạn..."
                        onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevQuestion}
                disabled={currentSection === 0 && currentQuestion === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
                Câu trước
              </button>

              <div className="flex items-center gap-2">
                {testSections.map((section, sectionIndex) => (
                  <div key={section.id} className="flex items-center gap-1">
                    {section.questions.map((_, questionIndex) => {
                      const questionNum = testSections
                        .slice(0, sectionIndex)
                        .reduce((sum, s) => sum + s.questions.length, 0) + questionIndex + 1;
                      const isCurrent = sectionIndex === currentSection && questionIndex === currentQuestion;
                      const isAnswered = answers[section.questions[questionIndex].id] !== undefined;
                      
                      return (
                        <div
                          key={questionIndex}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            isCurrent
                              ? 'bg-green-600 text-white'
                              : isAnswered
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {questionNum}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentSection === testSections.length - 1 && currentQuestion === currentSectionData.questions.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              >
                Câu tiếp
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tiến độ</h3>
              
              <div className="space-y-4">
                {testSections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{section.title}</span>
                      <span className="text-sm text-gray-500">
                        {section.questions.filter(q => answers[q.id] !== undefined).length}/{section.questions.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-lime-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(section.questions.filter(q => answers[q.id] !== undefined).length / section.questions.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Tổng tiến độ</span>
                  <span className="text-green-600 font-bold">
                    {Math.round((Object.keys(answers).length / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-lime-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Test Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Thông tin bài test</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Thời gian</p>
                    <p className="text-sm text-gray-600">40 phút</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Câu hỏi</p>
                    <p className="text-sm text-gray-600">{totalQuestions} câu</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Độ khó</p>
                    <p className="text-sm text-gray-600">Band 6.0-7.5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Test */}
            <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Nộp bài test
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IELTSTest;
