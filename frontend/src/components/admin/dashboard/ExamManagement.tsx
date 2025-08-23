import { useState } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, FileText, Volume2, Clock, Users } from 'lucide-react';
import CreateIELTSExam from './CreateIELTSExam';

interface Exam {
  id: string;
  title: string;
  type: 'reading' | 'listening';
  difficulty: string;
  duration: number;
  totalQuestions: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

const ExamManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  
  // Mock data - replace with real API call
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'IELTS Academic Reading Test 1',
      type: 'reading',
      difficulty: 'Band 6.0-7.0',
      duration: 60,
      totalQuestions: 40,
      status: 'published',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'IELTS Listening Test 1',
      type: 'listening',
      difficulty: 'Band 5.0-6.0',
      duration: 40,
      totalQuestions: 40,
      status: 'draft',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-18'
    }
  ]);

  const handleCreateExam = (examData: {
    title: string;
    type: 'reading' | 'listening';
    difficulty: string;
    duration: number;
    totalQuestions: number;
  }) => {
    const newExam: Exam = {
      id: Date.now().toString(),
      title: examData.title,
      type: examData.type,
      difficulty: examData.difficulty,
      duration: examData.duration,
      totalQuestions: examData.totalQuestions,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setExams(prev => [newExam, ...prev]);
    setShowCreateForm(false);
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exam.type === filterType;
    const matchesLevel = filterLevel === 'all' || exam.difficulty.includes(filterLevel);
    return matchesSearch && matchesType && matchesLevel;
  });

  if (showCreateForm) {
    return (
      <CreateIELTSExam
        onBack={() => setShowCreateForm(false)}
        onSave={handleCreateExam}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent">
            Quản lý đề thi
          </h1>
          <p className="text-gray-600 mt-2">Tạo và quản lý các đề thi IELTS Reading và Listening</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          Tạo đề thi mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đề thi</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reading Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {exams.filter(e => e.type === 'reading').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Listening Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {exams.filter(e => e.type === 'listening').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Volume2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã xuất bản</p>
              <p className="text-2xl font-bold text-gray-900">
                {exams.filter(e => e.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-lime-100 rounded-lg">
              <Users className="h-6 w-6 text-lime-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              <option value="all">Tất cả loại</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
            </select>
          </div>
          
          {/* Level Filter */}
          <div className="lg:w-48">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="4.0">Band 4.0-5.0</option>
              <option value="5.0">Band 5.0-6.0</option>
              <option value="6.0">Band 6.0-7.0</option>
              <option value="7.0">Band 7.0-8.0</option>
              <option value="8.0">Band 8.0-9.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đề thi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cấp độ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Câu hỏi
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                        exam.type === 'reading' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {exam.type === 'reading' ? <BookOpen className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                        <div className="text-sm text-gray-500">ID: {exam.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.type === 'reading'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {exam.type === 'reading' ? 'Reading' : 'Listening'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.difficulty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {exam.duration} phút
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FileText className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đề thi nào</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all' || filterLevel !== 'all'
                ? 'Không tìm thấy đề thi phù hợp với bộ lọc.'
                : 'Chưa có đề thi nào được tạo.'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterLevel === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Tạo đề thi đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
