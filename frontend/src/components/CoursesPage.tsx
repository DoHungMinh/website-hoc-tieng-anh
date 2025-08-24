import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronRight,
  Award,
  Brain,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Globe,
  PenTool,
  FileText,
  Briefcase,
  GraduationCap,
  Zap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  originalPrice?: number;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  thumbnail: string;
}

const vocabularyCourses: Course[] = [
  {
    id: 'vocab-a1',
    title: 'Từ vựng cơ bản hàng ngày',
    level: 'A1',
    price: 299000,
    originalPrice: 399000,
    duration: '4 tuần',
    lessonsCount: 20,
    studentsCount: 1250,
    rating: 4.8,
    description: 'Học 500+ từ vựng thiết yếu cho cuộc sống hàng ngày với phương pháp ghi nhớ thông minh',
    features: ['Học từ theo chủ đề', 'Flashcard thông minh', 'Game ôn tập', 'Phát âm chuẩn'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-a2',
    title: 'Từ vựng giao tiếp cơ bản',
    level: 'A2',
    price: 399000,
    originalPrice: 499000,
    duration: '6 tuần',
    lessonsCount: 30,
    studentsCount: 980,
    rating: 4.7,
    description: 'Mở rộng vốn từ vựng với 800+ từ mới cho giao tiếp và công việc cơ bản',
    features: ['Từ vựng theo tình huống', 'Thực hành hội thoại', 'Quiz tương tác', 'Theo dõi tiến độ'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-b1',
    title: 'Từ vựng trung cấp',
    level: 'B1',
    price: 599000,
    originalPrice: 799000,
    duration: '8 tuần',
    lessonsCount: 40,
    studentsCount: 756,
    rating: 4.9,
    description: 'Nâng cao vốn từ với 1200+ từ vựng chuyên sâu cho công việc và học tập',
    features: ['Từ vựng chuyên ngành', 'Collocations', 'Idioms phổ biến', 'Writing exercises'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-b2',
    title: 'Từ vựng nâng cao',
    level: 'B2',
    price: 799000,
    originalPrice: 999000,
    duration: '10 tuần',
    lessonsCount: 50,
    studentsCount: 523,
    rating: 4.8,
    description: 'Làm chủ 1500+ từ vựng phức tạp cho IELTS, công việc và học thuật',
    features: ['Academic vocabulary', 'Business English', 'Advanced collocations', 'Critical thinking'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-c1',
    title: 'Từ vựng chuyên gia',
    level: 'C1',
    price: 999000,
    originalPrice: 1299000,
    duration: '12 tuần',
    lessonsCount: 60,
    studentsCount: 342,
    rating: 4.9,
    description: 'Thành thạo 2000+ từ vựng chuyên nghiệp và học thuật cao cấp',
    features: ['Research vocabulary', 'Professional terms', 'Nuanced expressions', 'Advanced writing'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-c2',
    title: 'Từ vựng bậc thầy',
    level: 'C2',
    price: 1299000,
    originalPrice: 1599000,
    duration: '16 tuần',
    lessonsCount: 80,
    studentsCount: 189,
    rating: 5.0,
    description: 'Đạt trình độ native với 3000+ từ vựng tinh tế và sophisticated expressions',
    features: ['Literary vocabulary', 'Sophisticated expressions', 'Cultural nuances', 'Masterclass content'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'vocab-idioms',
    title: 'Thành ngữ tiếng Anh thông dụng',
    level: 'B1',
    price: 449000,
    originalPrice: 599000,
    duration: '6 tuần',
    lessonsCount: 36,
    studentsCount: 834,
    rating: 4.9,
    description: 'Học 300+ thành ngữ tiếng Anh phổ biến với ý nghĩa, cách dùng và ví dụ thực tế',
    features: ['300+ idioms phổ biến', 'Ví dụ trong ngữ cảnh', 'Audio pronunciation', 'Practice exercises'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200'
  }
];

const grammarCourses: Course[] = [
  {
    id: 'grammar-a1',
    title: 'Ngữ pháp cơ bản',
    level: 'A1',
    price: 249000,
    originalPrice: 349000,
    duration: '3 tuần',
    lessonsCount: 15,
    studentsCount: 1543,
    rating: 4.7,
    description: 'Nắm vững các cấu trúc ngữ pháp cơ bản nhất với bài tập tương tác',
    features: ['Present tenses', 'Basic sentence structure', 'Interactive exercises', 'Instant feedback'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'grammar-a2',
    title: 'Ngữ pháp thiết yếu',
    level: 'A2',
    price: 349000,
    originalPrice: 449000,
    duration: '5 tuần',
    lessonsCount: 25,
    studentsCount: 1234,
    rating: 4.8,
    description: 'Mở rộng kiến thức ngữ pháp với các thì và cấu trúc phức tạp hơn',
    features: ['Past & Future tenses', 'Conditional sentences', 'Modal verbs', 'Error correction'],
    isPopular: true,
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'grammar-b1',
    title: 'Ngữ pháp trung cấp',
    level: 'B1',
    price: 549000,
    originalPrice: 699000,
    duration: '7 tuần',
    lessonsCount: 35,
    studentsCount: 892,
    rating: 4.9,
    description: 'Thành thạo các cấu trúc ngữ pháp phức tạp cho giao tiếp và viết',
    features: ['Complex sentences', 'Passive voice', 'Reported speech', 'Advanced conditionals'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'grammar-b2',
    title: 'Ngữ pháp nâng cao',
    level: 'B2',
    price: 749000,
    originalPrice: 949000,
    duration: '9 tuần',
    lessonsCount: 45,
    studentsCount: 567,
    rating: 4.8,
    description: 'Hoàn thiện ngữ pháp với các cấu trúc sophisticated cho IELTS và công việc',
    features: ['Subjunctive mood', 'Complex conditionals', 'Advanced linking', 'Style variation'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'grammar-c1',
    title: 'Ngữ pháp chuyên gia',
    level: 'C1',
    price: 949000,
    originalPrice: 1199000,
    duration: '11 tuần',
    lessonsCount: 55,
    studentsCount: 298,
    rating: 4.9,
    description: 'Làm chủ hoàn toàn ngữ pháp tiếng Anh ở trình độ chuyên nghiệp',
    features: ['Formal register', 'Academic writing', 'Stylistic devices', 'Error analysis'],
    thumbnail: '/api/placeholder/300/200'
  },
  {
    id: 'grammar-c2',
    title: 'Ngữ pháp bậc thầy',
    level: 'C2',
    price: 1199000,
    originalPrice: 1499000,
    duration: '15 tuần',
    lessonsCount: 75,
    studentsCount: 156,
    rating: 5.0,
    description: 'Đạt trình độ native với các cấu trúc ngữ pháp tinh tế nhất',
    features: ['Nuanced structures', 'Literary devices', 'Regional variations', 'Expert analysis'],
    thumbnail: '/api/placeholder/300/200'
  }
];

type CourseType = 'vocabulary' | 'grammar';

interface CoursesPageProps {
  selectedType?: CourseType;
  onCourseTypeSelect?: (type: CourseType) => void;
  onCourseSelect?: (courseId: string) => void;
  onBack?: () => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ 
  selectedType, 
  onCourseTypeSelect, 
  onCourseSelect,
  onBack 
}) => {
  const [activeType, setActiveType] = useState<CourseType | null>(selectedType || null);

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800 border-green-200',
      'A2': 'bg-blue-100 text-blue-800 border-blue-200',
      'B1': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'B2': 'bg-orange-100 text-orange-800 border-orange-200',
      'C1': 'bg-purple-100 text-purple-800 border-purple-200',
      'C2': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCourseIllustration = (courseId: string) => {
    const illustrations = {
      'vocab-a1': {
        bgGradient: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500',
        icon: BookOpen,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 text-white text-lg font-bold">ABC</div>
            <div className="absolute bottom-4 right-4 text-white text-2xl">📚</div>
            <div className="absolute top-8 right-8 text-white text-sm">Basic</div>
          </div>
        )
      },
      'vocab-a2': {
        bgGradient: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-sky-500',
        icon: MessageSquare,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-white text-sm bg-white/20 rounded px-2 py-1">Hello!</div>
            <div className="absolute bottom-2 right-2 text-white text-2xl">💬</div>
            <div className="absolute top-8 right-4 text-white text-xs">Chat</div>
          </div>
        )
      },
      'vocab-b1': {
        bgGradient: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-500',
        icon: Briefcase,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 text-white text-2xl">💼</div>
            <div className="absolute bottom-4 left-4 text-white text-sm bg-white/20 rounded px-2 py-1">Work</div>
            <div className="absolute top-2 left-8 text-white text-xs">Business</div>
          </div>
        )
      },
      'vocab-b2': {
        bgGradient: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500',
        icon: GraduationCap,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 text-white text-2xl">🎓</div>
            <div className="absolute bottom-4 left-2 text-white text-sm bg-white/20 rounded px-2 py-1">Academic</div>
            <div className="absolute top-8 left-8 text-white text-xs">IELTS</div>
          </div>
        )
      },
      'vocab-c1': {
        bgGradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500',
        icon: Target,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 text-white text-2xl">🏢</div>
            <div className="absolute bottom-2 right-4 text-white text-sm bg-white/20 rounded px-2 py-1">Pro</div>
            <div className="absolute top-2 right-8 text-white text-xs">Expert</div>
          </div>
        )
      },
      'vocab-c2': {
        bgGradient: 'bg-gradient-to-br from-red-400 via-rose-500 to-red-600',
        icon: Award,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-white text-2xl">👑</div>
            <div className="absolute bottom-4 right-2 text-white text-sm bg-white/20 rounded px-2 py-1">Master</div>
            <div className="absolute top-8 right-2 text-white text-xs">Native</div>
          </div>
        )
      },
      'vocab-idioms': {
        bgGradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500',
        icon: Lightbulb,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-white text-2xl">💡</div>
            <div className="absolute bottom-4 right-2 text-white text-sm bg-white/20 rounded px-2 py-1">Idioms</div>
            <div className="absolute top-8 right-4 text-white text-xs">✨</div>
            <div className="absolute bottom-2 left-8 text-white text-xs">Special</div>
          </div>
        )
      },
      'grammar-a1': {
        bgGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
        icon: PenTool,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 text-white text-2xl">✓</div>
            <div className="absolute bottom-4 left-4 text-white text-sm bg-white/20 rounded px-2 py-1">Grammar</div>
            <div className="absolute top-2 left-2 text-white text-xs">Basic</div>
          </div>
        )
      },
      'grammar-a2': {
        bgGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
        icon: FileText,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-white text-2xl">📝</div>
            <div className="absolute bottom-2 right-2 text-white text-sm bg-white/20 rounded px-2 py-1">Rules</div>
            <div className="absolute top-8 right-8 text-white text-xs">Essential</div>
          </div>
        )
      },
      'grammar-b1': {
        bgGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
        icon: Zap,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 text-white text-2xl">⚡</div>
            <div className="absolute bottom-4 right-4 text-white text-sm bg-white/20 rounded px-2 py-1">Complex</div>
            <div className="absolute top-2 right-2 text-white text-xs">Intermediate</div>
          </div>
        )
      },
      'grammar-b2': {
        bgGradient: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600',
        icon: Target,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 text-white text-2xl">🎯</div>
            <div className="absolute bottom-4 left-2 text-white text-sm bg-white/20 rounded px-2 py-1">Advanced</div>
            <div className="absolute top-8 left-8 text-white text-xs">Sophisticated</div>
          </div>
        )
      },
      'grammar-c1': {
        bgGradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
        icon: Globe,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 text-white text-2xl">🌍</div>
            <div className="absolute bottom-2 left-4 text-white text-sm bg-white/20 rounded px-2 py-1">Expert</div>
            <div className="absolute top-2 left-2 text-white text-xs">Professional</div>
          </div>
        )
      },
      'grammar-c2': {
        bgGradient: 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600',
        icon: Award,
        pattern: (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-white text-2xl">🏆</div>
            <div className="absolute bottom-4 right-2 text-white text-sm bg-white/20 rounded px-2 py-1">Master</div>
            <div className="absolute top-8 right-4 text-white text-xs">Perfection</div>
          </div>
        )
      }
    };

    return illustrations[courseId as keyof typeof illustrations] || {
      bgGradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
      icon: BookOpen,
      pattern: null
    };
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const illustration = getCourseIllustration(course.id);
    const IconComponent = illustration.icon;

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {course.isPopular && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold px-4 py-1 text-center">
            🔥 Phổ biến nhất
          </div>
        )}
        
        {course.id === 'vocab-idioms' && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-4 py-1 text-center">
            ✨ Khóa học đặc biệt - Thành ngữ
          </div>
        )}
        
        <div className="relative">
          <div className={`h-48 ${illustration.bgGradient} flex items-center justify-center relative overflow-hidden`}>
            {illustration.pattern}
            <div className="relative z-10">
              <IconComponent className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${course.id === 'vocab-idioms' ? 'bg-purple-100 text-purple-800 border-purple-200' : getLevelColor(course.level)}`}>
              {course.id === 'vocab-idioms' ? 'IDIOMS' : course.level}
            </span>
          </div>
          <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-xs font-semibold text-gray-700 ml-1">{course.rating}</span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessonsCount} bài</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.studentsCount}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {course.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(course.price)}
              </span>
              {course.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(course.originalPrice)}
                </span>
              )}
            </div>
            {course.originalPrice && (
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                -{Math.round((1 - course.price / course.originalPrice) * 100)}%
              </span>
            )}
          </div>

          <button 
            onClick={() => onCourseSelect?.(course.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Đăng ký ngay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  if (activeType) {
    const courses = activeType === 'vocabulary' ? vocabularyCourses : grammarCourses;
    const title = activeType === 'vocabulary' ? 'Từ vựng thông minh' : 'Ngữ pháp tương tác';
    const icon = activeType === 'vocabulary' ? Brain : MessageSquare;
    const Icon = icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onBack?.()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Khóa học tiếng Anh
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Nâng cao kỹ năng tiếng Anh với các khóa học chuyên sâu từ cơ bản đến nâng cao
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Học theo trình độ</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Tương tác cao</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Giá cả hợp lý</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Chọn loại khóa học</h2>
          <p className="text-gray-600 text-lg">Phát triển từng kỹ năng một cách có hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
