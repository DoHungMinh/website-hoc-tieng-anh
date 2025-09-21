import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, Target } from 'lucide-react';
import IELTSExamCard from './IELTSExamCard';
import IELTSTest from './IELTSTest';
import IELTSTestHistory from './IELTSTestHistory';

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
  const [exams, setExams] = useState<IELTSExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);

  // Fetch published IELTS exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        console.log('Fetching IELTS exams for practice...');
        const response = await fetch('/api/ielts?status=published&limit=20');
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

  const handleStartExam = (examId: string, type: 'reading' | 'listening') => {
    // Store exam info for the test component
    sessionStorage.setItem('currentExam', JSON.stringify({ examId, type }));
    setShowTest(true);
  };

  const handleBackToList = () => {
    setShowTest(false);
    sessionStorage.removeItem('currentExam');
  };

  // If showing test, render IELTSTest component
  if (showTest) {
    return <IELTSTest onBackToCenter={handleBackToList} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Quay lại
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl">
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
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exams.filter(e => e.type === 'reading').length}</p>
                <p className="text-gray-600">Đề Reading</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exams.filter(e => e.type === 'listening').length}</p>
                <p className="text-gray-600">Đề Listening</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
                <p className="text-gray-600">Tổng đề thi</p>
              </div>
            </div>
          </div>
        </div>

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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {exams.map((exam) => (
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đề thi nào</h3>
                      <p className="text-gray-500">
                        Các đề thi IELTS sẽ được cập nhật sớm nhất có thể.
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
