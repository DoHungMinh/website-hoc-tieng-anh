/**
 * PayOS Webhook Registration Script
 * Script đăng ký webhook với PayOS để nhận thông báo giao dịch
 *
 * ⚠️ CHỈ CHẠY FILE NÀY 1 LẦN DUY NHẤT KHI:
 * - Setup lần đầu
 * - Thay đổi webhook URL
 * - Chuyển từ ngrok sang domain production
 * KHÔNG CHẠY LẠI mỗi lần restart server!
 */

const axios = require("axios");
require("dotenv").config();

// PayOS configuration từ .env
const clientId = "99e81be5-7170-43dc-b87a-66062bb4a530";
const apiKey = "ec43e303-8879-4b1c-ac4c-0c10b533fd86";

// Webhook URL - sử dụng ngrok URL của bạn (cập nhật từ ảnh ngrok)
const webhookUrl = "https://871f0858b1c1.ngrok-free.app/api/payos/webhook";

console.log("🔧 Đăng ký webhook PayOS...");
console.log("📡 Webhook URL:", webhookUrl);
console.log("🔑 Client ID:", clientId);

// Kiểm tra webhook endpoint có accessible không
console.log("🧪 Kiểm tra webhook endpoint...");
axios
    .get(webhookUrl, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            "User-Agent": "PayOS-Webhook-Test",
        },
        timeout: 10000,
    })
    .then((response) => {
        console.log("✅ Webhook endpoint accessible");
    })
    .catch((error) => {
        if (error.response && error.response.status === 405) {
            console.log(
                "✅ Webhook endpoint accessible (405 Method Not Allowed is expected for GET request)"
            );
        } else {
            console.log("⚠️ Webhook endpoint test failed:", error.message);
            console.log("💡 Đảm bảo:");
            console.log("   1. Ngrok đang chạy: ngrok http 5002");
            console.log("   2. Backend server đang chạy trên port 5002");
            console.log("   3. URL webhook đúng format");
        }
    });

// Đăng ký webhook với PayOS
console.log("📝 Đăng ký webhook với PayOS...");
axios
    .post(
        "https://api-merchant.payos.vn/confirm-webhook",
        { webhookUrl },
        {
            headers: {
                "x-client-id": clientId,
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            timeout: 30000,
        }
    )
    .then((response) => {
        console.log("🎉 Đăng ký webhook thành công!");
        console.log("📊 Response:", response.data);
        console.log("");
        console.log("✅ Setup hoàn tất! PayOS sẽ gửi webhook tới:");
        console.log(`   ${webhookUrl}`);
        console.log("");
        console.log("🧪 Để test webhook:");
        console.log("   1. Tạo payment từ frontend");
        console.log("   2. Thực hiện thanh toán");
        console.log("   3. Kiểm tra console logs trong backend");
        console.log("   4. Kiểm tra PaymentHistory trong MongoDB");
    })
    .catch((error) => {
        console.log("❌ Lỗi đăng ký webhook!");

        if (error.response) {
            console.error("📛 Lỗi từ PayOS API:", error.response.data);
            console.error("📊 Status code:", error.response.status);

            if (error.response.status === 400) {
                console.log(
                    "💡 Có thể webhook URL đã được đăng ký rồi hoặc không hợp lệ"
                );
            }
        } else if (error.code === "ECONNABORTED") {
            console.error(
                "⏰ Timeout - PayOS không thể kết nối tới webhook URL"
            );
            console.log("💡 Kiểm tra lại:");
            console.log("   1. Ngrok có đang chạy không?");
            console.log(
                "   2. Backend server có đang chạy trên port 5002 không?"
            );
            console.log("   3. URL webhook có đúng không?");
            console.log("   4. Firewall có block không?");
        } else {
            console.error("🌐 Lỗi kết nối:", error.message);
        }

        console.log("");
        console.log("🔧 Troubleshooting:");
        console.log("   1. Kiểm tra ngrok: ngrok http 5002");
        console.log("   2. Kiểm tra backend: npm run dev");
        console.log("   3. Test manual: curl -X POST " + webhookUrl);
        console.log("   4. Kiểm tra PayOS credentials trong .env");
    });

// Log configuration for debugging
console.log("");
console.log("🔍 Debug info:");
console.log("   - Webhook URL:", webhookUrl);
console.log(
    "   - Client ID:",
    clientId ? clientId.substring(0, 8) + "..." : "MISSING"
);
console.log(
    "   - API Key:",
    apiKey ? apiKey.substring(0, 8) + "..." : "MISSING"
);
console.log("   - Node version:", process.version);
console.log("   - Platform:", process.platform);
