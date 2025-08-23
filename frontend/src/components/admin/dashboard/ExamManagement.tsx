import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, FileText, Volume2, Clock, Users } from 'lucide-react';
import CreateIELTSExam from './CreateIELTSExam';

interface Exam {
  _id: string;
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    listening: 0,
    published: 0
  });
  
  // Replace mock data with API calls
  const [exams, setExams] = useState<Exam[]>([]);

  // Fetch exams from API
  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        alert('Vui lòng đăng nhập lại');
        return;
      }
      
      const response = await fetch('/api/ielts?status=all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 403) {
        alert('Bạn không có quyền truy cập. Vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setExams(data.data);
      } else {
        console.error('Failed to fetch exams:', response.status);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found for stats');
        return;
      }
      
      const response = await fetch('/api/ielts/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 403) {
        console.error('Forbidden access to stats');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, []);

  const handleCreateExam = async () => {
    // Exam is already created in CreateIELTSExam component
    // Just refresh the list and go back
    await fetchExams();
    await fetchStats();
    setShowCreateForm(false);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ielts/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchExams();
        await fetchStats();
        alert('Xóa đề thi thành công!');
      } else {
        throw new Error('Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Lỗi khi xóa đề thi');
    }
  };

  const handleToggleStatus = async (examId: string, currentStatus: string) => {
    if (!examId) {
      console.error('ExamId is undefined');
      return;
    }
    
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }
      
      const response = await fetch(`/api/ielts/${examId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchExams();
        await fetchStats();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
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
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.reading}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.listening}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải danh sách đề thi...</p>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
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
                        <div className="text-sm text-gray-500">ID: {exam._id}</div>
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
                      <button 
                        onClick={() => handleToggleStatus(exam._id, exam.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          exam.status === 'published'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        } transition-colors`}
                        title={exam.status === 'published' ? 'Ẩn đề thi' : 'Xuất bản đề thi'}
                      >
                        {exam.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExam(exam._id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
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
