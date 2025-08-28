import React, { useState, useEffect } from 'react';
import { useEnrollment } from '../hooks/useEnrollment';
import { useProgress } from '../hooks/useProgress';
import { Book, Headphones, FileText, Award, RefreshCw, Clock, Target, Play, CheckCircle, TrendingUp } from 'lucide-react';

const CourseBasedProgressTracker: React.FC = () => {
  const { 
    enrollments, 
    stats, 
    loading: enrollmentLoading, 
    error: enrollmentError,
    updateLessonProgress 
  } = useEnrollment();
  
  const { 
    progress, 
    loading: progressLoading, 
    error: progressError, 
    fetchProgress 
  } = useProgress();

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleLessonComplete = async (courseId: string, lessonId: string, lessonType: 'vocabulary' | 'grammar' | 'lesson') => {
    try {
      setSubmitting(true);
      const result = await updateLessonProgress(courseId, lessonId, lessonType);
      
      if (result.success) {
        alert(`✅ Hoàn thành ${lessonType}! Tiến độ: ${result.enrollment.completionPercentage}%`);
        // Refresh progress data
        await fetchProgress();
      }
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (enrollmentLoading || progressLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg">Đang tải dữ liệu học tập...</span>
        </div>
      </div>
    );
  }

  if (enrollmentError || progressError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">❌ {enrollmentError || progressError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Book className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa đăng ký khóa học nào</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Hãy đăng ký một khóa học để bắt đầu theo dõi tiến độ học tập của bạn!
          </p>
          <button
            onClick={() => window.location.href = '#courses'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Xem khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Tiến Độ Học Tập</h1>
        <p className="text-gray-600">Theo dõi tiến độ từ các khóa học đã đăng ký</p>
      </div>

      {/* Overall Progress Stats */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Từ vựng</p>
                <p className="text-2xl font-bold text-blue-900">{progress.vocabulary.learned}</p>
              </div>
              <Book className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Thời gian (giờ)</p>
                <p className="text-2xl font-bold text-green-900">{progress.listening.hoursCompleted.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Khóa học</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.totalCourses || 0}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Streak</p>
                <p className="text-2xl font-bold text-yellow-900">{progress.studyStreak.current}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Course Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
          Tiến Độ Khóa Học
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{enrollment.courseId.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{enrollment.courseId.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {enrollment.courseId.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}
                    </span>
                    <span>{enrollment.courseId.level}</span>
                    <span>{enrollment.courseId.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {enrollment.progress.completionPercentage}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {enrollment.status === 'completed' ? 'Hoàn thành' :
                     enrollment.status === 'active' ? 'Đang học' : 'Tạm dừng'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${enrollment.progress.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Details */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {enrollment.progress.completedVocabulary.length}
                  </div>
                  <div className="text-gray-600">Từ vựng</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {enrollment.progress.completedGrammar.length}
                  </div>
                  <div className="text-gray-600">Ngữ pháp</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {enrollment.progress.completedLessons.length}
                  </div>
                  <div className="text-gray-600">Bài học</div>
                </div>
              </div>

              {/* Action Buttons */}
              {enrollment.status === 'active' && (
                <div className="space-y-2">
                  {enrollment.courseId.type === 'vocabulary' && (
                    <button
                      onClick={() => handleLessonComplete(enrollment.courseId._id, `vocab_${Date.now()}`, 'vocabulary')}
                      disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Book className="h-4 w-4" />
                      {submitting ? 'Đang cập nhật...' : 'Hoàn thành từ vựng'}
                    </button>
                  )}
                  
                  {enrollment.courseId.type === 'grammar' && (
                    <button
                      onClick={() => handleLessonComplete(enrollment.courseId._id, `grammar_${Date.now()}`, 'grammar')}
                      disabled={submitting}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4" />
                      {submitting ? 'Đang cập nhật...' : 'Hoàn thành ngữ pháp'}
                    </button>
                  )}

                  <button
                    onClick={() => handleLessonComplete(enrollment.courseId._id, `lesson_${Date.now()}`, 'lesson')}
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    {submitting ? 'Đang cập nhật...' : 'Hoàn thành bài học'}
                  </button>
                </div>
              )}

              {enrollment.status === 'completed' && (
                <div className="text-center py-2">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">Khóa học đã hoàn thành!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {progress && progress.achievements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 text-yellow-600 mr-2" />
            Thành tích gần đây
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.achievements.slice(-6).map((achievement: any) => (
              <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBasedProgressTracker;
