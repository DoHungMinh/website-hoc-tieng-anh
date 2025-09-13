/**
 * PayOS Module Index
 * Entry point cho PayOS integration
 */

const payOSService = require('./payos-service');
const payOSController = require('./payos-controller');
const payOSRoutes = require('./payos-routes');
const { PAYOS_CONFIG, validateConfig } = require('./config');

// Kiểm tra cấu hình khi module được load
console.log('🔧 Khởi tạo PayOS module...');

if (validateConfig()) {
  console.log('✅ PayOS module đã sẵn sàng');
} else {
  console.warn('⚠️  PayOS module thiếu cấu hình, vui lòng kiểm tra .env file');
}

module.exports = {
  service: payOSService,
  controller: payOSController,
  routes: payOSRoutes,
  config: PAYOS_CONFIG
};