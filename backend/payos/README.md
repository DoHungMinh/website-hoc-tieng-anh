# PayOS Integration Guide

## Hướng dẫn tích hợp PayOS cho Website Học Tiếng Anh

### 🚀 Tổng quan

PayOS đã được tích hợp hoàn toàn vào hệ thống thanh toán khóa học bằng JavaScript thuần theo PayOS Node.js SDK standard.

### 📁 Cấu trúc thư mục

```
backend/
├── payos/                    # PayOS integration module (JavaScript)
│   ├── config.js            # Cấu hình PayOS 
│   ├── payos-service.js     # Service chính cho PayOS operations
│   ├── payos-controller.js  # Controller xử lý API endpoints
│   ├── payos-routes.js      # Routes định nghĩa các API
│   └── index.js            # Entry point cho PayOS module
│
├── src/controllers/
│   └── courseController.ts  # Thêm handlePayOSPaymentSuccess
│
└── src/routes/
    └── index.ts             # Thêm PayOS routes
```

### ⚙️ Cài đặt và cấu hình

#### 1. Cài đặt PayOS SDK
```bash
cd backend
npm install @payos/node
```

#### 2. Cấu hình environment variables
Thêm vào file `.env`:
```bash
# PayOS Configuration
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here  
PAYOS_CHECKSUM_KEY=your_checksum_key_here

# PayOS URLs (optional)
PAYOS_RETURN_URL=http://localhost:5173/payment/success
PAYOS_CANCEL_URL=http://localhost:5173/payment/cancel
PAYOS_WEBHOOK_URL=http://localhost:3000/api/payos/webhook
```

#### 3. Lấy API Keys từ PayOS Dashboard
1. Truy cập [PayOS Dashboard](https://my.payos.vn/)
2. Đăng ký/Đăng nhập tài khoản
3. Tạo ứng dụng mới
4. Copy Client ID, API Key, và Checksum Key
5. Paste vào file `.env`

### 🔄 Flow thanh toán

#### 1. User click "Hoàn thành thanh toán"
- Frontend gọi `POST /api/payos/create-payment`
- Backend tạo PayOS payment link với QR code
- Mở PayOS checkout trong tab mới
- Hiển thị QR code trên UI

#### 2. User thanh toán
- Quét QR code bằng ví điện tử 
- Hoàn thành thanh toán trên PayOS
- PayOS gửi webhook về backend (optional)

#### 3. System xác nhận thanh toán
- Frontend polling check payment status
- Khi status = 'PAID', gọi `POST /api/courses/payos-payment-success`
- Backend tự động tạo enrollment
- User được chuyển đến trang khóa học

### 🛠️ API Endpoints

#### PayOS APIs
```
POST /api/payos/create-payment
GET  /api/payos/payment-status/:orderCode
POST /api/payos/webhook
POST /api/payos/cancel-payment/:orderCode
GET  /api/payos/health
```

#### Course APIs (mới)
```
POST /api/courses/payos-payment-success
```

### 📱 Frontend Integration

CourseDetail component đã được update để:
- ✅ Tạo PayOS payment link
- ✅ Hiển thị QR code  
- ✅ Polling check payment status
- ✅ Tự động enrollment khi thanh toán thành công
- ✅ Chuyển đến trang khóa học

### 🔒 Bảo mật

- ✅ Webhook signature verification
- ✅ JWT authentication cho tất cả APIs  
- ✅ Input validation và sanitization
- ✅ Error handling và logging
- ✅ Rate limiting

### 🧪 Testing

#### 1. Test PayOS health
```bash
curl http://localhost:3000/api/payos/health
```

#### 2. Test tạo payment (cần auth token)
```bash
curl -X POST http://localhost:3000/api/payos/create-payment \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"courseId": "COURSE_ID"}'
```

#### 3. Test payment status
```bash
curl http://localhost:3000/api/payos/payment-status/ORDER_CODE \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🐛 Troubleshooting

#### Lỗi "PayOS: Thiếu cấu hình"
- Kiểm tra file `.env` có đầy đủ PAYOS_* variables
- Restart server sau khi update .env

#### Lỗi "Invalid signature" 
- Kiểm tra PAYOS_CHECKSUM_KEY chính xác
- Đảm bảo webhook URL accessible từ internet

#### Payment không được tạo
- Kiểm tra PayOS API keys valid
- Xem logs để debug error details
- Đảm bảo course tồn tại và user chưa enrollment

### 📈 Monitoring & Logs

System sẽ log các events quan trọng:
- ✅ PayOS service initialization  
- 🔄 Payment link creation
- 📊 Payment status checks
- 💰 Successful payments
- 🚫 Failed/cancelled payments
- 🎯 Enrollment creation

### 🚀 Production Deployment

1. Update PAYOS URLs trong .env production:
```bash
PAYOS_RETURN_URL=https://yourdomain.com/payment/success
PAYOS_CANCEL_URL=https://yourdomain.com/payment/cancel  
PAYOS_WEBHOOK_URL=https://yourdomain.com/api/payos/webhook
```

2. Đảm bảo webhook URL accessible từ internet
3. Configure PayOS dashboard với production URLs
4. Test thoroughly trước khi go-live

### 💡 Features

- ✅ **QR Code Generation**: Tự động tạo QR code cho thanh toán
- ✅ **Real-time Status**: Polling payment status real-time
- ✅ **Auto Enrollment**: Tự động đăng ký khóa học khi thanh toán thành công
- ✅ **UX Optimization**: Mở PayOS trong tab mới, UX smooth
- ✅ **Error Handling**: Comprehensive error handling và user feedback
- ✅ **Security**: JWT auth, webhook verification, input validation
- ✅ **Logging**: Detailed logging cho monitoring và debugging
- ✅ **Pure JavaScript**: PayOS module 100% JavaScript, không TypeScript

---

**🎉 PayOS integration hoàn tất! Hệ thống đã sẵn sàng nhận thanh toán QR code.**