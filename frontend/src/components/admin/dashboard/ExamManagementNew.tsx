import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, FileText, Volume2, Clock, Users } from 'lucide-react';
import CreateIELTSExam from './CreateIELTSExam';
import EditIELTSExam from './EditIELTSExam';

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
  passages?: unknown[];
  sections?: unknown[];
  description?: string;
}

const ExamManagementComponent: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    readingExams: 0,
    listeningExams: 0,
    publishedExams: 0
  });

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
      
      const response = await fetch('http://localhost:5002/api/ielts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        alert('Bạn không có quyền truy cập');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched exams:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setExams(data.data);
        
        // Calculate stats
        const totalExams = data.data.length;
        const readingExams = data.data.filter((exam: Exam) => exam.type === 'reading').length;
        const listeningExams = data.data.filter((exam: Exam) => exam.type === 'listening').length;
        const publishedExams = data.data.filter((exam: Exam) => exam.status === 'published').length;
        
        setStats({
          totalExams,
          readingExams,
          listeningExams,
          publishedExams
        });
      } else {
        console.error('Invalid data format:', data);
        setExams([]);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Handle delete exam
  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`http://localhost:5002/api/ielts/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        alert('Bạn không có quyền xóa đề thi');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Xóa đề thi thành công!');
        fetchExams();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa đề thi');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Có lỗi xảy ra khi xóa đề thi');
    }
  };

  // Handle edit exam
  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setShowEditForm(true);
  };

  // Handle save edited exam
  const handleSaveEdit = async (updatedData: Partial<Exam>) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`http://localhost:5002/api/ielts/${editingExam?._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.status === 403) {
        alert('Bạn không có quyền chỉnh sửa đề thi');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Cập nhật đề thi thành công!');
        setShowEditForm(false);
        setEditingExam(null);
        fetchExams();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi cập nhật đề thi');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Có lỗi xảy ra khi cập nhật đề thi');
    }
  };

  // Filter exams based on search and filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exam.type === filterType;
    const matchesLevel = filterLevel === 'all' || exam.difficulty === filterLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getTypeBadge = (type: string) => {
    return type === 'reading' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  if (showCreateForm) {
    return (
      <CreateIELTSExam 
        onCancel={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchExams();
        }}
      />
    );
  }

  if (showEditForm && editingExam) {
    return (
      <EditIELTSExam 
        examData={editingExam}
        onSave={handleSaveEdit}
        onCancel={() => {
          setShowEditForm(false);
          setEditingExam(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đề thi IELTS</h1>
          <p className="text-gray-600">Tạo và quản lý các đề thi Reading và Listening</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo đề thi mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đề thi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reading</p>
              <p className="text-2xl font-bold text-gray-900">{stats.readingExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Listening</p>
              <p className="text-2xl font-bold text-gray-900">{stats.listeningExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả loại</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
          </select>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Band 4.0-5.0">Band 4.0-5.0</option>
            <option value="Band 5.0-6.0">Band 5.0-6.0</option>
            <option value="Band 6.0-7.0">Band 6.0-7.0</option>
            <option value="Band 7.0-8.0">Band 7.0-8.0</option>
            <option value="Band 8.0-9.0">Band 8.0-9.0</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách đề thi ({filteredExams.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {exams.length === 0 ? 'Chưa có đề thi nào' : 'Không tìm thấy đề thi phù hợp'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đề thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Câu hỏi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </div>
                        {exam.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {exam.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(exam.type)}`}>
                        {exam.type === 'reading' ? (
                          <>
                            <FileText className="w-3 h-3 mr-1" />
                            Reading
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 mr-1" />
                            Listening
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.difficulty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {exam.duration} phút
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.totalQuestions || 0} câu
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(exam.status)}`}>
                        {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exam.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagementComponent;
