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
    
    console.log('🔍 Kiểm tra enrollment cho:', { userId, courseId });
    
    const existingEnrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId
    });

    console.log('📊 Kết quả kiểm tra enrollment:', { 
      existingEnrollment: !!existingEnrollment,
      enrollmentId: existingEnrollment?._id,
      enrollmentUserId: existingEnrollment?.userId,
      enrollmentCourseId: existingEnrollment?.courseId
    });

    if (existingEnrollment) {
      console.log('❌ User đã có enrollment:', existingEnrollment);
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này rồi',
        debug: {
          userId: userId,
          courseId: courseId,
          existingEnrollmentId: existingEnrollment._id,
          existingEnrollmentUserId: existingEnrollment.userId
        }
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
    console.log('🔔 PayOS Webhook nhận được:');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;
    const signature = req.headers['x-payos-signature'] || req.headers['payos-signature'];

    // Kiểm tra signature từ PayOS
    if (signature) {
      console.log('🔐 Verifying PayOS signature...');
      const isValidSignature = payOSService.verifyWebhookSignature(webhookData, signature);
      
      if (!isValidSignature) {
        console.error('❌ PayOS signature không hợp lệ');
        return res.status(400).json({
          success: false,
          message: 'Invalid PayOS signature'
        });
      }
      console.log('✅ PayOS signature hợp lệ');
    } else {
      console.log('⚠️ Không có signature - có thể là test webhook');
    }

    // PayOS webhook format có thể là:
    // 1. Direct format: { orderCode, amount, description, ... }
    // 2. Wrapped format: { data: { orderCode, amount, ... }, code, desc }
    
    let paymentData = webhookData;
    let status = 'PAID'; // Mặc định là PAID nếu nhận được webhook
    
    // Nếu có field 'data', đây là wrapped format
    if (webhookData.data) {
      paymentData = webhookData.data;
      // Kiểm tra code để xác định status
      status = webhookData.code === '00' ? 'PAID' : 'CANCELLED';
      console.log('📝 Webhook format: Wrapped, Status:', status);
    } else {
      console.log('📝 Webhook format: Direct, Status:', status);
    }

    const { orderCode, amount, description } = paymentData;

    if (!orderCode) {
      console.error('❌ Webhook thiếu orderCode');
      return res.status(400).json({
        success: false,
        message: 'Missing orderCode in webhook data'
      });
    }

    console.log('💳 Xử lý payment:', { orderCode, amount, description, status });

    // Import PaymentHistory model
    const PaymentHistory = require('./PaymentHistory');

    // Tìm hoặc tạo payment record
    let payment = await PaymentHistory.findOne({ orderCode });

    if (payment) {
      console.log('🔄 Cập nhật payment hiện tại:', payment._id);
      
      // Cập nhật trạng thái
      payment.status = status;
      if (status === 'PAID') {
        payment.paidAt = new Date();
      } else if (status === 'CANCELLED') {
        payment.cancelledAt = new Date();
      }
      
      payment.webhookReceived = true;
      payment.webhookData = webhookData;
      
      await payment.save();
      console.log('✅ Đã cập nhật payment:', payment._id);
      
    } else {
      console.log('🆕 Tạo payment record mới từ webhook');
      
      // Tạo payment record mới
      payment = new PaymentHistory({
        orderCode,
        amount: amount || 0,
        description: description || `Payment #${orderCode}`,
        status,
        currency: 'VND',
        paidAt: status === 'PAID' ? new Date() : undefined,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
        webhookReceived: true,
        webhookData: webhookData,
        paymentMethod: 'qr_code'
      });
      
      await payment.save();
      console.log('✅ Đã tạo payment mới:', payment._id);
    }

    // Trả về success response cho PayOS
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      orderCode: orderCode,
      status: status
    });

    console.log('🎉 Webhook processed thành công cho orderCode:', orderCode);

  } catch (error) {
    console.error('❌ Lỗi xử lý PayOS webhook:', error);
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
    const { orderCode } = webhookData;
    const PaymentHistory = require('./PaymentHistory');
    
    console.log(`💰 Xử lý thanh toán thành công: ${orderCode}`);

    // Cập nhật PaymentHistory
    const updatedPayment = await PaymentHistory.findOneAndUpdate(
      { orderCode },
      {
        status: 'PAID',
        paidAt: new Date(),
        webhookReceived: true,
        webhookData
      },
      { new: true }
    );

    if (updatedPayment) {
      console.log('✅ Đã cập nhật PaymentHistory cho order:', orderCode);
    } else {
      console.warn('⚠️ Không tìm thấy PaymentHistory cho order:', orderCode);
    }

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
    const PaymentHistory = require('./PaymentHistory');
    
    console.log(`🚫 Xử lý thanh toán bị hủy: ${orderCode}`);

    // Cập nhật PaymentHistory
    await PaymentHistory.findOneAndUpdate(
      { orderCode },
      {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        webhookReceived: true,
        webhookData
      }
    );

    console.log('✅ Đã cập nhật PaymentHistory cho order bị hủy:', orderCode);

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