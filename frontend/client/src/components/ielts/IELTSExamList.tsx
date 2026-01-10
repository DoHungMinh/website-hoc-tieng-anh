import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Target } from 'lucide-react';
import IELTSExamCard from './IELTSExamCard';
import IELTSTestHistory from './IELTSTestHistory';
import { API_BASE_URL } from '@/utils/constants';
import SearchFilterBar from '../common/SearchFilterBar';

interface IELTSExam {
  _id: string;
  title: string;
  type: 'reading' | 'listening';
  difficulty: string;
  duration: number;
  totalQuestions: number;
  description: string;
}

interface IELTSExamListProps {
  onBack?: () => void;
}

const IELTSExamList: React.FC<IELTSExamListProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<IELTSExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter options for SearchFilterBar
  const filterOptions = [
    { id: 'reading', label: 'Reading', value: 'reading', category: 'Loại bài thi' },
    { id: 'listening', label: 'Listening', value: 'listening', category: 'Loại bài thi' },
  ];

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
    );
  };

  // Fetch published IELTS exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        console.log('Fetching IELTS exams for practice...');
        const response = await fetch(`${API_BASE_URL}/ielts?status=published&limit=20`);
        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched exams data:', data);

          if (data.success && Array.isArray(data.data)) {
            setExams(data.data);
          } else {
            console.log('No exams found or invalid data structure');
            setExams([]);
          }
        } else {
          console.error('Failed to fetch exams:', response.status);
          setExams([]);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Filter exams based on search query and active filters
  const filteredExams = exams.filter((exam) => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' ||
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.difficulty?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter (reading/listening)
    if (activeFilters.length === 0) return matchesSearch;

    const hasReadingFilter = activeFilters.includes('reading');
    const hasListeningFilter = activeFilters.includes('listening');

    // If both filters active, show all
    if (hasReadingFilter && hasListeningFilter) {
      return matchesSearch;
    }

    // Match type with filter
    const matchesTypeFilter = 
      (hasReadingFilter && exam.type === 'reading') ||
      (hasListeningFilter && exam.type === 'listening');

    return matchesSearch && matchesTypeFilter;
  });

  const handleStartExam = (examId: string, type: 'reading' | 'listening') => {
    // Store exam info for the test component
    sessionStorage.setItem('currentExam', JSON.stringify({ examId, type }));
    navigate('/practice/ielts-test/taking');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Luyện tập IELTS</h1>
                  <p className="text-gray-600">Luyện tập với các đề thi IELTS chính thức</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredExams.filter(e => e.type === 'reading').length}</p>
                <p className="text-gray-600">Đề Reading</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredExams.filter(e => e.type === 'listening').length}</p>
                <p className="text-gray-600">Đề Listening</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredExams.length}</p>
                <p className="text-gray-600">Tổng đề thi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          filterOptions={filterOptions}
          placeholder="Tìm kiếm theo tên đề thi, độ khó, mô tả..."
          colorTheme="indigo"
        />

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left column - Exam List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Danh sách đề thi</h2>
                <p className="text-gray-600">
                  Chọn đề thi để bắt đầu luyện tập. Các đề thi được sắp xếp từ mới nhất.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {filteredExams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredExams.map((exam) => (
                        <IELTSExamCard
                          key={exam._id}
                          exam={exam}
                          onStartExam={handleStartExam}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <BookOpen className="h-full w-full" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery || activeFilters.length > 0
                          ? 'Không tìm thấy đề thi phù hợp'
                          : 'Chưa có đề thi nào'}
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery || activeFilters.length > 0
                          ? 'Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc'
                          : 'Các đề thi IELTS sẽ được cập nhật sớm nhất có thể.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right column - Test History */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <IELTSTestHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSExamList;
