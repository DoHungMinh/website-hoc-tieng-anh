import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  BookOpen,
  MessageSquare,
  Users,
  Clock,
  Star,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Target,
  Lightbulb,
  FileText,
  CheckCircle
} from 'lucide-react';

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  pronunciation?: string;
}

interface GrammarItem {
  id: string;
  rule: string;
  explanation: string;
  example: string;
  structure?: string;
}

interface Course {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'IDIOMS';
  price: number;
  originalPrice?: number;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  thumbnail: string;
  vocabulary?: VocabularyItem[];
  grammar?: GrammarItem[];
  instructor: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vocabulary' | 'grammar'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'IDIOMS'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const itemsPerPage = 10;

  // Mock data - trong thực tế sẽ gọi API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      const mockCourses: Course[] = [
        {
          id: 'vocab-a1',
          title: 'Từ vựng cơ bản hàng ngày',
          type: 'vocabulary',
          level: 'A1',
          price: 299000,
          originalPrice: 399000,
          duration: '4 tuần',
          lessonsCount: 20,
          studentsCount: 1250,
          rating: 4.8,
          description: 'Học 500+ từ vựng thiết yếu cho cuộc sống hàng ngày với phương pháp ghi nhớ thông minh',
          features: ['Học từ theo chủ đề', 'Flashcard thông minh', 'Game ôn tập', 'Phát âm chuẩn'],
          thumbnail: '/api/placeholder/300/200',
          instructor: 'Ms. Sarah Johnson',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-08-20',
          vocabulary: [
            {
              id: 'v1',
              word: 'Hello',
              meaning: 'Xin chào',
              example: 'Hello, how are you today?',
              pronunciation: '/həˈloʊ/'
            },
            {
              id: 'v2',
              word: 'Goodbye',
              meaning: 'Tạm biệt',
              example: 'Goodbye, see you tomorrow!',
              pronunciation: '/ɡʊdˈbaɪ/'
            }
          ]
        },
        {
          id: 'grammar-a1',
          title: 'Ngữ pháp cơ bản',
          type: 'grammar',
          level: 'A1',
          price: 249000,
          originalPrice: 349000,
          duration: '3 tuần',
          lessonsCount: 15,
          studentsCount: 1543,
          rating: 4.7,
          description: 'Nắm vững các cấu trúc ngữ pháp cơ bản nhất với bài tập tương tác',
          features: ['Present tenses', 'Basic sentence structure', 'Interactive exercises', 'Instant feedback'],
          thumbnail: '/api/placeholder/300/200',
          instructor: 'Mr. David Wilson',
          status: 'active',
          createdAt: '2024-02-10',
          updatedAt: '2024-08-18',
          grammar: [
            {
              id: 'g1',
              rule: 'Present Simple Tense',
              explanation: 'Thì hiện tại đơn diễn tả hành động xảy ra thường xuyên',
              example: 'I go to school every day.',
              structure: 'S + V(s/es) + O'
            },
            {
              id: 'g2',
              rule: 'Present Continuous Tense',
              explanation: 'Thì hiện tại tiếp diễn diễn tả hành động đang xảy ra',
              example: 'I am studying English now.',
              structure: 'S + am/is/are + V-ing + O'
            }
          ]
        }
      ];
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  };

  const getInitialCourse = (): Course => ({
    id: '',
    title: '',
    type: 'vocabulary',
    level: 'A1',
    price: 0,
    duration: '',
    lessonsCount: 0,
    studentsCount: 0,
    rating: 0,
    description: '',
    features: [],
    thumbnail: '',
    instructor: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vocabulary: [],
    grammar: []
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || course.type === filterType;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handleCreate = () => {
    setSelectedCourse(getInitialCourse());
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse({ ...course });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const handleSave = () => {
    if (!selectedCourse) return;

    if (isCreating) {
      const newCourse = {
        ...selectedCourse,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCourses([...courses, newCourse]);
    } else {
      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...selectedCourse, updatedAt: new Date().toISOString() }
          : c
      ));
    }

    setIsEditing(false);
    setIsCreating(false);
    setSelectedCourse(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedCourse(null);
    setShowDetails(false);
  };

  const addVocabularyItem = () => {
    if (!selectedCourse) return;
    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}`,
      word: '',
      meaning: '',
      example: '',
      pronunciation: ''
    };
    setSelectedCourse({
      ...selectedCourse,
      vocabulary: [...(selectedCourse.vocabulary || []), newItem]
    });
  };

  const updateVocabularyItem = (index: number, field: keyof VocabularyItem, value: string) => {
    if (!selectedCourse || !selectedCourse.vocabulary) return;
    const updatedVocab = [...selectedCourse.vocabulary];
    updatedVocab[index] = { ...updatedVocab[index], [field]: value };
    setSelectedCourse({ ...selectedCourse, vocabulary: updatedVocab });
  };

  const removeVocabularyItem = (index: number) => {
    if (!selectedCourse || !selectedCourse.vocabulary) return;
    const updatedVocab = selectedCourse.vocabulary.filter((_, i) => i !== index);
    setSelectedCourse({ ...selectedCourse, vocabulary: updatedVocab });
  };

  const addGrammarItem = () => {
    if (!selectedCourse) return;
    const newItem: GrammarItem = {
      id: `grammar-${Date.now()}`,
      rule: '',
      explanation: '',
      example: '',
      structure: ''
    };
    setSelectedCourse({
      ...selectedCourse,
      grammar: [...(selectedCourse.grammar || []), newItem]
    });
  };

  const updateGrammarItem = (index: number, field: keyof GrammarItem, value: string) => {
    if (!selectedCourse || !selectedCourse.grammar) return;
    const updatedGrammar = [...selectedCourse.grammar];
    updatedGrammar[index] = { ...updatedGrammar[index], [field]: value };
    setSelectedCourse({ ...selectedCourse, grammar: updatedGrammar });
  };

  const removeGrammarItem = (index: number) => {
    if (!selectedCourse || !selectedCourse.grammar) return;
    const updatedGrammar = selectedCourse.grammar.filter((_, i) => i !== index);
    setSelectedCourse({ ...selectedCourse, grammar: updatedGrammar });
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800',
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-purple-100 text-purple-800',
      'C2': 'bg-red-100 text-red-800',
      'IDIOMS': 'bg-pink-100 text-pink-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isEditing && selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isCreating ? 'Tạo khóa học mới' : 'Chỉnh sửa khóa học'}
            </h2>
            <p className="text-gray-600">
              {isCreating ? 'Tạo khóa học với nội dung từ vựng hoặc ngữ pháp' : 'Cập nhật thông tin khóa học'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Hủy
            </button>
          </div>
        </div>

        {/* Course Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khóa học</label>
                <input
                  type="text"
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập tên khóa học..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại khóa học</label>
                  <select
                    value={selectedCourse.type}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, type: e.target.value as 'vocabulary' | 'grammar' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="vocabulary">Từ vựng</option>
                    <option value="grammar">Ngữ pháp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ</label>
                  <select
                    value={selectedCourse.level}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, level: e.target.value as Course['level'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Trung cấp cao</option>
                    <option value="C1">C1 - Nâng cao</option>
                    <option value="C2">C2 - Thành thạo</option>
                    <option value="IDIOMS">IDIOMS - Thành ngữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={selectedCourse.price}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, price: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="299000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng</label>
                  <input
                    type="text"
                    value={selectedCourse.duration}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="4 tuần"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={selectedCourse.description}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả chi tiết về khóa học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giảng viên</label>
                <input
                  type="text"
                  value={selectedCourse.instructor}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tên giảng viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={selectedCourse.status}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, status: e.target.value as Course['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="active">Hoạt động</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>

            {/* Content Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {selectedCourse.type === 'vocabulary' ? (
                  <>
                    <MessageSquare className="h-5 w-5" />
                    Quản lý từ vựng
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Quản lý ngữ pháp
                  </>
                )}
              </h3>

              {selectedCourse.type === 'vocabulary' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Danh sách từ vựng ({selectedCourse.vocabulary?.length || 0} từ)
                    </p>
                    <button
                      onClick={addVocabularyItem}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm từ vựng
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedCourse.vocabulary?.map((vocab, index) => (
                      <div key={vocab.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">Từ vựng #{index + 1}</h4>
                          <button
                            onClick={() => removeVocabularyItem(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Từ vựng</label>
                            <input
                              type="text"
                              value={vocab.word}
                              onChange={(e) => updateVocabularyItem(index, 'word', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Hello"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phát âm</label>
                            <input
                              type="text"
                              value={vocab.pronunciation || ''}
                              onChange={(e) => updateVocabularyItem(index, 'pronunciation', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="/həˈloʊ/"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ý nghĩa</label>
                          <input
                            type="text"
                            value={vocab.meaning}
                            onChange={(e) => updateVocabularyItem(index, 'meaning', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Xin chào"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ví dụ trong câu</label>
                          <input
                            type="text"
                            value={vocab.example}
                            onChange={(e) => updateVocabularyItem(index, 'example', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Hello, how are you today?"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Danh sách ngữ pháp ({selectedCourse.grammar?.length || 0} quy tắc)
                    </p>
                    <button
                      onClick={addGrammarItem}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm ngữ pháp
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedCourse.grammar?.map((grammar, index) => (
                      <div key={grammar.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">Ngữ pháp #{index + 1}</h4>
                          <button
                            onClick={() => removeGrammarItem(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quy tắc ngữ pháp</label>
                            <input
                              type="text"
                              value={grammar.rule}
                              onChange={(e) => updateGrammarItem(index, 'rule', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Present Simple Tense"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cấu trúc</label>
                            <input
                              type="text"
                              value={grammar.structure || ''}
                              onChange={(e) => updateGrammarItem(index, 'structure', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="S + V(s/es) + O"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Giải thích</label>
                          <textarea
                            value={grammar.explanation}
                            onChange={(e) => updateGrammarItem(index, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Thì hiện tại đơn diễn tả hành động xảy ra thường xuyên..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ví dụ</label>
                          <input
                            type="text"
                            value={grammar.example}
                            onChange={(e) => updateGrammarItem(index, 'example', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="I go to school every day."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showDetails && selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết khóa học</h2>
            <p className="text-gray-600">{selectedCourse.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(selectedCourse)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Đóng
            </button>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Cấp độ</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(selectedCourse.level)}`}>
                        {selectedCourse.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Thời lượng</p>
                      <p className="font-medium">{selectedCourse.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Số bài học</p>
                      <p className="font-medium">{selectedCourse.lessonsCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Học viên</p>
                      <p className="font-medium">{selectedCourse.studentsCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mô tả</h4>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tính năng nổi bật</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCourse.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Đánh giá</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{selectedCourse.rating}/5.0</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Học viên</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{selectedCourse.studentsCount.toLocaleString()}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Giá</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(selectedCourse.price)}</p>
                {selectedCourse.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">{formatPrice(selectedCourse.originalPrice)}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Trạng thái</span>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse.status)}`}>
                  {selectedCourse.status === 'active' ? 'Hoạt động' : 
                   selectedCourse.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                </span>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCourse.type === 'vocabulary' ? 'Từ vựng trong khóa học' : 'Ngữ pháp trong khóa học'}
            </h3>
            
            {selectedCourse.type === 'vocabulary' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCourse.vocabulary?.slice(0, 4).map((vocab) => (
                  <div key={vocab.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-purple-600">{vocab.word}</h4>
                      {vocab.pronunciation && (
                        <span className="text-xs text-gray-500">{vocab.pronunciation}</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{vocab.meaning}</p>
                    <p className="text-sm text-gray-600 italic">"{vocab.example}"</p>
                  </div>
                ))}
                {(selectedCourse.vocabulary?.length || 0) > 4 && (
                  <div className="md:col-span-2 text-center text-gray-500 text-sm">
                    và {(selectedCourse.vocabulary?.length || 0) - 4} từ vựng khác...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCourse.grammar?.slice(0, 3).map((grammar) => (
                  <div key={grammar.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-purple-600">{grammar.rule}</h4>
                      {grammar.structure && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{grammar.structure}</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{grammar.explanation}</p>
                    <p className="text-sm text-gray-600 italic">Ví dụ: "{grammar.example}"</p>
                  </div>
                ))}
                {(selectedCourse.grammar?.length || 0) > 3 && (
                  <div className="text-center text-gray-500 text-sm">
                    và {(selectedCourse.grammar?.length || 0) - 3} quy tắc ngữ pháp khác...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h2>
          <p className="text-gray-600">Quản lý nội dung và cấu trúc khóa học</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          Tạo khóa học mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học, giảng viên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'vocabulary' | 'grammar')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">Tất cả loại</option>
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
              </select>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'IDIOMS')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="IDIOMS">IDIOMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại & Cấp độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              {course.type === 'vocabulary' ? (
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.instructor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {course.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(course.price)}
                        </div>
                        {course.originalPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(course.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {course.studentsCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {course.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                          {course.status === 'active' ? 'Hoạt động' : 
                           course.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDetails(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredCourses.length)}
                      </span>{' '}
                      trong tổng số <span className="font-medium">{filteredCourses.length}</span> khóa học
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
