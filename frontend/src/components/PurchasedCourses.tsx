import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Brain,
  MessageSquare,
  GraduationCap,
  ChevronLeft
} from 'lucide-react';

interface PurchasedCourse {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  duration: string;
  lessonsCount: number;
  completedLessons: number;
  lastAccessed: string;
  progress: number;
  rating: number;
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

// Mock data for purchased courses
const mockPurchasedCourses: PurchasedCourse[] = [
  {
    id: 'purchased-vocab-a1',
    title: 'Từ vựng cơ bản hàng ngày',
    type: 'vocabulary',
    level: 'A1',
    price: 299000,
    duration: '4 tuần',
    lessonsCount: 20,
    completedLessons: 15,
    lastAccessed: '2025-09-10',
    progress: 75,
    rating: 4.8,
    studentsCount: 1250,
    description: 'Học 500+ từ vựng cơ bản thiết yếu trong cuộc sống hàng ngày',
    instructor: 'Cô Mai Anh',
    purchaseDate: '2025-08-15',
    status: 'active',
    nextLesson: {
      id: 'lesson-16',
      title: 'Từ vựng về gia đình',
      duration: '15 phút'
    }
  },
  {
    id: 'purchased-grammar-b1',
    title: 'Ngữ pháp trung cấp',
    type: 'grammar',
    level: 'B1',
    price: 449000,
    duration: '8 tuần',
    lessonsCount: 32,
    completedLessons: 32,
    lastAccessed: '2025-09-12',
    progress: 100,
    rating: 4.9,
    studentsCount: 856,
    description: 'Nắm vững ngữ pháp trung cấp với 200+ quy tắc và bài tập thực hành',
    instructor: 'Thầy John Smith',
    purchaseDate: '2025-07-20',
    status: 'completed',
    certificate: true
  },
  {
    id: 'purchased-vocab-idioms',
    title: 'Thành ngữ tiếng Anh thông dụng',
    type: 'vocabulary',
    level: 'B1',
    price: 449000,
    duration: '6 tuần',
    lessonsCount: 36,
    completedLessons: 12,
    lastAccessed: '2025-09-08',
    progress: 33,
    rating: 4.9,
    studentsCount: 834,
    description: 'Học 300+ thành ngữ tiếng Anh phổ biến với ý nghĩa, cách dùng và ví dụ thực tế',
    instructor: 'Cô Emma Wilson',
    purchaseDate: '2025-08-28',
    status: 'active',
    nextLesson: {
      id: 'lesson-13',
      title: 'Idioms về thời tiết',
      duration: '20 phút'
    }
  }
];

interface PurchasedCoursesProps {
  onBack?: () => void;
}

const PurchasedCourses: React.FC<PurchasedCoursesProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch purchased courses
    const loadPurchasedCourses = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        setCourses(mockPurchasedCourses);
        setLoading(false);
      }, 1000);
    };

    loadPurchasedCourses();
  }, []);

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'A2': 'bg-sky-100 text-sky-800 border-sky-300',
      'B1': 'bg-amber-100 text-amber-800 border-amber-300',
      'B2': 'bg-orange-100 text-orange-800 border-orange-300',
      'C1': 'bg-violet-100 text-violet-800 border-violet-300',
      'C2': 'bg-rose-100 text-rose-800 border-rose-300'
    };
    return colors[level as keyof typeof colors] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'vocabulary' ? Brain : MessageSquare;
  };

  const getTypeColor = (type: string) => {
    return type === 'vocabulary' ? 'text-emerald-700' : 'text-blue-700';
  };

  const getCourseIllustration = (course: PurchasedCourse) => {
    const baseGradients = {
      vocabulary: 'from-emerald-400 via-teal-500 to-cyan-500',
      grammar: 'from-blue-500 via-indigo-600 to-purple-600'
    };

    const levelAccents = {
      'A1': 'opacity-85',
      'A2': 'opacity-90',
      'B1': 'opacity-95',
      'B2': 'opacity-100',
      'C1': 'opacity-100',
      'C2': 'opacity-100'
    };

    return {
      gradient: baseGradients[course.type],
      opacity: levelAccents[course.level],
      icon: getTypeIcon(course.type)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-700 font-medium">Đang tải khóa học đã mua...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          {/* Back button */}
          <div className="flex items-center gap-4 mb-8">
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
      {courses.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-slate-200 max-w-md mx-auto">
            <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-6" />
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Chưa có khóa học nào
            </h3>
            <p className="text-slate-600">
              Hãy mua khóa học đầu tiên để bắt đầu hành trình học tập
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const illustration = getCourseIllustration(course);
            const IconComponent = illustration.icon;

            return (
              <div key={course.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group border border-white/20 hover:border-blue-200">
                {/* Course Thumbnail */}
                <div className={`h-52 bg-gradient-to-br ${illustration.gradient} ${illustration.opacity} flex items-center justify-center relative overflow-hidden`}>
                  <IconComponent className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>

                {/* Course Info */}
                <div className="p-7">
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

                  <p className="text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed">
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
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className="text-xs text-slate-500 mb-6 bg-slate-50 rounded-lg p-3 space-y-1">
                    <p className="font-medium">📅 Đã mua: {formatDate(course.purchaseDate)}</p>
                    <p className="font-medium">👨‍🏫 Giảng viên: {course.instructor}</p>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
