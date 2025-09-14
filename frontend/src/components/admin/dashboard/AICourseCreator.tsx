import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Target, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  DollarSign,
  Lightbulb
} from 'lucide-react';
import type { Course } from '../../../services/courseAPI';
import { aiCourseService, AIGenerationConfig } from '../../../services/aiCourseService';

interface AIConfig {
  type: 'vocabulary' | 'grammar';
  topic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  contentLength: number;
  price: number;
  duration: string;
  includePronunciation: boolean;
  includeExamples: boolean;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  targetAudience: string;
}

interface AICourseCreatorProps {
  onCourseGenerated: (course: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

const AICourseCreator: React.FC<AICourseCreatorProps> = ({ onCourseGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<AIConfig>({
    type: 'vocabulary',
    topic: '',
    level: 'A1',
    contentLength: 20,
    price: 299000,
    duration: '4 tuần',
    includePronunciation: true,
    includeExamples: true,
    difficulty: 'basic',
    targetAudience: ''
  });

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(1);
    setProgress(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setIsGenerating(false);
    setProgress(0);
    setConfig({
      type: 'vocabulary',
      topic: '',
      level: 'A1',
      contentLength: 20,
      price: 299000,
      duration: '4 tuần',
      includePronunciation: true,
      includeExamples: true,
      difficulty: 'basic',
      targetAudience: ''
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.type !== undefined;
      case 2:
        return config.topic.trim() !== '';
      case 3:
        return config.price > 0 && config.duration.trim() !== '';
      case 4:
        return config.contentLength >= 10;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStep(5);
    
    try {
      // Prepare AI generation config
      const aiConfig: AIGenerationConfig = {
        type: config.type,
        topic: config.topic,
        level: config.level,
        contentLength: config.contentLength,
        price: config.price,
        duration: config.duration,
        includePronunciation: config.includePronunciation,
        includeExamples: config.includeExamples,
        difficulty: config.difficulty,
        targetAudience: config.targetAudience
      };

      // Simulate progress steps
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call AI service to generate course
      setProgress(60);
      const generatedCourse = await aiCourseService.generateCourse(aiConfig);
      
      // Validate response
      if (!generatedCourse) {
        throw new Error('No course data received from AI service');
      }
      
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Convert to Course format
      const courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'> = {
        title: generatedCourse.title || `${config.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} ${config.topic} - ${config.level}`,
        description: generatedCourse.description || `Khóa học ${config.type} về ${config.topic}`,
        type: generatedCourse.type || config.type,
        level: generatedCourse.level || config.level,
        duration: generatedCourse.duration || config.duration,
        price: generatedCourse.price || config.price,
        instructor: generatedCourse.instructor || 'AI Assistant',
        status: 'draft' as const,
        studentsCount: generatedCourse.studentsCount || 0,
        lessonsCount: generatedCourse.lessonsCount || Math.ceil(config.contentLength / 5),
        vocabulary: generatedCourse.vocabulary || [],
        grammar: generatedCourse.grammar || [],
        requirements: generatedCourse.requirements || [`Trình độ ${config.level} trở lên`],
        benefits: generatedCourse.benefits || [`Nắm vững ${config.contentLength} ${config.type === 'vocabulary' ? 'từ vựng' : 'quy tắc ngữ pháp'}`],
        curriculum: generatedCourse.curriculum || []
      };

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsGenerating(false);
      onCourseGenerated(courseData);
      handleClose();

    } catch (error) {
      console.error('Error generating course:', error);
      setIsGenerating(false);
      
      // Fallback to mock data if AI fails
      const fallbackCourse = generateFallbackCourse();
      onCourseGenerated(fallbackCourse);
      handleClose();
      
      alert('AI generation failed, using fallback data. Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const generateFallbackCourse = (): Omit<Course, '_id' | 'createdAt' | 'updatedAt'> => {
    return {
      title: `${config.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} ${config.topic} - ${config.level}`,
      description: `Khóa học ${config.type === 'vocabulary' ? 'từ vựng' : 'ngữ pháp'} về chủ đề ${config.topic} dành cho học viên trình độ ${config.level}`,
      type: config.type,
      level: config.level,
      duration: config.duration,
      price: config.price,
      instructor: 'AI Assistant',
      status: 'draft' as const,
      studentsCount: 0,
      lessonsCount: Math.ceil(config.contentLength / 5),
      vocabulary: config.type === 'vocabulary' ? generateMockVocabulary() : [],
      grammar: config.type === 'grammar' ? generateMockGrammar() : [],
      requirements: [`Trình độ ${config.level} trở lên`, 'Có khả năng đọc hiểu cơ bản'],
      benefits: [
        `Nắm vững ${config.contentLength} ${config.type === 'vocabulary' ? 'từ vựng' : 'quy tắc ngữ pháp'}`,
        'Cải thiện khả năng giao tiếp',
        'Tự tin hơn trong việc sử dụng tiếng Anh'
      ],
      curriculum: []
    };
  };

  const generateMockVocabulary = () => {
    return Array.from({ length: Math.min(config.contentLength, 5) }, (_, i) => ({
      id: `vocab-${i + 1}`,
      word: `Word ${i + 1}`,
      pronunciation: `/wɜːrd ${i + 1}/`,
      meaning: `Nghĩa của từ ${i + 1}`,
      example: `Example sentence for word ${i + 1}.`
    }));
  };

  const generateMockGrammar = () => {
    return Array.from({ length: Math.min(config.contentLength, 5) }, (_, i) => ({
      id: `grammar-${i + 1}`,
      rule: `Grammar Rule ${i + 1}`,
      structure: `Structure ${i + 1}`,
      explanation: `Giải thích quy tắc ngữ pháp ${i + 1}`,
      example: `Example sentence ${i + 1}.`
    }));
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800',
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-red-100 text-red-800',
      'C2': 'bg-purple-100 text-purple-800',
      'IDIOMS': 'bg-indigo-100 text-indigo-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chọn loại khóa học</h3>
              <p className="text-gray-600">AI sẽ tạo nội dung phù hợp với loại khóa học bạn chọn</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, type: 'vocabulary' })}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  config.type === 'vocabulary'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`h-8 w-8 mx-auto mb-3 ${
                  config.type === 'vocabulary' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h4 className="font-medium text-gray-900 mb-2">Từ vựng</h4>
                <p className="text-sm text-gray-600">Tạo danh sách từ vựng với nghĩa và ví dụ</p>
              </button>

              <button
                onClick={() => setConfig({ ...config, type: 'grammar' })}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  config.type === 'grammar'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className={`h-8 w-8 mx-auto mb-3 ${
                  config.type === 'grammar' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h4 className="font-medium text-gray-900 mb-2">Ngữ pháp</h4>
                <p className="text-sm text-gray-600">Tạo quy tắc ngữ pháp với cấu trúc và ví dụ</p>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thông tin khóa học</h3>
              <p className="text-gray-600">Nhập thông tin cơ bản cho khóa học</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ đề khóa học *
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder={config.type === 'vocabulary' ? 'Ví dụ: Travel, Food, Business...' : 'Ví dụ: Present Tense, Modal Verbs...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ</label>
                  <select
                    value={config.level}
                    onChange={(e) => setConfig({ ...config, level: e.target.value as AIConfig['level'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Trung cấp cao</option>
                    <option value="C1">C1 - Nâng cao</option>
                    <option value="C2">C2 - Thành thạo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value as AIConfig['difficulty'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="basic">Cơ bản</option>
                    <option value="intermediate">Trung bình</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cấu hình nội dung</h3>
              <p className="text-gray-600">Tùy chỉnh độ dài và tính năng của khóa học</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng {config.type === 'vocabulary' ? 'từ vựng' : 'quy tắc ngữ pháp'}: {config.contentLength}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={config.contentLength}
                  onChange={(e) => setConfig({ ...config, contentLength: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>30</span>
                  <span>50</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Tùy chọn nâng cao</h4>
                
                {config.type === 'vocabulary' && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="font-medium text-gray-900">Bao gồm phát âm</label>
                      <p className="text-sm text-gray-600">Thêm ký hiệu phiên âm IPA</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.includePronunciation}
                      onChange={(e) => setConfig({ ...config, includePronunciation: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900">Bao gồm ví dụ</label>
                    <p className="text-sm text-gray-600">Thêm câu ví dụ minh họa</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.includeExamples}
                    onChange={(e) => setConfig({ ...config, includeExamples: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng học viên (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={config.targetAudience}
                  onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
                  placeholder="Ví dụ: Học sinh THPT, Người đi làm, Du học sinh..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thiết lập giá và thời lượng</h3>
              <p className="text-gray-600">Cấu hình thông tin tài chính và thời gian học</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá khóa học (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.price}
                    onChange={(e) => setConfig({ ...config, price: parseInt(e.target.value) || 0 })}
                    placeholder="299000"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="1000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">₫</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Giá được hiển thị: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(config.price)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng khóa học
                </label>
                <select
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1 tuần">1 tuần</option>
                  <option value="2 tuần">2 tuần</option>
                  <option value="3 tuần">3 tuần</option>
                  <option value="4 tuần">4 tuần</option>
                  <option value="6 tuần">6 tuần</option>
                  <option value="8 tuần">8 tuần</option>
                  <option value="10 tuần">10 tuần</option>
                  <option value="12 tuần">12 tuần (3 tháng)</option>
                  <option value="16 tuần">16 tuần (4 tháng)</option>
                  <option value="24 tuần">24 tuần (6 tháng)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Gợi ý định giá</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Khóa học cơ bản (A1-A2): 199.000₫ - 399.000₫</li>
                      <li>• Khóa học trung cấp (B1-B2): 299.000₫ - 599.000₫</li>
                      <li>• Khóa học nâng cao (C1-C2): 499.000₫ - 999.000₫</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              {isGenerating ? (
                <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
              ) : (
                <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isGenerating ? 'AI đang tạo khóa học...' : 'Tạo khóa học thành công!'}
              </h3>
              <p className="text-gray-600">
                {isGenerating ? 'Vui lòng đợi trong giây lát' : 'Khóa học đã được tạo và lưu dưới dạng bản nháp'}
              </p>
            </div>

            {isGenerating && (
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  {progress === 20 && 'Phân tích chủ đề...'}
                  {progress === 40 && 'Tạo nội dung...'}
                  {progress === 70 && 'Kiểm tra chất lượng...'}
                  {progress === 90 && 'Hoàn thiện khóa học...'}
                  {progress === 100 && 'Hoàn thành!'}
                </p>
              </div>
            )}

            {!isGenerating && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {config.type === 'vocabulary' ? (
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    ) : (
                      <FileText className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {config.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} {config.topic} - {config.level}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(config.level)}`}>
                          {config.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{config.contentLength} {config.type === 'vocabulary' ? 'từ' : 'quy tắc'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        title="AI tạo khóa học"
      >
        <div className="bg-white bg-opacity-20 rounded-full p-1">
          <Plus className="h-4 w-4" />
        </div>
        <Sparkles className="h-4 w-4" />
        AI tạo khóa học
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI tạo khóa học</h2>
                <p className="text-purple-100">Bước {currentStep} / 5</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full ${
                    step <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : currentStep === 4 ? (
              <button
                onClick={handleGenerate}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Tạo khóa học
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICourseCreator;
