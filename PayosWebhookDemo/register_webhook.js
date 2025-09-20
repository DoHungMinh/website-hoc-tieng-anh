const axios = require('axios');

// ⚠️ CHỈ CHẠY FILE NÀY 1 LẦN DUY NHẤT KHI:
// - Setup lần đầu
// - Thay đổi webhook URL
// - Chuyển từ ngrok sang domain thật
// KHÔNG CHẠY LẠI mỗi lần restart server!

const clientId = 'e2e81d35-6c7c-43fe-9322-52a852192b9e';
const apiKey = '316a560b-629e-4d71-a197-74a60510de7c';
const webhookUrl = 'https://c4839209c316.ngrok-free.app/donate/webhook';

// First, test if the webhook endpoint is accessible
console.log('Testing webhook endpoint accessibility...');
axios.get(webhookUrl, {
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'PayOS-Webhook-Test'
    }
}).then(response => {
    console.log('Webhook endpoint is accessible (even if 405 error expected)');
}).catch(error => {
    if (error.response && error.response.status === 405) {
        console.log('Webhook endpoint is accessible (405 Method Not Allowed is expected for GET request)');
    } else {
        console.log('Webhook endpoint test failed:', error.message);
    }
});

// Register webhook
console.log('Registering webhook with PayOS...');
axios.post(
    'https://api-merchant.payos.vn/confirm-webhook',
    { webhookUrl },
    {
        headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        timeout: 30000 // Increase timeout to 30 seconds
    }
).then(response => {
    console.log('Đăng ký webhook thành công:', response.data);
}).catch(error => {
    if (error.response) {
        console.error('Lỗi từ PayOS API:', error.response.data);
        console.error('Status code:', error.response.status);
    } else if (error.code === 'ECONNABORTED') {
        console.error('Lỗi timeout - PayOS không thể kết nối tới webhook URL trong thời gian cho phép');
        console.error('Kiểm tra lại:');
        console.error('1. Ngrok có đang chạy không?');
        console.error('2. Laravel server có đang chạy trên port 8000 không?');
        console.error('3. URL webhook có đúng không?');
    } else {
        console.error('Lỗi kết nối:', error.message);
    }
});
