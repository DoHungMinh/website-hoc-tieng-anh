import React, { useState, useEffect } from 'react';
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
import { useEnrollment } from '../hooks/useEnrollment';
import { STORAGE_KEYS } from '../utils/constants';

interface DetailCourse {
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
  vocabulary?: Array<{
    id: string;
    word: string;
    pronunciation?: string;
    meaning: string;
    example?: string;
  }>;
  grammar?: Array<{
    id: string;
    rule: string;
    structure?: string;
    explanation: string;
    example: string;
  }>;
}

interface CourseDetailProps {
  course: DetailCourse;
  onBack: () => void;
  onEnroll: (courseId: string) => void;
  isPurchased?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEnroll, isPurchased: externalIsPurchased }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPurchased, setIsPurchased] = useState(externalIsPurchased || false); // Use external purchased status
  const [enrolling, setEnrolling] = useState(false);
  
  // PayOS states
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  
  const { enrollInCourse, enrollments } = useEnrollment();

  // Check if user is already enrolled
  const isEnrolled = enrollments?.some(enrollment => enrollment.courseId._id === course.id) || false;

  // Update internal state when external prop changes
  useEffect(() => {
    setIsPurchased(externalIsPurchased || false);
  }, [externalIsPurchased]);

  const handleEnrollClick = async () => {
    if (isEnrolled) {
      return;
    }

    try {
      setEnrolling(true);
      const result = await enrollInCourse(course.id);
      
      if (result.success) {
        alert('✅ Đăng ký khóa học thành công!');
        // Call the original onEnroll callback if provided
        onEnroll?.(course.id);
      }
    } catch (error: any) {
      alert(`❌ Lỗi đăng ký: ${error.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  // Create PayOS payment
  const createPayOSPayment = async () => {
    if (isEnrolled) return;

    try {
      setEnrolling(true);
      
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        alert('Vui lòng đăng nhập để thanh toán');
        return;
      }

      console.log('Creating PayOS payment for course:', course.id);
      console.log('Token found:', !!token);
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/payos/create-payment`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/payos/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success && result.data) {
        console.log('Payment data received:', result.data);
        setPaymentData(result.data);
        setShowQR(true);
        
        // Check if checkoutUrl exists before trying to open it
        if (result.data.checkoutUrl) {
          // Open PayOS checkout in new tab
          window.open(result.data.checkoutUrl, '_blank');
          // Start checking payment status
          startPaymentStatusCheck(result.data.orderCode);
        } else {
          console.error('No checkoutUrl in response:', result.data);
          alert('❌ Lỗi: Không nhận được link thanh toán từ PayOS');
        }
      } else {
        console.error('Payment creation failed:', result);
        alert(`❌ Lỗi tạo thanh toán: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      alert(`❌ Lỗi kết nối: ${error.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  // Check payment status
  const startPaymentStatusCheck = (orderCode: number) => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payos/payment-status/${orderCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          setPaymentStatus(result.status);
          
          if (result.status === 'PAID') {
            // Call the payment success endpoint to complete enrollment
            await handlePaymentSuccess(orderCode);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
      
      // Continue checking every 3 seconds if not paid yet
      setTimeout(checkStatus, 3000);
    };

    // Start checking after 2 seconds
    setTimeout(checkStatus, 2000);
  };

  // Handle payment success - complete enrollment
  const handlePaymentSuccess = async (orderCode: number) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Handling payment success, token found:', !!token);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses/payos-payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderCode })
      });

      console.log('Payment success response status:', response.status);
      const result = await response.json();
      console.log('Payment success response data:', result);
      
      if (result.success) {
        alert('✅ Thanh toán thành công! Bạn đã được đăng ký khóa học.');
        setShowQR(false);
        setShowPayment(false);
        
        // Navigate to the course page
        onEnroll?.(course.id);
        
        // Refresh the page or update the UI to show enrolled state
        window.location.reload();
      } else {
        console.error('Payment success handling failed:', result);
        alert(`❌ Lỗi xử lý thanh toán: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error handling payment success:', error);
      alert(`❌ Lỗi xử lý thanh toán: ${error.message}`);
    }
  };

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
              <div className="max-w-2xl mx-auto">
                {/* Order Summary */}
                <div className="mb-8">
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
                      <div className="flex justify-between text-xl font-bold border-t pt-3 mt-3">
                        <span>Tổng thanh toán:</span>
                        <span className="text-blue-600">{formatPrice(course.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
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

                  {/* Single Payment Button */}
                  <button 
                    onClick={createPayOSPayment}
                    disabled={enrolling || isEnrolled}
                    className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg ${
                      isEnrolled 
                        ? 'bg-green-100 text-green-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>
                      {enrolling ? 'Đang tạo mã QR thanh toán...' : 
                       isEnrolled ? 'Đã đăng ký' : 'Thanh toán bằng QR PayOS'}
                    </span>
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Bằng cách nhấn "Thanh toán bằng QR PayOS", bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QR Code Display Modal
  if (showQR && paymentData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6">
            {/* QR Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quét mã QR để thanh toán</h2>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              {paymentData.qrCode ? (
                <img 
                  src={`data:image/png;base64,${paymentData.qrCode}`} 
                  alt="PayOS QR Code"
                  className="mx-auto w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Đang tạo mã QR...</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Khóa học:</span>
                <span className="font-semibold">{course.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-blue-600">
                  {course.price.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-semibold text-orange-600">
                  {paymentStatus || 'Chờ thanh toán'}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 text-center mb-4">
              <p>1. Mở ứng dụng ngân hàng hoặc ví điện tử</p>
              <p>2. Quét mã QR hoặc click vào link đã mở</p>
              <p>3. Xác nhận thanh toán</p>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Đang chờ thanh toán...</span>
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

            {/* Vocabulary Content */}
            {course.vocabulary && course.vocabulary.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Từ vựng</h2>
                  {!isPurchased && !showPreview && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Xem trước
                    </button>
                  )}
                </div>

                {!isPurchased && !showPreview ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Nội dung từ vựng sẽ được mở khóa sau khi mua khóa học</p>
                    <p className="text-sm text-gray-500">
                      {course.vocabulary.length} từ vựng đang chờ bạn khám phá
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid gap-4 md:grid-cols-2">
                      {course.vocabulary.slice(0, isPurchased ? undefined : 2).map((vocab, index) => (
                        <div key={vocab.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-blue-600">{vocab.word}</h3>
                            {vocab.pronunciation && (
                              <span className="text-sm text-gray-500 italic">/{vocab.pronunciation}/</span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">
                            <span className="font-medium">Nghĩa:</span> {vocab.meaning}
                          </p>
                          {vocab.example && (
                            <p className="text-gray-600 text-sm">
                              <span className="font-medium">Ví dụ:</span> {vocab.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {!isPurchased && showPreview && course.vocabulary.length > 2 && (
                      <div className="relative mt-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none"></div>
                        <div className="text-center pt-6 pb-2">
                          <p className="text-gray-600 text-sm mb-3">
                            Còn {course.vocabulary.length - 2} từ vựng nữa...
                          </p>
                          <button
                            onClick={handleEnrollClick}
                            disabled={enrolling || isEnrolled}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                              isEnrolled 
                                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {enrolling ? 'Đang đăng ký...' : 
                             isEnrolled ? 'Đã đăng ký' : 'Mua khóa học để xem toàn bộ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Grammar Content */}
            {course.grammar && course.grammar.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Ngữ pháp</h2>
                  {!isPurchased && !showPreview && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Xem trước
                    </button>
                  )}
                </div>

                {!isPurchased && !showPreview ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Nội dung ngữ pháp sẽ được mở khóa sau khi mua khóa học</p>
                    <p className="text-sm text-gray-500">
                      {course.grammar.length} nội dung ngữ pháp đang chờ bạn khám phá
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="space-y-4">
                      {course.grammar.slice(0, isPurchased ? undefined : 2).map((grammar, index) => (
                        <div key={grammar.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-green-600 mb-2">{grammar.rule}</h3>
                          {grammar.structure && (
                            <p className="text-gray-700 mb-2">
                              <span className="font-medium">Cấu trúc:</span> 
                              <code className="bg-gray-100 px-2 py-1 rounded ml-2">{grammar.structure}</code>
                            </p>
                          )}
                          <p className="text-gray-700 mb-2">
                            <span className="font-medium">Giải thích:</span> {grammar.explanation}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Ví dụ:</span> {grammar.example}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {!isPurchased && showPreview && course.grammar.length > 2 && (
                      <div className="relative mt-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none"></div>
                        <div className="text-center pt-6 pb-2">
                          <p className="text-gray-600 text-sm mb-3">
                            Còn {course.grammar.length - 2} nội dung ngữ pháp nữa...
                          </p>
                          <button
                            onClick={() => setShowPayment(true)}
                            disabled={enrolling || isEnrolled}
                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                              isEnrolled 
                                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {enrolling ? 'Đang đăng ký...' : 
                             isEnrolled ? 'Đã đăng ký' : 'Mua khóa học để xem toàn bộ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
