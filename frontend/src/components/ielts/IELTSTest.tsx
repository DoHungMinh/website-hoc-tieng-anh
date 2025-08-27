import { useState, useEffect } from 'react';
import { 
  Headphones,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Timer,
  ArrowLeft,
  FileText,
  BookOpen
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-notgiven' | 'matching' | 'map-labeling';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  audioTimestamp?: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  questions: Question[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration: number;
  questions: Question[];
}

interface ExamData {
  _id: string;
  title: string;
  type: 'reading' | 'listening';
  difficulty: string;
  duration: number;
  totalQuestions: number;
  description: string;
  passages?: Passage[];
  sections?: Section[];
}

interface IELTSTestProps {
  onBackToCenter?: () => void;
}

const IELTSTest: React.FC<IELTSTestProps> = ({ onBackToCenter }) => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const currentExam = sessionStorage.getItem('currentExam');
        if (!currentExam) {
          console.error('No exam selected');
          alert('Vui lòng chọn đề thi từ danh sách');
          onBackToCenter?.();
          return;
        }

        const { examId } = JSON.parse(currentExam);
        if (!examId) {
          console.error('Invalid exam data');
          alert('Dữ liệu đề thi không hợp lệ');
          onBackToCenter?.();
          return;
        }

        const response = await fetch(`/api/ielts/${examId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setExamData(data.data);
            setTimeRemaining(data.data.duration * 60); // Convert minutes to seconds
          } else {
            console.error('Invalid exam data structure:', data);
            alert('Dữ liệu đề thi không hợp lệ');
            onBackToCenter?.();
          }
        } else {
          console.error('Failed to fetch exam data:', response.status);
          alert('Không thể tải đề thi. Vui lòng thử lại');
          onBackToCenter?.();
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        alert('Lỗi khi tải đề thi');
        onBackToCenter?.();
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [onBackToCenter]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining, showResults]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleBackToCenter = () => {
    sessionStorage.removeItem('currentExam');
    if (onBackToCenter) {
      onBackToCenter();
    } else {
      window.location.reload(); // Fallback
    }
  };

  const getCurrentQuestions = (): Question[] => {
    if (!examData) return [];
    
    if (examData.type === 'reading' && examData.passages) {
      return examData.passages[currentSection]?.questions || [];
    } else if (examData.type === 'listening' && examData.sections) {
      return examData.sections[currentSection]?.questions || [];
    }
    
    return [];
  };

  const getTotalSections = (): number => {
    if (!examData) return 0;
    
    if (examData.type === 'reading' && examData.passages) {
      return examData.passages.length;
    } else if (examData.type === 'listening' && examData.sections) {
      return examData.sections.length;
    }
    
    return 0;
  };

  const getCurrentSectionTitle = (): string => {
    if (!examData) return '';
    
    if (examData.type === 'reading' && examData.passages) {
      return examData.passages[currentSection]?.title || '';
    } else if (examData.type === 'listening' && examData.sections) {
      return examData.sections[currentSection]?.title || '';
    }
    
    return '';
  };

  const getCurrentPassageContent = (): string => {
    if (!examData || examData.type !== 'reading' || !examData.passages) return '';
    return examData.passages[currentSection]?.content || '';
  };

  const getCurrentAudioUrl = (): string => {
    if (!examData || examData.type !== 'listening' || !examData.sections) return '';
    return examData.sections[currentSection]?.audioUrl || '';
  };

  const handleSubmitTest = () => {
    if (confirm('Bạn có chắc chắn muốn nộp bài không?')) {
      setShowResults(true);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const nextQuestion = () => {
    const questions = getCurrentQuestions();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < getTotalSections() - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionQuestions = examData?.type === 'reading' 
        ? examData.passages?.[currentSection - 1]?.questions.length || 0
        : examData?.sections?.[currentSection - 1]?.questions.length || 0;
      setCurrentQuestion(prevSectionQuestions - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đề thi</h2>
          <p className="text-gray-600 mb-4">Vui lòng chọn đề thi từ danh sách.</p>
          <button
            onClick={handleBackToCenter}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại IELTS Center
          </button>
        </div>
      </div>
    );
  }

  // Show results screen
  if (showResults) {
    const totalQuestions = examData.totalQuestions;
    const answeredQuestions = Object.keys(answers).length;
    const score = Math.round((answeredQuestions / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Hoàn thành bài thi</h1>
            <p className="text-xl text-gray-600 mb-8">{examData.title}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-blue-600">{answeredQuestions}/{totalQuestions}</div>
                <div className="text-blue-600">Câu đã trả lời</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-green-600">{score}%</div>
                <div className="text-green-600">Tỷ lệ hoàn thành</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(examData.duration * 60 - timeRemaining)}
                </div>
                <div className="text-purple-600">Thời gian đã dùng</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBackToCenter}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Quay lại IELTS Center
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Làm lại bài thi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToCenter}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Quay lại
              </button>
            </div>

            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${
                examData.type === 'reading' ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600'
              } flex items-center justify-center mx-auto mb-4`}>
                {examData.type === 'reading' ? 
                  <FileText className="h-10 w-10 text-white" /> : 
                  <Headphones className="h-10 w-10 text-white" />
                }
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{examData.title}</h1>
              <p className="text-gray-600">{examData.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{examData.duration} phút</div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{getTotalSections()}</div>
                <div className="text-sm text-gray-600">{examData.type === 'reading' ? 'Passages' : 'Sections'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{examData.totalQuestions}</div>
                <div className="text-sm text-gray-600">Câu hỏi</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{examData.difficulty}</div>
                <div className="text-sm text-gray-600">Cấp độ</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-yellow-800 mb-3">Hướng dẫn làm bài:</h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-700">
                <li>Đọc kỹ đề bài và câu hỏi trước khi trả lời</li>
                <li>Quản lý thời gian hợp lý cho từng phần</li>
                <li>Có thể chuyển đổi giữa các câu hỏi trong cùng phần</li>
                <li>Kiểm tra lại đáp án trước khi nộp bài</li>
                {examData.type === 'listening' && (
                  <li>Audio sẽ chỉ phát một lần, hãy tập trung nghe</li>
                )}
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartTest}
                className={`bg-gradient-to-r ${
                  examData.type === 'reading' ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-purple-700'
                } hover:shadow-lg text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105`}
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main test interface
  const questions = getCurrentQuestions();
  const currentQuestionData = questions[currentQuestion];

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không có câu hỏi</h2>
          <button
            onClick={handleBackToCenter}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại IELTS Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBackToCenter}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Thoát
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{examData.title}</h1>
                <p className="text-sm text-gray-600">{getCurrentSectionTitle()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Timer className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <button
                onClick={handleSubmitTest}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Passage/Audio */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {examData.type === 'reading' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{getCurrentSectionTitle()}</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {getCurrentPassageContent()}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{getCurrentSectionTitle()}</h2>
                {getCurrentAudioUrl() && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <audio
                      controls
                      src={getCurrentAudioUrl()}
                      className="w-full mb-4"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Audio for {getCurrentSectionTitle()}</span>
                      <span>{isPlaying ? 'Playing...' : 'Paused'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Questions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Câu {currentQuestion + 1} / {questions.length}
              </h3>
              <div className="text-sm text-gray-600">
                Phần {currentSection + 1} / {getTotalSections()}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-800 mb-4">{currentQuestionData.question}</p>

              {/* Multiple Choice */}
              {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options && (
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={currentQuestionData.id}
                        value={index}
                        checked={answers[currentQuestionData.id] === index}
                        onChange={() => handleAnswer(currentQuestionData.id, index)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Fill in the blank */}
              {currentQuestionData.type === 'fill-blank' && (
                <input
                  type="text"
                  value={answers[currentQuestionData.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              )}

              {/* True/False/Not Given */}
              {currentQuestionData.type === 'true-false-notgiven' && (
                <div className="space-y-3">
                  {['True', 'False', 'Not Given'].map((option, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={currentQuestionData.id}
                        value={option}
                        checked={answers[currentQuestionData.id] === option}
                        onChange={() => handleAnswer(currentQuestionData.id, option)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={prevQuestion}
                disabled={currentSection === 0 && currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Câu trước
              </button>

              <div className="text-sm text-gray-600">
                Đã trả lời: {Object.keys(answers).length}/{examData.totalQuestions}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentSection === getTotalSections() - 1 && currentQuestion === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Câu sau
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSTest;
