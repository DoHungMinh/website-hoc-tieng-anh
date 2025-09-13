/**
 * PayOS Controller
 * Xử lý các API endpoints cho PayOS payment
 */

const payOSService = require('./payos-service');

/**
 * Tạo payment link cho khóa học
 * POST /api/payos/create-payment
 */
const createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id; // Từ auth middleware
    const userEmail = req.user?.email;

    console.log('📝 Tạo payment request:', { courseId, userId, userEmail });

    // Validate input
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId là bắt buộc'
      });
    }

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng chưa đăng nhập'
      });
    }

    // Lấy thông tin khóa học từ database
    // Import Course model (cần require đúng path)
    const Course = require('../src/models/Course').default || require('../src/models/Course');
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Kiểm tra xem user đã đăng ký khóa học chưa
    const Enrollment = require('../src/models/Enrollment').default || require('../src/models/Enrollment');
    const existingEnrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này rồi'
      });
    }

    // Chuẩn bị dữ liệu order
    const orderData = {
      courseId: course._id.toString(),
      courseName: course.title,
      price: course.price,
      userId: userId,
      userEmail: userEmail
    };

    // Tạo payment link qua PayOS
    const paymentResult = await payOSService.createPaymentLink(orderData);

    if (paymentResult.success) {
      console.log('✅ Payment link được tạo thành công cho khóa học:', course.title);
      
      res.json({
        success: true,
        message: 'Tạo payment link thành công',
        data: paymentResult.data
      });
    } else {
      console.error('❌ Lỗi tạo payment link:', paymentResult.message);
      res.status(500).json({
        success: false,
        message: paymentResult.message
      });
    }

  } catch (error) {
    console.error('❌ Lỗi API tạo payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 * GET /api/payos/payment-status/:orderCode
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const userId = req.user?.id;

    console.log(`🔍 Kiểm tra payment status: ${orderCode} cho user: ${userId}`);

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'orderCode là bắt buộc'
      });
    }

    // Kiểm tra trạng thái từ PayOS
    const statusResult = await payOSService.getPaymentStatus(parseInt(orderCode));

    if (statusResult.success) {
      res.json({
        success: true,
        status: statusResult.status,
        data: statusResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: statusResult.message
      });
    }

  } catch (error) {
    console.error('❌ Lỗi API kiểm tra payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Webhook nhận thông báo từ PayOS
 * POST /api/payos/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers['payos-signature'];

    console.log('🔔 Nhận webhook từ PayOS:', {
      orderCode: webhookData.orderCode,
      status: webhookData.status
    });

    // Xác thực webhook signature
    const isValidSignature = payOSService.verifyWebhookSignature(webhookData, signature);
    
    if (!isValidSignature) {
      console.error('❌ Webhook signature không hợp lệ');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Xử lý webhook theo status
    if (webhookData.status === 'PAID') {
      await handleSuccessfulPayment(webhookData);
    } else if (webhookData.status === 'CANCELLED') {
      await handleCancelledPayment(webhookData);
    }

    // Trả về success cho PayOS
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Lỗi xử lý webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý webhook'
    });
  }
};

/**
 * Xử lý thanh toán thành công
 */
const handleSuccessfulPayment = async (webhookData) => {
  try {
    const { orderCode, description } = webhookData;
    
    console.log(`💰 Xử lý thanh toán thành công: ${orderCode}`);

    // TODO: Implement logic tự động đăng ký khóa học khi thanh toán thành công
    // - Tìm thông tin order từ orderCode
    // - Tạo enrollment record
    // - Gửi email xác nhận (nếu có)
    // - Log activity

    console.log('✅ Đã xử lý thanh toán thành công cho order:', orderCode);

  } catch (error) {
    console.error('❌ Lỗi xử lý thanh toán thành công:', error);
  }
};

/**
 * Xử lý thanh toán bị hủy
 */
const handleCancelledPayment = async (webhookData) => {
  try {
    const { orderCode } = webhookData;
    
    console.log(`🚫 Xử lý thanh toán bị hủy: ${orderCode}`);

    // TODO: Implement logic xử lý khi payment bị hủy
    // - Log activity
    // - Thông báo cho user (nếu cần)

    console.log('✅ Đã xử lý thanh toán bị hủy cho order:', orderCode);

  } catch (error) {
    console.error('❌ Lỗi xử lý thanh toán bị hủy:', error);
  }
};

/**
 * Hủy payment link
 * POST /api/payos/cancel-payment/:orderCode
 */
const cancelPayment = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    console.log(`🚫 Hủy payment: ${orderCode} bởi user: ${userId}`);

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'orderCode là bắt buộc'
      });
    }

    // Hủy payment qua PayOS
    const cancelResult = await payOSService.cancelPaymentLink(
      parseInt(orderCode), 
      reason || 'User cancelled'
    );

    if (cancelResult.success) {
      res.json({
        success: true,
        message: 'Đã hủy payment thành công',
        data: cancelResult.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: cancelResult.message
      });
    }

  } catch (error) {
    console.error('❌ Lỗi API hủy payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPayment,
  getPaymentStatus,
  handleWebhook,
  cancelPayment
};