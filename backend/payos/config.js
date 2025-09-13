/**
 * PayOS Configuration
 * Cấu hình PayOS cho tích hợp thanh toán
 */

// Cấu hình PayOS từ environment variables
const PAYOS_CONFIG = {
  // Lấy từ PayOS Dashboard
  clientId: process.env.PAYOS_CLIENT_ID || '',
  apiKey: process.env.PAYOS_API_KEY || '',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
  
  // Cấu hình URLs
  returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:5173/payment/success',
  cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/payment/cancel',
  webhookUrl: process.env.PAYOS_WEBHOOK_URL || 'http://localhost:3000/api/payos/webhook',
  
  // Environment
  environment: process.env.NODE_ENV || 'development'
};

// Validate cấu hình
function validateConfig() {
  const required = ['clientId', 'apiKey', 'checksumKey'];
  const missing = required.filter(key => !PAYOS_CONFIG[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  PayOS: Thiếu cấu hình: ${missing.join(', ')}`);
    console.warn('Vui lòng thêm các biến môi trường sau vào .env:');
    console.warn('PAYOS_CLIENT_ID=your_client_id');
    console.warn('PAYOS_API_KEY=your_api_key');
    console.warn('PAYOS_CHECKSUM_KEY=your_checksum_key');
    return false;
  }
  
  return true;
}

module.exports = {
  PAYOS_CONFIG,
  validateConfig
};