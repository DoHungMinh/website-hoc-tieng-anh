/**
 * Script test email service
 */

require('dotenv').config();
const emailService = require('./payos/email-service');

async function testEmail() {
  console.log('🧪 Testing email service...');
  
  // Kiểm tra cấu hình
  console.log('📧 SMTP Config:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- Pass:', process.env.SMTP_PASS ? 'Set' : 'Not set');
  
  // Validate config
  const isConfigValid = emailService.validateEmailConfig();
  console.log('✅ Config valid:', isConfigValid);
  
  if (!isConfigValid) {
    console.log('❌ Email config không hợp lệ. Vui lòng kiểm tra .env file');
    return;
  }
  
  // Initialize transporter
  const initialized = emailService.initializeEmailTransporter();
  console.log('🔧 Transporter initialized:', initialized);
  
  // Test gửi email
  const testPaymentInfo = {
    userEmail: 'test@gmail.com', // Thay bằng email test của bạn
    courseName: 'Test Course - Khóa học thử nghiệm',
    courseId: '64f5a8b9c1234567890abcde',
    amount: 299000,
    paymentDate: new Date(),
    orderCode: 'TEST-' + Date.now()
  };
  
  console.log('\n📤 Đang gửi email test...');
  console.log('Recipient:', testPaymentInfo.userEmail);
  
  try {
    const result = await emailService.sendPaymentSuccessEmail(testPaymentInfo);
    
    if (result.success) {
      console.log('✅ Email gửi thành công!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Email gửi thất bại:', result.message);
      console.log('🔍 Error:', result.error);
    }
  } catch (error) {
    console.log('💥 Exception khi gửi email:', error.message);
  }
}

// Chạy test
testEmail();