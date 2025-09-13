/**
 * PayOS Routes
 * Định nghĩa các routes cho PayOS payment API
 */

const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentStatus,
  handleWebhook,
  cancelPayment
} = require('./payos-controller');

// Middleware để parse JSON
router.use(express.json());

/**
 * @route   POST /api/payos/create-payment
 * @desc    Tạo payment link cho khóa học
 * @access  Private (cần auth)
 * @body    { courseId: string }
 */
router.post('/create-payment', createPayment);

/**
 * @route   GET /api/payos/payment-status/:orderCode
 * @desc    Kiểm tra trạng thái thanh toán
 * @access  Private (cần auth)
 * @params  orderCode: number
 */
router.get('/payment-status/:orderCode', getPaymentStatus);

/**
 * @route   POST /api/payos/webhook
 * @desc    Webhook nhận thông báo từ PayOS
 * @access  Public (PayOS callback)
 * @body    PayOS webhook data
 */
router.post('/webhook', handleWebhook);

/**
 * @route   POST /api/payos/cancel-payment/:orderCode
 * @desc    Hủy payment link
 * @access  Private (cần auth)
 * @params  orderCode: number
 * @body    { reason?: string }
 */
router.post('/cancel-payment/:orderCode', cancelPayment);

/**
 * @route   GET /api/payos/health
 * @desc    Health check cho PayOS service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PayOS service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;