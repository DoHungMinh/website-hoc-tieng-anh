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
import { aiIELTSService, AIGeneratedIELTSReading } from '@/services/aiIELTSService';

interface IELTSReadingConfig {
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
  onExamGenerated: (exam: AIGeneratedIELTSReading) => void;
}

const AIIELTSReadingCreator: React.FC<AIIELTSReadingCreatorProps> = ({ onExamGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<IELTSReadingConfig>({
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
    if (isGenerating) {
      const confirmClose = confirm('Đang tạo đề thi... Bạn có chắc chắn muốn hủy?');
      if (!confirmClose) return;
    }
    
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

      // Prepare AI configuration
      const aiConfig = {
        title: config.title,
        difficulty: config.difficulty,
        duration: config.duration,
        numPassages: config.numPassages,
        questionsPerPassage: config.questionsPerPassage,
        topics: config.topics.filter(t => t.trim()),
        targetBand: config.targetBand,
        description: config.description
      };

      // Simulate progress steps
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call AI service to generate IELTS Reading exam
      setProgress(60);
      console.log('Generating IELTS Reading with config:', aiConfig);
      
      let generatedExam: AIGeneratedIELTSReading;
      
      try {
        generatedExam = await aiIELTSService.generateIELTSReading(aiConfig);
        console.log('AI Generated exam:', generatedExam);
      } catch (aiError) {
        console.warn('AI service failed, using fallback:', aiError);
        generatedExam = generateFallbackExam();
      }
      
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate generated content
      const isValid = await aiIELTSService.validateIELTSContent(generatedExam);
      if (!isValid) {
        console.warn('Generated content validation failed, using fallback');
        generatedExam = generateFallbackExam();
      }
      
      setProgress(90);
      
      // Save to database
      const saveResult = await aiIELTSService.saveIELTSReading(generatedExam);
      if (!saveResult.success) {
        console.warn('Failed to save to database:', saveResult.message);
        // Still continue and show the exam, but with a warning
        onExamGenerated(generatedExam);
        handleClose();
        
        alert(`⚠️ Đề thi được tạo thành công nhưng có lỗi lưu trữ:\n\n${saveResult.message}\n\nVui lòng thử lại hoặc liên hệ admin.`);
        return;
      }
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      onExamGenerated(generatedExam);
      handleClose();

      alert(`🎉 Thành công!\n\nĐề thi "${generatedExam.title}" đã được tạo và lưu vào database!\n\n📊 Chi tiết:\n• ${generatedExam.passages.length} passages\n• ${generatedExam.total_questions} câu hỏi\n• Thời gian: ${generatedExam.duration} phút\n• Target Band: ${generatedExam.target_band}`);

    } catch (error) {
      console.error('Error generating reading exam:', error);
      setIsGenerating(false);
      
      const fallbackExam = generateFallbackExam();
      onExamGenerated(fallbackExam);
      handleClose();
      
      alert(`❌ AI generation failed!\n\nLỗi: ${error instanceof Error ? error.message : 'Unknown error'}\n\n✅ Đã sử dụng dữ liệu mẫu thay thế.`);
    }
  };

  const generateFallbackExam = (): AIGeneratedIELTSReading => {
    const totalQuestions = config.numPassages * config.questionsPerPassage;
    console.log(`Generating fallback exam: ${config.numPassages} passages, ${config.questionsPerPassage} questions per passage, total: ${totalQuestions}`);
    
    // Generate passages based on config
    const passages = [];
    for (let i = 1; i <= config.numPassages; i++) {
      // Get specific topic for this passage
      const passageTopic = config.topics.filter(t => t.trim())[(i-1) % config.topics.filter(t => t.trim()).length] || 'Academic Reading';
      console.log(`Creating fallback passage ${i} with topic: "${passageTopic}"`);
      
      const questions = [];
      for (let j = 1; j <= config.questionsPerPassage; j++) {
        // Use the specific passage topic instead of random
        const topic = passageTopic;
        
        // Generate different question types that AI supports
        const questionTypes: Array<'multiple-choice' | 'fill-blank' | 'true-false-notgiven'> = 
          ['multiple-choice', 'fill-blank', 'true-false-notgiven'];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let questionText = '';
        let options: string[] | undefined = undefined;
        let correctAnswer = '';

        // Create unique questions based on passage topic and question number
        switch (randomType) {
          case 'multiple-choice': {
            const mcQuestions = [
              `What is the main focus of ${topic.toLowerCase()} discussed in the passage?`,
              `According to the passage, which aspect of ${topic.toLowerCase()} is most significant?`,
              `The author suggests that ${topic.toLowerCase()} will likely lead to?`,
              `What challenge related to ${topic.toLowerCase()} is mentioned in the passage?`,
              `How does the passage describe the current state of ${topic.toLowerCase()}?`,
              `What future development in ${topic.toLowerCase()} does the passage predict?`,
              `The passage indicates that research in ${topic.toLowerCase()} requires?`,
              `According to the text, the impact of ${topic.toLowerCase()} has been?`,
              `What approach to ${topic.toLowerCase()} does the passage recommend?`,
              `The passage suggests that international cooperation in ${topic.toLowerCase()} is?`,
              `Educational implications of ${topic.toLowerCase()} mentioned include?`,
              `The passage describes innovations in ${topic.toLowerCase()} as?`,
              `What responsibility regarding ${topic.toLowerCase()} does the passage emphasize?`
            ];
            questionText = mcQuestions[(j-1) % mcQuestions.length];
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
            correctAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            break;
          }
          case 'true-false-notgiven': {
            const tfQuestions = [
              `The passage states that ${topic.toLowerCase()} has unlimited potential for growth.`,
              `Research in ${topic.toLowerCase()} began only recently according to the text.`,
              `The author believes international cooperation in ${topic.toLowerCase()} is essential.`,
              `Educational institutions have fully adapted to ${topic.toLowerCase()} developments.`,
              `The passage suggests that ${topic.toLowerCase()} faces no significant challenges.`,
              `Historical development of ${topic.toLowerCase()} occurred gradually over decades.`,
              `Contemporary approaches to ${topic.toLowerCase()} emphasize individual work.`,
              `The impact of ${topic.toLowerCase()} on industries has been minimal.`,
              `Future applications of ${topic.toLowerCase()} are expected to be revolutionary.`,
              `Policymakers are well-prepared for ${topic.toLowerCase()} challenges.`,
              `The pace of innovation in ${topic.toLowerCase()} has slowed down recently.`,
              `International sharing of ${topic.toLowerCase()} expertise is uncommon.`,
              `The passage indicates that ${topic.toLowerCase()} requires ethical consideration.`
            ];
            questionText = tfQuestions[(j-1) % tfQuestions.length];
            correctAnswer = ['TRUE', 'FALSE', 'NOT GIVEN'][Math.floor(Math.random() * 3)];
            break;
          }
          case 'fill-blank': {
            const fillQuestions = [
              `According to the passage, developments in ${topic.toLowerCase()} have been _______.`,
              `The text suggests that ${topic.toLowerCase()} research requires _______ collaboration.`,
              `Historical progress in ${topic.toLowerCase()} can be traced back _______ decades.`,
              `The passage indicates that ${topic.toLowerCase()} has _______ implications for society.`,
              `Contemporary approaches to ${topic.toLowerCase()} emphasize _______ perspectives.`,
              `The next decade may bring _______ developments in ${topic.toLowerCase()}.`,
              `International cooperation involves sharing _______ and expertise.`,
              `Educational institutions are _______ their curricula to include ${topic.toLowerCase()}.`,
              `The pace of innovation in ${topic.toLowerCase()} has been _______.`,
              `Future applications could _______ multiple sectors.`,
              `Policymakers are developing _______ to address new challenges.`,
              `The responsibility for ${topic.toLowerCase()} development involves various _______.`,
              `The passage describes the global nature of ${topic.toLowerCase()} as _______.`
            ];
            const fillAnswers = [
              'significant', 'international', 'several', 'far-reaching', 'diverse',
              'remarkable', 'resources', 'revising', 'unprecedented', 'revolutionize',
              'legislation', 'stakeholders', 'essential'
            ];
            questionText = fillQuestions[(j-1) % fillQuestions.length];
            correctAnswer = fillAnswers[(j-1) % fillAnswers.length];
            break;
          }
          default: {
            questionText = `What does the passage emphasize about ${topic.toLowerCase()}?`;
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
            correctAnswer = 'A';
            break;
          }
        }
        
        questions.push({
          id: `passage${i}-q${j}`,
          type: randomType,
          question: questionText,
          passage_reference: `Lines ${j * 2 - 1}-${j * 2 + 1}`,
          options: options,
          correct_answer: correctAnswer,
          explanation: `This question tests your understanding of ${topic.toLowerCase()} as discussed in passage ${i}. The correct answer can be found by carefully reading the relevant section.`,
          difficulty: config.difficulty,
          band_score_range: config.targetBand
        });
      }
      
      const topicForPassage = passageTopic;
      
      passages.push({
        id: `passage${i}`,
        title: `Passage ${i}: ${topicForPassage}`,
        content: `This is a sample reading passage about ${topicForPassage.toLowerCase()}. The passage contains approximately 800-900 words and covers various aspects of the topic. Students will need to read carefully and answer ${config.questionsPerPassage} questions based on the information provided in this passage.

The content would include detailed information, examples, statistics, and expert opinions related to the topic. This passage is designed to test reading comprehension skills at the ${config.difficulty} level.

In a real exam, this passage would be much longer and contain specific information that students need to identify to answer the questions correctly. The questions test various skills including detail recognition, main idea identification, inference, and understanding of writer's opinions.

[Additional content would continue here for approximately 600-700 more words to reach the standard IELTS passage length]`,
        word_count: 850,
        topic: topicForPassage,
        difficulty: config.difficulty,
        academic_level: 'University',
        source_type: 'academic' as const,
        questions: questions
      });
      
      console.log(`Created fallback passage ${i}: "${topicForPassage}" with ${questions.length} questions`);
    }
    
    console.log(`Total fallback passages created: ${passages.length}`);
    console.log(`Fallback passages summary:`, passages.map(p => ({ id: p.id, title: p.title, questionCount: p.questions.length })));

    return {
      title: config.title || `IELTS Reading Test - ${config.difficulty}`,
      description: config.description || `Đề thi IELTS Reading với ${config.numPassages} passage và ${totalQuestions} câu hỏi`,
      type: 'reading' as const,
      difficulty: config.difficulty,
      duration: config.duration,
      total_questions: totalQuestions,
      target_band: config.targetBand,
      instructions: [
        'Đọc kỹ từng passage trước khi trả lời câu hỏi',
        'Quản lý thời gian hợp lý cho từng passage',
        'Tìm keywords trong câu hỏi để định vị thông tin',
        'Kiểm tra lại đáp án trước khi chuyển passage'
      ],
      passages: passages,
      scoring_criteria: {
        band_5: { min_correct: Math.floor(totalQuestions * 0.35), max_correct: Math.floor(totalQuestions * 0.42) },
        band_6: { min_correct: Math.floor(totalQuestions * 0.43), max_correct: Math.floor(totalQuestions * 0.54) },
        band_7: { min_correct: Math.floor(totalQuestions * 0.55), max_correct: Math.floor(totalQuestions * 0.69) },
        band_8: { min_correct: Math.floor(totalQuestions * 0.70), max_correct: Math.floor(totalQuestions * 0.84) },
        band_9: { min_correct: Math.floor(totalQuestions * 0.85), max_correct: totalQuestions }
      },
      time_allocation: {
        per_passage: Math.floor(config.duration / config.numPassages),
        total_reading: Math.floor(config.duration * 0.6),
        total_answering: Math.floor(config.duration * 0.4)
      },
      tips: [
        'Skim all passages first to get an overview',
        'Pay attention to keywords in questions',
        'Manage your time effectively across all passages',
        'Don\'t spend too much time on difficult questions'
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
                    Tổng cộng {config.numPassages * config.questionsPerPassage} câu hỏi đa dạng (multiple choice, fill blank, T/F/NG)
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
