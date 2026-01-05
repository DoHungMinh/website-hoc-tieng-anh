import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import * as levelPackageAPI from '../../services/levelPackageAPI';
import { motion } from 'framer-motion';

// Icons
import { CheckCircle, XCircle, Loader2, Award, BookOpen, Clock, Star } from 'lucide-react';

interface LevelPackage {
  _id?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
}

interface PaymentModalData {
  orderCode: number;
  qrCode: string;
  checkoutUrl: string;
  amount: number;
  level: string;
}

const LevelPackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [packages, setPackages] = useState<LevelPackage[]>([]);
  const [enrolledLevels, setEnrolledLevels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<PaymentModalData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  // Level colors theo design client
  const levelColors = {
    A1: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100' },
    A2: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100' },
    B1: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', badge: 'bg-yellow-100' },
    B2: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100' },
    C1: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100' },
    C2: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', badge: 'bg-red-100' },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách level packages
        const packagesResponse = await levelPackageAPI.getAllLevelPackages();
        if (packagesResponse.success && packagesResponse.data) {
          setPackages(packagesResponse.data.sort((a, b) => a.order - b.order));
        }

        // Nếu đã login, kiểm tra các level đã mua
        if (isAuthenticated && token) {
          const enrollmentsResponse = await levelPackageAPI.getUserLevelEnrollments(token);
          if (enrollmentsResponse.success && enrollmentsResponse.data) {
            const enrolled = new Set(enrollmentsResponse.data.map(e => e.level));
            setEnrolledLevels(enrolled);
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token]);

  const handlePurchase = async (pkg: LevelPackage) => {
    if (!isAuthenticated || !token) {
      // Chưa login → redirect về login
      navigate('/login', { state: { from: '/levels' } });
      return;
    }

    try {
      setPaymentStatus('processing');

      // Gọi API tạo payment link (giống createPayment flow)
      const response = await levelPackageAPI.createLevelPayment(token, pkg.level);

      if (response.success && response.data) {
        // Mở modal hiển thị QR code
        setPaymentModal({
          orderCode: response.data.orderCode,
          qrCode: response.data.qrCode,
          checkoutUrl: response.data.checkoutUrl,
          amount: response.data.amount,
          level: pkg.level,
        });

        // Bắt đầu polling payment status
        startPaymentPolling(response.data.orderCode);
      } else {
        alert(response.message || 'Không thể tạo thanh toán');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Lỗi tạo thanh toán:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi tạo thanh toán');
      setPaymentStatus('failed');
    }
  };

  const startPaymentPolling = (orderCode: number) => {
    const pollInterval = setInterval(async () => {
      try {
        if (!token) {
          clearInterval(pollInterval);
          return;
        }

        const statusResponse = await levelPackageAPI.checkLevelPaymentStatus(token, orderCode);

        console.log('Payment status:', statusResponse);

        if (statusResponse.status === 'PAID') {
          // Thanh toán thành công
          setPaymentStatus('success');
          clearInterval(pollInterval);

          // Đợi 2 giây để hiển thị thông báo thành công
          setTimeout(() => {
            setPaymentModal(null);
            setPaymentStatus('pending');
            // Refresh data để cập nhật enrollment
            window.location.reload();
          }, 2000);
        } else if (statusResponse.status === 'CANCELLED' || statusResponse.status === 'NOT_FOUND') {
          // Thanh toán thất bại
          setPaymentStatus('failed');
          clearInterval(pollInterval);

          setTimeout(() => {
            setPaymentModal(null);
            setPaymentStatus('pending');
          }, 2000);
        }
        // Nếu PENDING hoặc PROCESSING → tiếp tục poll
      } catch (error) {
        console.error('Lỗi kiểm tra payment status:', error);
        // Không clear interval, tiếp tục thử
      }
    }, 3000); // Poll mỗi 3 giây

    // Auto clear sau 15 phút (payment expiry time)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus !== 'success') {
        setPaymentStatus('failed');
        setTimeout(() => {
          setPaymentModal(null);
          setPaymentStatus('pending');
        }, 2000);
      }
    }, 15 * 60 * 1000);
  };

  const closePaymentModal = () => {
    setPaymentModal(null);
    setPaymentStatus('pending');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Chọn Gói Cấp Độ Phù Hợp
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mua một lần, truy cập trọn đời tất cả khóa học từ vựng và ngữ pháp trong cấp độ
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => {
            const isEnrolled = enrolledLevels.has(pkg.level);
            const colors = levelColors[pkg.level];

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${colors.bg} border-2 ${colors.border} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Level Badge */}
                <div className={`inline-block ${colors.badge} ${colors.text} px-4 py-2 rounded-full text-sm font-bold mb-4`}>
                  {pkg.level}
                </div>

                {/* Package Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(pkg.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Truy cập trọn đời</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isEnrolled ? (
                  <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 py-3 px-4 rounded-xl font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Đã sở hữu</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(pkg)}
                    className={`w-full ${colors.text} bg-white hover:bg-opacity-80 py-3 px-4 rounded-xl font-semibold transition-all duration-300 border-2 ${colors.border} shadow-md hover:shadow-lg`}
                  >
                    Mua ngay
                  </button>
                )}

                {/* Popular Badge (optional) */}
                {pkg.level === 'B1' && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Phổ biến</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Lợi ích khi mua gói cấp độ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Truy cập không giới hạn</h3>
              <p className="text-gray-600 text-sm">
                Học mọi lúc, mọi nơi với tất cả khóa học trong cấp độ
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trọn đời sở hữu</h3>
              <p className="text-gray-600 text-sm">
                Một lần thanh toán, sử dụng vĩnh viễn không mất phí
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cập nhật liên tục</h3>
              <p className="text-gray-600 text-sm">
                Khóa học mới được thêm vào miễn phí cho thành viên
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            {paymentStatus === 'pending' || paymentStatus === 'processing' ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Quét mã QR để thanh toán
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn
                </p>

                {/* QR Code */}
                <div className="bg-gray-50 p-6 rounded-xl mb-6 flex justify-center">
                  <img
                    src={paymentModal.qrCode}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Gói cấp độ:</span>
                    <span className="font-semibold text-gray-900">{paymentModal.level}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(paymentModal.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {paymentModal.orderCode}
                    </span>
                  </div>
                </div>

                {/* Loading Indicator */}
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang chờ thanh toán...</span>
                </div>

                {/* Alternative Link */}
                <a
                  href={paymentModal.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-blue-600 hover:text-blue-700 underline mb-4"
                >
                  Hoặc thanh toán qua trình duyệt
                </a>

                {/* Close Button */}
                <button
                  onClick={closePaymentModal}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
              </>
            ) : paymentStatus === 'success' ? (
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanh toán thành công!
                </h3>
                <p className="text-gray-600">
                  Bạn đã mua gói cấp độ {paymentModal.level} thành công
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanh toán thất bại
                </h3>
                <p className="text-gray-600 mb-4">
                  Vui lòng thử lại hoặc liên hệ hỗ trợ
                </p>
                <button
                  onClick={closePaymentModal}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LevelPackagesPage;
