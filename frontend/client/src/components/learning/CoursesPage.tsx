import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Target,
  Play,
  Clock,
  Users,
  ChevronRight,
  Award,
  Brain,
  MessageSquare,
  CheckCircle,
  Home,
  GraduationCap
} from 'lucide-react';
import { courseAPI, Course as APICourse } from '@/services/courseAPI';
import PurchasedCourses from '../dashboard/PurchasedCourses';





type CourseType = 'vocabulary' | 'grammar' | 'purchased';

interface CoursesPageProps {
  selectedType?: CourseType;
  onCourseTypeSelect?: (type: CourseType) => void;
  onCourseSelect?: (courseId: string) => void;
  onBack?: () => void;
  purchasedCourseIds?: string[]; // Danh sách ID các khóa học đã mua
}

const CoursesPage: React.FC<CoursesPageProps> = ({
  selectedType,
  onCourseTypeSelect,
  onCourseSelect,
  onBack,
  purchasedCourseIds = [] // Mặc định là array rỗng
}) => {
  const [activeType, setActiveType] = useState<CourseType | null>(selectedType || null);
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      if (!activeType) return;

      setLoading(true);
      try {
        const response = await courseAPI.getPublicCourses({
          type: activeType
        });

        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [activeType]);





  // API Course Card Component
  const APICourseCard: React.FC<{ course: APICourse }> = ({ course }) => {
    const levelColors = {
      'A1': 'bg-green-100 text-green-800',
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-yellow-100 text-yellow-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-purple-100 text-purple-800',
      'C2': 'bg-red-100 text-red-800',
      'IDIOMS': 'bg-pink-100 text-pink-800'
    };

    const typeIcons = {
      'vocabulary': Brain,
      'grammar': MessageSquare
    };

    const TypeIcon = typeIcons[course.type];

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
        onClick={() => onCourseSelect?.(course._id!)}>
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <TypeIcon className="h-16 w-16 text-white/90 relative z-10" />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[course.level as keyof typeof levelColors]}`}>
                {course.level}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessonsCount} bài</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">{course.instructor}</span>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Học ngay
            </button>
          </div>
        </div>
      </div>
    );
  };



  // Special case for purchased courses
  if (activeType === 'purchased') {
    return (
      <PurchasedCourses
        onBack={() => setActiveType(null)}
        onCourseSelect={onCourseSelect || (() => { })}
      />
    );
  }

  if (activeType) {
    const title = activeType === 'vocabulary' ? 'Từ vựng thông minh' : 'Ngữ pháp tương tác';
    const icon = activeType === 'vocabulary' ? Brain : MessageSquare;
    const Icon = icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveType(null);
                  onBack?.();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600">Chọn khóa học phù hợp với trình độ của bạn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">Chưa có khóa học nào cho loại này</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses
                .filter(course => course._id && !purchasedCourseIds.includes(course._id)) // Ẩn khóa học đã mua
                .map((course) => (
                  <APICourseCard key={course._id} course={course} />
                ))}
            </div>
          )}

          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Tại sao chọn khóa học của chúng tôi?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Học có mục tiêu</h3>
                <p className="text-gray-600">Curriculum được thiết kế theo từng trình độ từ A1 đến C2</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tương tác cao</h3>
                <p className="text-gray-600">Bài tập thực hành, game và quiz giúp ghi nhớ lâu dài</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chứng chỉ uy tín</h3>
                <p className="text-gray-600">Nhận chứng chỉ hoàn thành được công nhận</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        {/* Back to Home Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => onBack?.()}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 flex items-center gap-2 group"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1">
              Trang chủ
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Chọn loại khóa học</h2>
          <p className="text-gray-600 text-lg">Phát triển từng kỹ năng một cách có hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div
            onClick={() => {
              setActiveType('vocabulary');
              onCourseTypeSelect?.('vocabulary');
            }}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors">
                  <Brain className="w-12 h-12 text-green-600" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Từ vựng thông minh
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Học từ vựng với phương pháp ghi nhớ khoa học, bao gồm cả khóa học thành ngữ đặc biệt
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Hệ thống flashcard thông minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Học theo chủ đề và tình huống</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Game và quiz tương tác</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Theo dõi tiến độ chi tiết</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">7 khóa học</span> • A1 → C2 + Idioms
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Từ 299.000đ
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveType('grammar');
              onCourseTypeSelect?.('grammar');
            }}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                  <MessageSquare className="w-12 h-12 text-blue-600" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Ngữ pháp tương tác
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Bài tập ngữ pháp đa dạng với giải thích chi tiết và ví dụ sinh động
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Lý thuyết dễ hiểu, ví dụ thực tế</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Bài tập tương tác đa dạng</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Phản hồi tức thì và chi tiết</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Đánh giá và chữa lỗi tự động</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">6 khóa học</span> • A1 → C2
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  Từ 249.000đ
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveType('purchased');
              onCourseTypeSelect?.('purchased');
            }}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                  <GraduationCap className="w-12 h-12 text-purple-600" />
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Khóa học đã mua
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Tiếp tục học với các khóa học bạn đã đăng ký, theo dõi tiến độ và nhận chứng chỉ
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Theo dõi tiến độ học tập</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Tiếp tục từ bài đã dừng</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Xem lại bài đã học</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Nhận chứng chỉ hoàn thành</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">Khóa học cá nhân</span>
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  Đã thanh toán
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">13,000+</div>
              <div className="text-gray-600">Học viên đã đăng ký</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Tỷ lệ hoàn thành</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8★</div>
              <div className="text-gray-600">Đánh giá trung bình</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Hỗ trợ học tập</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
