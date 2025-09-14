// Load environment variables first
require('dotenv').config();
const emailService = require('./payos/email-service');

// Test email to actual user email
const testRealEmail = async () => {
  console.log('🧪 Testing email to nnpenenpi02@gmail.com...');
  console.log('🔧 SMTP Config check:');
  console.log('- SMTP_HOST:', process.env.SMTP_HOST);
  console.log('- SMTP_PORT:', process.env.SMTP_PORT);
  console.log('- SMTP_USER:', process.env.SMTP_USER);
  console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing');
  
  try {
    // Initialize email service first
    const isConfigValid = emailService.validateEmailConfig();
    console.log('✅ Config valid:', isConfigValid);
    
    if (!isConfigValid) {
      console.error('❌ Email config is invalid');
      return;
    }

    const initialized = emailService.initializeEmailTransporter();
    console.log('🔧 Transporter initialized:', initialized);
    
    if (!initialized) {
      console.error('❌ Failed to initialize email transporter');
      return;
    }

    // Test payment info for real user
    const testPaymentInfo = {
      userEmail: 'nnpenenpi02@gmail.com',
      courseName: 'Test Course - học khóa này thành pro',
      courseId: '68b09f3eeee96a40c98ad892',
      amount: 10000,
      paymentDate: new Date(),
      orderCode: 999999
    };

    console.log('📤 Đang gửi email test đến:', testPaymentInfo.userEmail);
    console.log('📋 Course:', testPaymentInfo.courseName);
    console.log('💰 Amount:', testPaymentInfo.amount, 'VNĐ');

    const result = await emailService.sendPaymentSuccessEmail(testPaymentInfo);
    
    if (result.success) {
      console.log('✅ Email gửi thành công!');
      console.log('📧 Message ID:', result.messageId);
      console.log('🎯 Vui lòng kiểm tra email (bao gồm cả thư mục spam)');
    } else {
      console.error('❌ Email gửi thất bại:', result.message);
    }
    
    console.log('🔍 Full result:', result);

  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

testRealEmail();