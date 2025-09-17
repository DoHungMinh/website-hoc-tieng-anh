import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Clock, 
  Target, 
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Lightbulb,
  Users,
  MessageSquare
} from 'lucide-react';

interface AIIELTSReadingConfig {
  title: string;
  difficulty: string;
  duration: number; // minutes
  numPassages: number; // số passage (1-3)
  questionsPerPassage: number; // số câu hỏi mỗi passage
  topics: string[];
  targetBand: string;
  description: string;
}

interface AIIELTSReadingCreatorProps {
  onExamGenerated: (exam: any) => void;
}

const AIIELTSReadingCreator: React.FC<AIIELTSReadingCreatorProps> = ({ onExamGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<AIIELTSReadingConfig>({
    title: '',
    difficulty: 'Band 6.0-7.0',
    duration: 60,
    numPassages: 3,
    questionsPerPassage: 13,
    topics: [''],
    targetBand: 'Band 6.0',
    description: ''
  });

  const difficultyOptions = [
    'Band 5.0-6.0',
    'Band 6.0-7.0', 
    'Band 7.0-8.0',
    'Band 8.0-9.0'
  ];

  const bandOptions = [
    'Band 5.0',
    'Band 6.0',
    'Band 7.0', 
    'Band 8.0',
    'Band 9.0'
  ];

  const topicSuggestions = [
    'Technology and Innovation',
    'Environment and Climate Change',
    'Education and Learning',
    'Health and Medicine',
    'Business and Economics',
    'Science and Research',
    'History and Culture',
    'Social Issues',
    'Art and Literature',
    'Travel and Tourism',
    'Psychology and Human Behavior',
    'Urban Development'
  ];

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setIsGenerating(false);
    setProgress(0);
    setConfig({
      title: '',
      difficulty: 'Band 6.0-7.0',
      duration: 60,
      numPassages: 3,
      questionsPerPassage: 13,
      topics: [''],
      targetBand: 'Band 6.0',
      description: ''
    });
  };

  const addTopic = () => {
    setConfig(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopic = (index: number) => {
    if (config.topics.length > 1) {
      setConfig(prev => ({
        ...prev,
        topics: prev.topics.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTopic = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => i === index ? value : topic)
    }));
  };

  const generateExam = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Validate input
      if (!config.title.trim()) {
        alert('Vui lòng nhập tiêu đề đề thi');
        setIsGenerating(false);
        return;
      }

      if (config.topics.filter(t => t.trim()).length === 0) {
        alert('Vui lòng thêm ít nhất một chủ đề');
        setIsGenerating(false);
        return;
      }

      // Simulate progress steps
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call AI service to generate reading exam (placeholder for now)
      setProgress(60);
      
      // For now, generate mock data
      const generatedExam = generateFallbackExam();
      
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      onExamGenerated(generatedExam);
      handleClose();

    } catch (error) {
      console.error('Error generating reading exam:', error);
      setIsGenerating(false);
      
      const fallbackExam = generateFallbackExam();
      onExamGenerated(fallbackExam);
      handleClose();
      
      alert('AI generation failed, using fallback data. Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const generateFallbackExam = () => {
    const totalQuestions = config.numPassages * config.questionsPerPassage;
    
    // Generate passages based on config
    const passages = [];
    for (let i = 1; i <= config.numPassages; i++) {
      const questions = [];
      for (let j = 1; j <= config.questionsPerPassage; j++) {
        const topicIndex = Math.floor(Math.random() * config.topics.filter(t => t.trim()).length);
        const topic = config.topics.filter(t => t.trim())[topicIndex] || 'General topic';
        
        // Generate different question types
        const questionTypes = ['multiple-choice', 'fill-blank', 'true-false-notgiven', 'matching'];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        questions.push({
          id: `passage${i}-q${j}`,
          type: randomType,
          question: `Question ${j} about ${topic.toLowerCase()} - ${randomType} type`,
          options: randomType === 'multiple-choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
          correctAnswer: randomType === 'multiple-choice' ? 'A' : `Answer ${j}`,
          explanation: `Explanation for question ${j} in passage ${i}`
        });
      }
      
      passages.push({
        id: `passage${i}`,
        title: `Passage ${i}: ${config.topics.filter(t => t.trim())[i-1] || 'Academic Reading'}`,
        content: `This is a sample reading passage about ${config.topics.filter(t => t.trim())[i-1] || 'academic topics'}. The passage contains approximately 800-900 words and covers various aspects of the topic. Students will need to read carefully and answer ${config.questionsPerPassage} questions based on the information provided in this passage.

The content would include detailed information, examples, statistics, and expert opinions related to the topic. This passage is designed to test reading comprehension skills at the ${config.difficulty} level.

In a real exam, this passage would be much longer and contain specific information that students need to identify to answer the questions correctly. The questions test various skills including detail recognition, main idea identification, inference, and understanding of writer's opinions.`,
        questions: questions
      });
    }

    return {
      title: config.title || `IELTS Reading Test - ${config.difficulty}`,
      type: 'reading',
      difficulty: config.difficulty,
      duration: config.duration,
      totalQuestions: totalQuestions,
      description: config.description || `Đề thi IELTS Reading với ${config.numPassages} passage và ${totalQuestions} câu hỏi`,
      passages: passages,
      targetBand: config.targetBand,
      topics: config.topics.filter(t => t.trim()),
      instructions: [
        'Đọc kỹ từng passage trước khi trả lời câu hỏi',
        'Quản lý thời gian hợp lý cho từng passage',
        'Tìm keywords trong câu hỏi để định vị thông tin',
        'Kiểm tra lại đáp án trước khi chuyển passage'
      ]
    };
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.title.trim().length > 0 && config.difficulty && config.duration > 0;
      case 2:
        return config.numPassages > 0 && config.questionsPerPassage > 0 && config.topics.filter(t => t.trim()).length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="text-left">
          <div className="font-semibold">Tạo đề thi Reading bằng AI</div>
          <div className="text-sm text-blue-100">Tự động tạo đề thi IELTS Reading</div>
        </div>
        <ChevronRight className="h-5 w-5 ml-2" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tạo đề thi IELTS Reading bằng AI</h2>
              <p className="text-gray-600">Tự động tạo đề thi Reading với passages và câu hỏi</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-blue-700 font-medium">
                Đang tạo đề thi... {progress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center py-6 border-b border-gray-200 flex-shrink-0">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                currentStep >= step
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                {step}
              </div>
              {index < 2 && (
                <div className={`w-16 h-1 mx-2 transition-all ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cơ bản</h3>
                <p className="text-gray-600">Thiết lập thông tin cơ bản cho đề thi Reading</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề đề thi *
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: IELTS Reading Test - Technology & Environment"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ khó
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian làm bài (phút)
                  </label>
                  <input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="45"
                    max="90"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">Thông thường: 60 phút</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Band Score
                  </label>
                  <select
                    value={config.targetBand}
                    onChange={(e) => setConfig(prev => ({ ...prev, targetBand: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    {bandOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả đề thi
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của đề thi Reading..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MessageSquare className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình nội dung</h3>
                <p className="text-gray-600">Thiết lập số passage, câu hỏi và chủ đề</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số passage
                  </label>
                  <input
                    type="number"
                    value={config.numPassages}
                    onChange={(e) => setConfig(prev => ({ ...prev, numPassages: parseInt(e.target.value) || 1 }))}
                    min="1"
                    max="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">Thông thường: 3 passage</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số câu hỏi mỗi passage
                  </label>
                  <input
                    type="number"
                    value={config.questionsPerPassage}
                    onChange={(e) => setConfig(prev => ({ ...prev, questionsPerPassage: parseInt(e.target.value) || 1 }))}
                    min="5"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">Thông thường: 13-14 câu</p>
                </div>
              </div>

              {/* Topics Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Chủ đề passage *
                  </label>
                  <button
                    onClick={addTopic}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm chủ đề
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {config.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        placeholder="Nhập chủ đề passage..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                      {config.topics.length > 1 && (
                        <button
                          onClick={() => removeTopic(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Topic Suggestions */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Gợi ý chủ đề Reading:</p>
                  <div className="flex flex-wrap gap-2">
                    {topicSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          const emptyIndex = config.topics.findIndex(t => !t.trim());
                          if (emptyIndex !== -1) {
                            updateTopic(emptyIndex, suggestion);
                          } else {
                            setConfig(prev => ({ ...prev, topics: [...prev.topics, suggestion] }));
                          }
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Xem trước cấu hình:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-600">Tổng câu hỏi</p>
                    <p className="font-bold text-blue-800">{config.numPassages * config.questionsPerPassage}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600">Thời gian</p>
                    <p className="font-bold text-green-800">{config.duration} phút</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-600">Số passage</p>
                    <p className="font-bold text-blue-800">{config.numPassages}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600">Chủ đề</p>
                    <p className="font-bold text-green-800">{config.topics.filter(t => t.trim()).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Lightbulb className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Xem trước & Tạo đề thi</h3>
                <p className="text-gray-600">Kiểm tra lại thông tin trước khi tạo</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin đề thi Reading:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tiêu đề:</p>
                    <p className="font-medium">{config.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mức độ khó:</p>
                    <p className="font-medium">{config.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian:</p>
                    <p className="font-medium">{config.duration} phút</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Band:</p>
                    <p className="font-medium">{config.targetBand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số passage:</p>
                    <p className="font-medium">{config.numPassages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Câu hỏi/passage:</p>
                    <p className="font-medium">{config.questionsPerPassage}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Chủ đề passage:</p>
                  <div className="flex flex-wrap gap-2">
                    {config.topics.filter(t => t.trim()).map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {config.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Mô tả:</p>
                    <p className="text-gray-700">{config.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">AI sẽ tạo:</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {config.numPassages} passage Reading với nội dung học thuật chất lượng cao
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Tổng cộng {config.numPassages * config.questionsPerPassage} câu hỏi đa dạng (multiple choice, fill blank, T/F/NG, matching)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Thiết lập thời gian phù hợp với chuẩn IELTS
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Đáp án chi tiết và giải thích cho từng câu hỏi
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer - always visible */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all font-medium"
              >
                <ChevronLeft className="h-5 w-5" />
                Quay lại
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all font-medium"
            >
              Hủy
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed() || isGenerating}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Tiếp tục
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={generateExam}
                disabled={isGenerating}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Tạo đề thi
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIELTSReadingCreator;
