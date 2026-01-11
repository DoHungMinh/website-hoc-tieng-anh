import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Target,
  Calendar,
  TrendingUp,
  Eye,
  BarChart3,
  Award
} from 'lucide-react';
import { API_BASE_URL } from '@/utils/constants';

interface TestResult {
  _id: string;
  examTitle: string;
  examType: 'reading' | 'listening';
  score: {
    correctAnswers: number;
    totalQuestions: number;
    bandScore?: number;
    description?: string;
  };
  timeSpent?: number;
  completedAt: string;
}

interface IELTSTestHistoryProps {
  onViewDetail?: (resultId: string) => void;
}

const IELTSTestHistory = ({ onViewDetail }: IELTSTestHistoryProps) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTestHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem lịch sử làm bài');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/ielts/results/history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        } else {
          setError(data.message || 'Không thể tải lịch sử làm bài');
        }
      } else if (response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      } else {
        setError('Có lỗi xảy ra khi tải lịch sử làm bài');
      }
    } catch (err) {
      console.error('Error fetching test history:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestHistory(1);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBandScoreColor = (bandScore?: number) => {
    if (!bandScore) return 'text-gray-600';
    if (bandScore >= 8.5) return 'text-green-600';
    if (bandScore >= 7.0) return 'text-blue-600';
    if (bandScore >= 6.0) return 'text-yellow-600';
    if (bandScore >= 5.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (bandScore?: number) => {
    if (!bandScore) return <Target className="h-5 w-5 text-gray-500" />;
    if (bandScore >= 8.0) return <Award className="h-5 w-5 text-gold-500" />;
    if (bandScore >= 6.0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <Target className="h-5 w-5 text-orange-500" />;
  };

  const calculateStats = () => {
    if (results.length === 0) return null;

    const totalTests = results.length;
    const avgBandScore = results
      .filter(r => r.score.bandScore)
      .reduce((sum, result) => sum + (result.score.bandScore || 0), 0) /
      results.filter(r => r.score.bandScore).length;

    const readingTests = results.filter(r => r.examType === 'reading').length;
    const listeningTests = results.filter(r => r.examType === 'listening').length;

    return {
      totalTests,
      avgBandScore: avgBandScore ? Math.round(avgBandScore * 10) / 10 : null,
      readingTests,
      listeningTests
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Đang tải lịch sử làm bài...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải lịch sử</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchTestHistory(currentPage)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch sử làm bài</h3>
          <p className="text-gray-600">Hãy làm bài thi đầu tiên để xem kết quả tại đây.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-green-600" />
          Lịch sử làm bài
        </h2>
        {stats && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {stats.totalTests} bài thi
            </span>
            {stats.avgBandScore && (
              <span className="text-green-600 font-semibold">
                Điểm TB: Band {stats.avgBandScore}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTests}</div>
            <div className="text-sm text-blue-700">Tổng bài thi</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.avgBandScore ? `Band ${stats.avgBandScore}` : 'N/A'}
            </div>
            <div className="text-sm text-green-700">Điểm trung bình</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.readingTests}</div>
            <div className="text-sm text-purple-700">Reading</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.listeningTests}</div>
            <div className="text-sm text-orange-700">Listening</div>
          </div>
        </div>
      )}

      {/* Test Results List */}
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result._id}
            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-green-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {result.examTitle}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${result.examType === 'reading'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                    {result.examType === 'reading' ? 'Reading' : 'Listening'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatDate(result.completedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getScoreIcon(result.score.bandScore)}
                    <span className="font-medium">
                      {result.score.correctAnswers}/{result.score.totalQuestions}
                    </span>
                  </div>

                  {result.score.bandScore && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className={`font-medium ${getBandScoreColor(result.score.bandScore)}`}>
                        Band {result.score.bandScore}
                      </span>
                    </div>
                  )}

                  {result.timeSpent && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{formatDuration(result.timeSpent)}</span>
                    </div>
                  )}
                </div>

                {result.score.description && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">
                      Đánh giá: <span className="font-medium text-gray-900">{result.score.description}</span>
                    </span>
                  </div>
                )}
              </div>

              {onViewDetail && (
                <button
                  onClick={() => onViewDetail(result._id)}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTestHistory(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => fetchTestHistory(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IELTSTestHistory;
