/**
 * PayOS Routes
 * Định nghĩa các routes cho PayOS payment API
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../src/middleware/auth');
const {
  createPayment,
  getPaymentStatus,
  handleWebhook,
  cancelPayment,
  createLevelPayment,
  handleLevelPaymentSuccess
} = require('./payos-controller');

// Middleware để parse JSON
router.use(express.json());

/**
 * @route   POST /api/payos/create-payment
 * @desc    Tạo payment link cho khóa học
 * @access  Private (cần auth)
 * @body    { courseId: string }
 */
router.post('/create-payment', authenticateToken, createPayment);

/**
 * @route   GET /api/payos/payment-status/:orderCode
 * @desc    Kiểm tra trạng thái thanh toán
 * @access  Private (cần auth)
 * @params  orderCode: number
 */
router.get('/payment-status/:orderCode', authenticateToken, getPaymentStatus);

/**
 * @route   GET /api/payos/level-payment-status/:orderCode
 * @desc    Kiểm tra trạng thái thanh toán cho LEVEL PACKAGE (NEW)
 * @access  Private (cần auth)
 * @params  orderCode: number
 */
router.get('/level-payment-status/:orderCode', authenticateToken, getPaymentStatus); // Sử dụng chung function

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
router.post('/cancel-payment/:orderCode', authenticateToken, cancelPayment);

/**
 * @route   POST /api/payos/create-level-payment
 * @desc    Tạo payment link cho LEVEL PACKAGE (NEW)
 * @access  Private (cần auth)
 * @body    { level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' }
 */
router.post('/create-level-payment', authenticateToken, createLevelPayment);

/**
 * @route   POST /api/payos/level-payment-success
 * @desc    Xử lý khi level payment thành công (NEW)
 * @access  Private (cần auth)
 * @body    { orderCode: number, level: string }
 */
router.post('/level-payment-success', authenticateToken, handleLevelPaymentSuccess);

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