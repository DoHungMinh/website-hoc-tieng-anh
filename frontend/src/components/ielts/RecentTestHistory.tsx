import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Target, 
  Calendar,
  BarChart3,
  ArrowRight,
  BookOpen,
  Headphones
} from 'lucide-react';

interface TestResult {
  _id: string;
  examTitle: string;
  examType: 'reading' | 'listening';
  score: {
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    bandScore?: number;
    description?: string;
  };
  timeSpent?: number;
  completedAt: string;
}

interface RecentTestHistoryProps {
  onViewAll?: () => void;
  onViewDetail?: (resultId: string) => void;
}

const RecentTestHistory = ({ onViewAll, onViewDetail }: RecentTestHistoryProps) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentTests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem lịch sử làm bài');
        return;
      }

      const response = await fetch(`/api/ielts/results/history?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.message || 'Không thể tải lịch sử làm bài');
        }
      } else if (response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      } else {
        setError('Có lỗi xảy ra khi tải lịch sử làm bài');
      }
    } catch (err) {
      console.error('Error fetching recent test history:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentTests();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBandScoreColor = (bandScore?: number) => {
    if (!bandScore) return 'text-gray-600';
    if (bandScore >= 8.5) return 'text-green-600';
    if (bandScore >= 7.0) return 'text-blue-600';
    if (bandScore >= 6.0) return 'text-yellow-600';
    if (bandScore >= 5.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (percentage >= 60) return <Target className="h-4 w-4 text-blue-500" />;
    return <Target className="h-4 w-4 text-orange-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Lịch sử gần đây
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Lịch sử gần đây
        </h3>
        <div className="text-center py-6">
          <p className="text-gray-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchRecentTests}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Lịch sử gần đây
        </h3>
        <div className="text-center py-6">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Chưa có lịch sử làm bài nào</p>
          <p className="text-gray-500 text-xs mt-1">Hãy làm bài thi đầu tiên!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Lịch sử gần đây
        </h3>
        {results.length >= 5 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 group"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result._id}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-green-300"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {result.examType === 'reading' ? (
                    <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Headphones className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {result.examTitle}
                  </h4>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(result.completedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(result.score.percentage)}
                    <span className="font-medium">
                      {result.score.correctAnswers}/{result.score.totalQuestions}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-lg font-bold text-gray-900">
                  {result.score.percentage}%
                </div>
                {result.score.bandScore && (
                  <div className={`text-xs font-medium ${getBandScoreColor(result.score.bandScore)}`}>
                    Band {result.score.bandScore}
                  </div>
                )}
              </div>
            </div>

            {onViewDetail && (
              <button
                onClick={() => onViewDetail(result._id)}
                className="w-full text-center text-green-600 hover:text-green-700 text-xs font-medium py-1 hover:bg-green-50 rounded transition-colors"
              >
                Xem chi tiết
              </button>
            )}
          </div>
        ))}
      </div>

      {results.length < 5 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Làm thêm bài test để có thể thống kê chi tiết hơn
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentTestHistory;
