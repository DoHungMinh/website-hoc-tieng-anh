/**
 * PayOS Module Index
 * Entry point cho PayOS integration
 */

const payOSService = require('./payos-service');
const payOSController = require('./payos-controller');
const payOSRoutes = require('./payos-routes');
const { PAYOS_CONFIG, validateConfig } = require('./config');
const emailService = require('./email-service');

// Kiểm tra cấu hình khi module được load
console.log('🔧 Khởi tạo PayOS module...');

if (validateConfig()) {
  console.log('✅ PayOS module đã sẵn sàng');
} else {
  console.warn('⚠️  PayOS module thiếu cấu hình, vui lòng kiểm tra .env file');
}

// Khởi tạo email service
if (emailService.validateEmailConfig()) {
  emailService.initializeEmailTransporter();
  console.log('📧 Email service đã được khởi tạo');
} else {
  console.warn('⚠️  Email service thiếu cấu hình SMTP, email sẽ không được gửi');
}

module.exports = {
  service: payOSService,
  controller: payOSController,
  routes: payOSRoutes,
  config: PAYOS_CONFIG,
  emailService: emailService
};