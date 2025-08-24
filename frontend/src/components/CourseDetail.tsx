import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  Star, 
  CheckCircle,
  Download,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CreditCard,
  Shield,
  Smartphone,
  Globe
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
  curriculum: {
    module: string;
    lessons: string[];
  }[];
  instructor: {
    name: string;
    title: string;
    experience: string;
    avatar: string;
  };
  whatYouLearn: string[];
  requirements: string[];
  isPopular?: boolean;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll: (courseId: string) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEnroll }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

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

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Payment Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Thanh toán khóa học</h1>
                  <p className="text-blue-100">{course.title}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin đơn hàng</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <span className="text-sm text-gray-500">{course.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Giá gốc:</span>
                        <span className="line-through text-gray-500">
                          {course.originalPrice && formatPrice(course.originalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Giảm giá:</span>
                        <span className="text-green-600 font-semibold">
                          -{formatPrice((course.originalPrice || course.price) - course.price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Tổng thanh toán:</span>
                        <span className="text-blue-600">{formatPrice(course.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Thanh toán an toàn được mã hóa 256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-green-600">
                      <Smartphone className="w-4 h-4" />
                      <span>Truy cập trọn đời trên mọi thiết bị</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-green-600">
                      <Award className="w-4 h-4" />
                      <span>Chứng chỉ hoàn thành được công nhận</span>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" className="text-blue-600" defaultChecked />
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Thẻ tín dụng/ghi nợ</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" className="text-blue-600" />
                        <div className="w-5 h-5 bg-red-500 rounded"></div>
                        <span className="font-semibold">Ví MoMo</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" className="text-blue-600" />
                        <div className="w-5 h-5 bg-blue-600 rounded"></div>
                        <span className="font-semibold">ZaloPay</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số thẻ
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày hết hạn
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên chủ thẻ
                      </label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => onEnroll(course.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Hoàn tất thanh toán</span>
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Bằng cách nhấn "Hoàn tất thanh toán", bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                {course.isPopular && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    🔥 Phổ biến
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-500">({course.studentsCount} học viên)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>{course.lessonsCount} bài học</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn sẽ học được gì</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
              <div className="space-y-3">
                {course.curriculum.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-600">
                          Module {index + 1}
                        </span>
                        <span className="font-semibold text-gray-900">{module.module}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {module.lessons.length} bài học
                        </span>
                        {expandedModule === index ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    
                    {expandedModule === index && (
                      <div className="px-4 pb-3 border-t">
                        <div className="space-y-2 mt-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center gap-3 py-2">
                              <Play className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu</h2>
              <div className="space-y-3">
                {course.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giảng viên</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {course.instructor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.instructor.name}</h3>
                  <p className="text-blue-600 font-medium">{course.instructor.title}</p>
                  <p className="text-gray-600 text-sm">{course.instructor.experience}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Course Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Play className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Xem trước khóa học</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(course.price)}
                    </span>
                    {course.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  {course.originalPrice && (
                    <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      Tiết kiệm {Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 mb-4"
                >
                  Đăng ký ngay
                </button>

                <div className="text-center text-sm text-gray-600 mb-6">
                  Đảm bảo hoàn tiền trong 30 ngày
                </div>

                {/* Course Includes */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Khóa học bao gồm:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Play className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{course.lessonsCount} video bài giảng</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Tài liệu tải về</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Học trên mọi thiết bị</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Chứng chỉ hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
