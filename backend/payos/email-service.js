const nodemailer = require('nodemailer');

// Cấu hình email transporter
let transporter = null;

// Khởi tạo email transporter
const initializeEmailTransporter = () => {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('📧 Email transporter initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing email transporter:', error);
    return false;
  }
};

// Tạo HTML template cho email thanh toán thành công
const createPaymentSuccessEmailTemplate = (paymentInfo) => {
  const { 
    userEmail, 
    courseName, 
    courseId, 
    amount, 
    paymentDate, 
    orderCode 
  } = paymentInfo;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);

  const formattedDate = new Date(paymentDate).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanh toán thành công</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .success-icon {
          font-size: 60px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px;
        }
        .info-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
        }
        .info-value {
          color: #1f2937;
          font-weight: 500;
        }
        .amount {
          color: #059669;
          font-size: 20px;
          font-weight: bold;
        }
        .course-info {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #bfdbfe;
        }
        .course-title {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
        }
        .course-id {
          color: #6b7280;
          font-size: 14px;
          font-family: monospace;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Thanh toán thành công!</h1>
          <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>
        </div>

        <!-- Content -->
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Thông tin thanh toán</h2>
          
          <!-- Course Info -->
          <div class="course-info">
            <div class="course-title">${courseName}</div>
            <div class="course-id">Mã khóa học: ${courseId}</div>
          </div>

          <!-- Payment Details -->
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">📧 Email:</span>
              <span class="info-value">${userEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">💰 Số tiền:</span>
              <span class="info-value amount">${formattedAmount}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Thời gian:</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🔢 Mã giao dịch:</span>
              <span class="info-value">${orderCode}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #059669; font-size: 18px; font-weight: 600; margin-bottom: 10px;">
              🎉 Bạn đã được đăng ký thành công vào khóa học!
            </p>
            <p style="color: #6b7280;">
              Hãy đăng nhập vào tài khoản để bắt đầu học ngay
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
              Bắt đầu học ngay 🚀
            </a>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 8px 0;">📋 Lưu ý quan trọng:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
              <li>Hãy lưu lại email này để đối chiếu giao dịch</li>
              <li>Nếu có thắc mắc, vui lòng liên hệ hỗ trợ kèm mã giao dịch</li>
              <li>Khóa học có hiệu lực ngay lập tức sau khi thanh toán</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Website Học Tiếng Anh</strong></p>
          <p>📧 Email hỗ trợ: support@hoctienganh.com</p>
          <p>📞 Hotline: 1900 xxxx</p>
          <p style="margin-top: 15px; font-size: 12px;">
            © 2025 Website Học Tiếng Anh. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Gửi email thông báo thanh toán thành công
const sendPaymentSuccessEmail = async (paymentInfo) => {
  try {
    // Kiểm tra transporter đã được khởi tạo chưa
    if (!transporter) {
      const initialized = initializeEmailTransporter();
      if (!initialized) {
        throw new Error('Failed to initialize email transporter');
      }
    }

    // Kiểm tra các thông tin bắt buộc
    if (!paymentInfo.userEmail || !paymentInfo.courseName || !paymentInfo.amount) {
      throw new Error('Missing required payment information for email');
    }

    const emailTemplate = createPaymentSuccessEmailTemplate(paymentInfo);

    const mailOptions = {
      from: `"Website Học Tiếng Anh" <${process.env.SMTP_USER}>`,
      to: paymentInfo.userEmail,
      subject: `✅ Thanh toán thành công - ${paymentInfo.courseName}`,
      html: emailTemplate,
      text: `
Thanh toán thành công!

Xin chào,

Cảm ơn bạn đã thanh toán thành công cho khóa học "${paymentInfo.courseName}".

Thông tin thanh toán:
- Email: ${paymentInfo.userEmail}
- Khóa học: ${paymentInfo.courseName} (${paymentInfo.courseId})
- Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentInfo.amount)}
- Thời gian: ${new Date(paymentInfo.paymentDate).toLocaleString('vi-VN')}
- Mã giao dịch: ${paymentInfo.orderCode}

Bạn đã được đăng ký thành công vào khóa học. Hãy đăng nhập để bắt đầu học ngay!

Trân trọng,
Website Học Tiếng Anh
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment success email sent:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('❌ Error sending payment success email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Kiểm tra cấu hình email
const validateEmailConfig = () => {
  const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing email configuration:', missingVars.join(', '));
    return false;
  }
  
  return true;
};

module.exports = {
  initializeEmailTransporter,
  sendPaymentSuccessEmail,
  validateEmailConfig
};