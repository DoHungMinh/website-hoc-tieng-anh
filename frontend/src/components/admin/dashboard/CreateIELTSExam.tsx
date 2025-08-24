import { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  FileText,
  Volume2,
  Clock,
  Users,
  Target,
  CheckCircle,
  BookOpen
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-notgiven' | 'matching' | 'map-labeling';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  audioTimestamp?: number; // For listening questions
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
  audioFile?: File;
  audioUrl?: string;
  duration: number; // in minutes
  questions: Question[];
}

interface ExamData {
  title: string;
  type: 'reading' | 'listening';
  difficulty: string;
  duration: number; // in minutes
  totalQuestions: number;
  description: string;
  passages?: Passage[]; // For reading
  sections?: Section[]; // For listening
}

interface CreateIELTSExamProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const CreateIELTSExam: React.FC<CreateIELTSExamProps> = ({ onCancel, onSuccess }) => {
  const [examType, setExamType] = useState<'reading' | 'listening'>('reading');
  const [examData, setExamData] = useState<ExamData>({
    title: '',
    type: 'reading',
    difficulty: 'Band 6.0-7.0',
    duration: 60,
    totalQuestions: 0,
    description: '',
    passages: [
      {
        id: '1',
        title: '',
        content: '',
        questions: []
      }
    ],
    sections: [
      {
        id: '1',
        title: 'Section 1',
        description: '',
        duration: 10,
        questions: []
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<'info' | 'content' | 'preview'>('info');
  const [uploadingAudio, setUploadingAudio] = useState<string | null>(null);

  const difficultyOptions = [
    'Band 4.0-5.0',
    'Band 5.0-6.0', 
    'Band 6.0-7.0',
    'Band 7.0-8.0',
    'Band 8.0-9.0'
  ];

  const handleExamTypeChange = (type: 'reading' | 'listening') => {
    setExamType(type);
    setExamData(prev => ({
      ...prev,
      type,
      duration: type === 'reading' ? 60 : 40,
      passages: type === 'reading' ? prev.passages : undefined,
      sections: type === 'listening' ? prev.sections : undefined
    }));
  };

  const addPassage = () => {
    if (examData.passages) {
      setExamData(prev => ({
        ...prev,
        passages: [
          ...prev.passages!,
          {
            id: (prev.passages!.length + 1).toString(),
            title: '',
            content: '',
            questions: []
          }
        ]
      }));
    }
  };

  const addSection = () => {
    if (examData.sections) {
      setExamData(prev => ({
        ...prev,
        sections: [
          ...prev.sections!,
          {
            id: (prev.sections!.length + 1).toString(),
            title: `Section ${prev.sections!.length + 1}`,
            description: '',
            duration: 10,
            questions: []
          }
        ]
      }));
    }
  };

  const addQuestion = (passageId?: string, sectionId?: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };

    if (examType === 'reading' && passageId && examData.passages) {
      setExamData(prev => ({
        ...prev,
        passages: prev.passages!.map(passage =>
          passage.id === passageId
            ? { ...passage, questions: [...passage.questions, newQuestion] }
            : passage
        )
      }));
    } else if (examType === 'listening' && sectionId && examData.sections) {
      setExamData(prev => ({
        ...prev,
        sections: prev.sections!.map(section =>
          section.id === sectionId
            ? { ...section, questions: [...section.questions, newQuestion] }
            : section
        )
      }));
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>, passageId?: string, sectionId?: string) => {
    if (examType === 'reading' && passageId && examData.passages) {
      setExamData(prev => ({
        ...prev,
        passages: prev.passages!.map(passage =>
          passage.id === passageId
            ? {
                ...passage,
                questions: passage.questions.map(q =>
                  q.id === questionId ? { ...q, ...updates } : q
                )
              }
            : passage
        )
      }));
    } else if (examType === 'listening' && sectionId && examData.sections) {
      setExamData(prev => ({
        ...prev,
        sections: prev.sections!.map(section =>
          section.id === sectionId
            ? {
                ...section,
                questions: section.questions.map(q =>
                  q.id === questionId ? { ...q, ...updates } : q
                )
              }
            : section
        )
      }));
    }
  };

  const handleAudioUpload = async (sectionId: string, file: File) => {
    setUploadingAudio(sectionId);
    
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('examId', 'temp');
      formData.append('sectionId', sectionId);
      
      const response = await fetch('/api/ielts/upload-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setExamData(prev => ({
        ...prev,
        sections: prev.sections!.map(section =>
          section.id === sectionId
            ? { 
                ...section, 
                audioFile: file, 
                audioUrl: data.data.audioUrl,
                audioPublicId: data.data.audioPublicId
              }
            : section
        )
      }));
      
      setUploadingAudio(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadingAudio(null);
      alert('Upload file thất bại. Vui lòng thử lại.');
    }
  };

  const calculateTotalQuestions = () => {
    if (examType === 'reading' && examData.passages) {
      return examData.passages.reduce((total, passage) => total + passage.questions.length, 0);
    } else if (examType === 'listening' && examData.sections) {
      return examData.sections.reduce((total, section) => total + section.questions.length, 0);
    }
    return 0;
  };

  const handleSave = async () => {
    try {
      const finalExamData = {
        ...examData,
        totalQuestions: calculateTotalQuestions()
      };
      
      const response = await fetch('/api/ielts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(finalExamData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create exam');
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('Tạo đề thi thành công!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Lỗi khi tạo đề thi. Vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách đề thi
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent">
              Tạo đề thi IELTS mới
            </h1>
            <p className="text-gray-600 mt-2">Tạo và cấu hình đề thi Reading hoặc Listening</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('preview')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Xem trước
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Save className="h-4 w-4" />
              Lưu đề thi
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'info', label: 'Thông tin cơ bản', icon: FileText },
          { id: 'content', label: 'Nội dung đề thi', icon: BookOpen },
          { id: 'preview', label: 'Xem trước', icon: Eye }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'info' | 'content' | 'preview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại đề thi <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { value: 'reading', label: 'Reading', icon: FileText },
                    { value: 'listening', label: 'Listening', icon: Volume2 }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleExamTypeChange(type.value as 'reading' | 'listening')}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                        examType === type.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <type.icon className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examData.title}
                  onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`IELTS ${examType === 'reading' ? 'Academic Reading' : 'Listening'} Test 1`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ khó
                </label>
                <select
                  value={examData.difficulty}
                  onChange={(e) => setExamData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  value={examData.duration}
                  onChange={(e) => setExamData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả đề thi
                </label>
                <textarea
                  value={examData.description}
                  onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của đề thi..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                />
              </div>

              {/* Stats Preview */}
              <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-4">Thống kê đề thi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-700">{examData.duration}</p>
                    <p className="text-sm text-green-600">Phút</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-xl mx-auto mb-2">
                      <Target className="h-6 w-6 text-lime-600" />
                    </div>
                    <p className="text-2xl font-bold text-lime-700">{calculateTotalQuestions()}</p>
                    <p className="text-sm text-lime-600">Câu hỏi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          {examType === 'reading' ? (
            // Reading Content
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Passages & Questions</h2>
                <button
                  onClick={addPassage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Thêm Passage
                </button>
              </div>

              {examData.passages?.map((passage, passageIndex) => (
                <div key={passage.id} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Passage {passageIndex + 1}</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Passage Content */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề Passage
                        </label>
                        <input
                          type="text"
                          value={passage.title}
                          onChange={(e) => {
                            setExamData(prev => ({
                              ...prev,
                              passages: prev.passages!.map(p =>
                                p.id === passage.id ? { ...p, title: e.target.value } : p
                              )
                            }));
                          }}
                          placeholder="The History of Chocolate"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung Passage
                        </label>
                        <textarea
                          value={passage.content}
                          onChange={(e) => {
                            setExamData(prev => ({
                              ...prev,
                              passages: prev.passages!.map(p =>
                                p.id === passage.id ? { ...p, content: e.target.value } : p
                              )
                            }));
                          }}
                          rows={12}
                          placeholder="Nhập nội dung passage tại đây..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Questions */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Câu hỏi ({passage.questions.length})
                        </h4>
                        <button
                          onClick={() => addQuestion(passage.id)}
                          className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm câu hỏi
                        </button>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {passage.questions.map((question, qIndex) => (
                          <QuestionForm
                            key={question.id}
                            question={question}
                            index={qIndex}
                            onUpdate={(updates) => updateQuestion(question.id, updates, passage.id)}
                            onDelete={() => {
                              setExamData(prev => ({
                                ...prev,
                                passages: prev.passages!.map(p =>
                                  p.id === passage.id
                                    ? { ...p, questions: p.questions.filter(q => q.id !== question.id) }
                                    : p
                                )
                              }));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Listening Content
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sections & Questions</h2>
                <button
                  onClick={addSection}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Thêm Section
                </button>
              </div>

              {examData.sections?.map((section, sectionIndex) => (
                <div key={section.id} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Section {sectionIndex + 1}</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Section Info & Audio */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề Section
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            setExamData(prev => ({
                              ...prev,
                              sections: prev.sections!.map(s =>
                                s.id === section.id ? { ...s, title: e.target.value } : s
                              )
                            }));
                          }}
                          placeholder="Section 1: Social Conversation"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả Section
                        </label>
                        <textarea
                          value={section.description}
                          onChange={(e) => {
                            setExamData(prev => ({
                              ...prev,
                              sections: prev.sections!.map(s =>
                                s.id === section.id ? { ...s, description: e.target.value } : s
                              )
                            }));
                          }}
                          rows={3}
                          placeholder="Mô tả ngắn gọn về nội dung section..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian (phút)
                        </label>
                        <input
                          type="number"
                          value={section.duration}
                          onChange={(e) => {
                            setExamData(prev => ({
                              ...prev,
                              sections: prev.sections!.map(s =>
                                s.id === section.id ? { ...s, duration: parseInt(e.target.value) } : s
                              )
                            }));
                          }}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      </div>

                      {/* Audio Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File Audio <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                          {section.audioFile ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">{section.audioFile.name}</p>
                              <audio controls className="mx-auto">
                                <source src={section.audioUrl} type="audio/mpeg" />
                              </audio>
                              <button
                                onClick={() => {
                                  setExamData(prev => ({
                                    ...prev,
                                    sections: prev.sections!.map(s =>
                                      s.id === section.id ? { ...s, audioFile: undefined, audioUrl: undefined } : s
                                    )
                                  }));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Xóa file
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
                                {uploadingAudio === section.id ? (
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                ) : (
                                  <Upload className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">Tải lên file MP3</p>
                              <input
                                type="file"
                                accept="audio/mp3,audio/mpeg"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleAudioUpload(section.id, file);
                                  }
                                }}
                                className="hidden"
                                id={`audio-${section.id}`}
                              />
                              <label
                                htmlFor={`audio-${section.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors"
                              >
                                <Upload className="h-4 w-4" />
                                Chọn file
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Câu hỏi ({section.questions.length})
                        </h4>
                        <button
                          onClick={() => addQuestion(undefined, section.id)}
                          className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm câu hỏi
                        </button>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {section.questions.map((question, qIndex) => (
                          <QuestionForm
                            key={question.id}
                            question={question}
                            index={qIndex}
                            isListening={true}
                            onUpdate={(updates) => updateQuestion(question.id, updates, undefined, section.id)}
                            onDelete={() => {
                              setExamData(prev => ({
                                ...prev,
                                sections: prev.sections!.map(s =>
                                  s.id === section.id
                                    ? { ...s, questions: s.questions.filter(q => q.id !== question.id) }
                                    : s
                                )
                              }));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Xem trước đề thi</h2>
          
          {/* Exam Info */}
          <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600">Loại đề thi</p>
                <p className="font-bold text-green-800 capitalize">{examType}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-xl mx-auto mb-2">
                  <Clock className="h-6 w-6 text-lime-600" />
                </div>
                <p className="text-sm text-lime-600">Thời gian</p>
                <p className="font-bold text-lime-800">{examData.duration} phút</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600">Số câu hỏi</p>
                <p className="font-bold text-green-800">{calculateTotalQuestions()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-xl mx-auto mb-2">
                  <Users className="h-6 w-6 text-lime-600" />
                </div>
                <p className="text-sm text-lime-600">Độ khó</p>
                <p className="font-bold text-lime-800">{examData.difficulty}</p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">{examData.title}</h3>
            <p className="text-gray-600">{examData.description}</p>
            
            {examType === 'reading' ? (
              <div className="space-y-6">
                {examData.passages?.map((passage, index) => (
                  <div key={passage.id} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-2">Passage {index + 1}: {passage.title}</h4>
                    <p className="text-gray-600 mb-4">Số câu hỏi: {passage.questions.length}</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 line-clamp-3">{passage.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {examData.sections?.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                    <p className="text-gray-600 mb-2">{section.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Thời gian: {section.duration} phút</span>
                      <span>Số câu hỏi: {section.questions.length}</span>
                      <span>Audio: {section.audioFile ? '✓ Đã tải lên' : '✗ Chưa có'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Question Form Component
interface QuestionFormProps {
  question: Question;
  index: number;
  isListening?: boolean;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, index, isListening, onUpdate, onDelete }) => {
  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'fill-blank', label: 'Fill in the Blanks' },
    { value: 'true-false-notgiven', label: 'True/False/Not Given' },
    { value: 'matching', label: 'Matching' },
    { value: 'map-labeling', label: 'Map/Diagram Labeling' }
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-900">Câu {index + 1}</h5>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
        <select
          value={question.type}
          onChange={(e) => onUpdate({ type: e.target.value as Question['type'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi</label>
        <textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          rows={2}
          placeholder="Nhập nội dung câu hỏi..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
        />
      </div>

      {isListening && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp (giây)</label>
          <input
            type="number"
            value={question.audioTimestamp || 0}
            onChange={(e) => onUpdate({ audioTimestamp: parseInt(e.target.value) })}
            placeholder="Thời điểm trong audio khi câu hỏi xuất hiện"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>
      )}

      {(question.type === 'multiple-choice' || question.type === 'true-false-notgiven' || question.type === 'matching') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lựa chọn</label>
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === optionIndex}
                  onChange={() => onUpdate({ correctAnswer: optionIndex })}
                  className="text-green-600 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[optionIndex] = e.target.value;
                    onUpdate({ options: newOptions });
                  }}
                  placeholder={`Lựa chọn ${optionIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {question.type === 'fill-blank' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án đúng</label>
          <input
            type="text"
            value={question.correctAnswer as string}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
            placeholder="Nhập đáp án đúng..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích (tùy chọn)</label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          rows={2}
          placeholder="Giải thích đáp án hoặc gợi ý..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
        />
      </div>
    </div>
  );
};

export default CreateIELTSExam;
