/**
 * PayOS Service
 * Dịch vụ tích hợp PayOS để tạo QR thanh toán và xử lý payment
 */

// Import PayOS with correct destructuring
const { PayOS } = require("@payos/node");
const { PAYOS_CONFIG, validateConfig } = require('./config');

class PayOSService {
  constructor() {
    // Kiểm tra cấu hình trước khi khởi tạo
    if (!validateConfig()) {
      console.error('❌ PayOS: Cấu hình không hợp lệ');
      return;
    }

    console.log('🔧 PayOS constructor type:', typeof PayOS);
    console.log('🔧 PayOS constructor available:', !!PayOS);

    // Khởi tạo PayOS client
    try {
      this.payOS = new PayOS(
        PAYOS_CONFIG.clientId,
        PAYOS_CONFIG.apiKey,
        PAYOS_CONFIG.checksumKey
      );
      console.log('✅ PayOS Service đã được khởi tạo thành công');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo PayOS:', error);
      throw error;
    }
  }

  /**
   * Tạo payment link cho khóa học
   * @param {Object} orderData - Thông tin đơn hàng
   * @param {string} orderData.courseId - ID khóa học
   * @param {string} orderData.courseName - Tên khóa học
   * @param {number} orderData.price - Giá khóa học
   * @param {string} orderData.userId - ID người dùng
   * @param {string} orderData.userEmail - Email người dùng
   * @returns {Promise<Object>} Payment link data
   */
  async createPaymentLink(orderData) {
    try {
      const { courseId, courseName, price, userId, userEmail } = orderData;
      
      // Tạo order code unique
      const orderCode = this.generateOrderCode();
      
      // Chuẩn bị dữ liệu payment theo PayOS format
      const paymentData = {
        orderCode: orderCode,
        amount: Math.round(price), // PayOS yêu cầu số nguyên
        description: `${courseId}`, // Chỉ lưu courseId để dễ parse, đúng 24 ký tự
        items: [
          {
            name: courseName.length > 20 ? courseName.substring(0, 17) + '...' : courseName, // Giới hạn tên
            quantity: 1,
            price: Math.round(price)
          }
        ],
        returnUrl: PAYOS_CONFIG.returnUrl,
        cancelUrl: PAYOS_CONFIG.cancelUrl,
        buyerName: userEmail.split('@')[0], // Lấy phần trước @ làm tên
        buyerEmail: userEmail,
        expiredAt: Math.floor(Date.now() / 1000) + (15 * 60), // Hết hạn sau 15 phút
      };

      console.log('🔄 Tạo PayOS payment link:', {
        orderCode,
        amount: paymentData.amount,
        description: paymentData.description
      });

      // Gọi PayOS API để tạo payment link
      const paymentLinkResponse = await this.payOS.paymentRequests.create(paymentData);
      
      console.log('✅ PayOS payment link được tạo thành công:', {
        orderCode: paymentLinkResponse.orderCode,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode
      });

      return {
        success: true,
        data: {
          orderCode: paymentLinkResponse.orderCode,
          checkoutUrl: paymentLinkResponse.checkoutUrl,
          qrCode: paymentLinkResponse.qrCode,
          amount: paymentData.amount,
          description: paymentData.description,
          expiredAt: paymentData.expiredAt,
          // Thêm thông tin khóa học để tracking
          courseId,
          userId
        }
      };

    } catch (error) {
      console.error('❌ Lỗi tạo PayOS payment link:', error);
      return {
        success: false,
        message: error.message || 'Lỗi tạo payment link',
        error: error
      };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {number} orderCode - Mã đơn hàng
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(orderCode) {
    try {
      console.log(`🔍 Kiểm tra trạng thái payment: ${orderCode}`);
      
      const paymentInfo = await this.payOS.paymentRequests.get(orderCode);
      
      console.log('📊 Trạng thái payment:', {
        orderCode: paymentInfo.orderCode,
        status: paymentInfo.status,
        amount: paymentInfo.amount
      });

      return {
        success: true,
        status: paymentInfo.status, // PENDING, PROCESSING, PAID, CANCELLED
        data: paymentInfo
      };

    } catch (error) {
      console.error(`❌ Lỗi kiểm tra trạng thái payment ${orderCode}:`, error);
      
      // Nếu không tìm thấy payment, có thể đã hết hạn hoặc bị cancel
      if (error.message && error.message.includes('not found')) {
        return {
          success: true,
          status: 'NOT_FOUND',
          message: 'Payment không tồn tại hoặc đã hết hạn'
        };
      }

      return {
        success: false,
        message: error.message || 'Lỗi kiểm tra trạng thái payment',
        error: error
      };
    }
  }

  /**
   * Hủy payment link
   * @param {number} orderCode - Mã đơn hàng
   * @param {string} reason - Lý do hủy
   * @returns {Promise<Object>} Cancel result
   */
  async cancelPaymentLink(orderCode, reason = 'User cancelled') {
    try {
      console.log(`🚫 Hủy payment link: ${orderCode}, lý do: ${reason}`);
      
      const result = await this.payOS.paymentRequests.cancel(orderCode, reason);
      
      console.log('✅ Đã hủy payment link thành công:', orderCode);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error(`❌ Lỗi hủy payment link ${orderCode}:`, error);
      return {
        success: false,
        message: error.message || 'Lỗi hủy payment link',
        error: error
      };
    }
  }

  /**
   * Xác thực webhook từ PayOS
   * @param {Object} webhookData - Dữ liệu webhook
   * @param {string} signature - Chữ ký webhook
   * @returns {boolean} Kết quả xác thực
   */
  verifyWebhookSignature(webhookData, signature) {
    try {
      return this.payOS.webhooks.verify(webhookData, signature);
    } catch (error) {
      console.error('❌ Lỗi xác thực webhook signature:', error);
      return false;
    }
  }

  /**
   * Tạo order code unique
   * @returns {number} Order code
   */
  generateOrderCode() {
    // Tạo order code từ timestamp + random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return parseInt(`${timestamp}${random}`.slice(-10)); // Lấy 10 số cuối
  }

  /**
   * Format số tiền theo định dạng VND
   * @param {number} amount - Số tiền
   * @returns {string} Số tiền đã format
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}

// Export singleton instance
const payOSService = new PayOSService();
module.exports = payOSService;