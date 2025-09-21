import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Brain,
  GraduationCap,
  ChevronLeft
} from 'lucide-react';
import { useEnrollment } from '../hooks/useEnrollment';

interface PurchasedCourse {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price?: number;
  duration: string;
  lessonsCount: number;
  completedLessons: number;
  lastAccessed: string;
  progress: number;
  rating?: number;
  studentsCount: number;
  description: string;
  instructor: string;
  purchaseDate: string;
  status: 'active' | 'completed' | 'paused';
  certificate?: boolean;
  nextLesson?: {
    id: string;
    title: string;
    duration: string;
  };
}

interface PurchasedCoursesProps {
  onBack: () => void;
  onCourseSelect: (courseId: string) => void;
}

const PurchasedCourses: React.FC<PurchasedCoursesProps> = ({ onBack, onCourseSelect }) => {
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const { enrollments, loading, error } = useEnrollment();

  // Convert enrollments to PurchasedCourse format
  useEffect(() => {
    console.log('🔍 Raw enrollments data:', enrollments);
    
    if (loading) {
      console.log('⏳ Still loading...');
      return;
    }

    if (error) {
      console.error('❌ Error loading enrollments:', error);
      setCourses([]);
      return;
    }
    
    if (!enrollments || enrollments.length === 0) {
      console.log('📝 No enrollments data');
      setCourses([]);
      return;
    }

    // Filter out enrollments with missing or null courseId
    const validEnrollments = enrollments.filter(enrollment => {
      const isValid = enrollment.courseId && 
        enrollment.courseId._id && 
        enrollment.courseId.title &&
        enrollment.courseId.type;
      
      if (!isValid) {
        console.warn('⚠️ Invalid enrollment found:', enrollment);
      }
      
      return isValid;
    });

    console.log('✅ Valid enrollments:', validEnrollments);

    if (validEnrollments.length > 0) {
      const purchasedCourses = validEnrollments.map(enrollment => ({
        id: enrollment.courseId._id,
        title: enrollment.courseId.title,
        type: enrollment.courseId.type,
        level: enrollment.courseId.level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
        duration: enrollment.courseId.duration || 'N/A',
        lessonsCount: enrollment.courseId.lessonsCount || 0,
        completedLessons: enrollment.progress?.completedLessons?.length || 0,
        lastAccessed: enrollment.progress?.lastAccessedAt || enrollment.enrolledAt,
        progress: enrollment.progress?.completionPercentage || 0,
        studentsCount: enrollment.courseId.studentsCount || 0,
        description: enrollment.courseId.description || '',
        instructor: enrollment.courseId.instructor || 'Chưa cập nhật',
        purchaseDate: enrollment.enrolledAt,
        status: enrollment.status,
        rating: 4.8, // Default rating since it's not in enrollment data
        certificate: enrollment.status === 'completed'
      }));
      
      console.log('🎯 Final purchased courses:', purchasedCourses);
      setCourses(purchasedCourses);
    } else {
      console.log('📝 No valid enrollments found');
      setCourses([]);
    }
  }, [enrollments, loading, error]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'A2': 'bg-sky-100 text-sky-800 border-sky-300',
      'B1': 'bg-amber-100 text-amber-800 border-amber-300',
      'B2': 'bg-orange-100 text-orange-800 border-orange-300',
      'C1': 'bg-violet-100 text-violet-800 border-violet-300',
      'C2': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeColor = (type: string) => {
    return type === 'vocabulary' 
      ? 'text-blue-600' 
      : 'text-green-600';
  };

  const getCourseIllustration = (course: PurchasedCourse) => {
    if (course.type === 'vocabulary') {
      return {
        icon: BookOpen,
        gradient: 'from-blue-500 to-blue-700',
        opacity: 'bg-opacity-90'
      };
    } else {
      return {
        icon: Brain,
        gradient: 'from-green-500 to-green-700',
        opacity: 'bg-opacity-90'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải khóa học đã mua...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-8">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại</span>
              </button>
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Không thể tải dữ liệu khóa học</h3>
              <p className="text-sm mb-4">{error}</p>
              <p className="text-xs text-red-500">
                Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>
          
          {/* Title section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Khóa học đã mua
                </h1>
                <p className="text-slate-600 text-lg mt-2">Tiếp tục hành trình học tập của bạn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-slate-200 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Đang tải khóa học...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-slate-200 max-w-md mx-auto">
              <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-6" />
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Chưa có khóa học nào
              </h3>
              <p className="text-slate-600 mb-4">
                Hãy mua khóa học đầu tiên để bắt đầu hành trình học tập
              </p>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Khám phá khóa học
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const illustration = getCourseIllustration(course);
              const IconComponent = illustration.icon;

              return (
                <div key={course.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group border border-white/20 hover:border-blue-200 flex flex-col h-full">
                  {/* Course Thumbnail */}
                  <div className={`h-52 bg-gradient-to-br ${illustration.gradient} ${illustration.opacity} flex items-center justify-center relative overflow-hidden`}>
                    <IconComponent className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                  </div>

                  {/* Course Info */}
                  <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className={`text-xs font-semibold ${getTypeColor(course.type)} bg-slate-50 px-3 py-1.5 rounded-full`}>
                        {course.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                      {course.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-5 leading-relaxed h-10 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {course.description}
                    </p>

                    {/* Basic Course Stats */}
                    <div className="flex items-center gap-5 text-sm text-slate-500 mb-5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{course.lessonsCount} bài</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      {course.rating && (
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Info */}
                    <div className="text-xs text-slate-500 mb-6 bg-slate-50 rounded-lg p-3 space-y-1">
                      <p className="font-medium">📅 Đã mua: {formatDate(course.purchaseDate)}</p>
                      <p className="font-medium">👨‍🏫 Giảng viên: {course.instructor}</p>
                      <p className="font-medium">📊 Tiến độ: {course.progress}%</p>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => onCourseSelect(course.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-auto"
                    >
                      <Play className="h-5 w-5" />
                      Bắt đầu học
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedCourses;
