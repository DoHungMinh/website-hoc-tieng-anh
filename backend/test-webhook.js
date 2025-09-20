/**
 * Test PayOS Webhook
 * Gửi test webhook request để kiểm tra
 */

const axios = require("axios");

const webhookUrl = "https://871f0858b1c1.ngrok-free.app/api/payos/webhook";

const testWebhookData = {
    orderCode: 6097450378, // Sử dụng payment có sẵn trong MongoDB
    amount: 10000,
    description: "68cc3761356bbc6bb69620b1", // courseId có sẵn
    status: "PAID",
    currency: "VND",
    paidAt: new Date().toISOString(),
};

console.log("🧪 Testing PayOS Webhook...");
console.log("📡 URL:", webhookUrl);
console.log("📊 Data:", JSON.stringify(testWebhookData, null, 2));

axios
    .post(webhookUrl, testWebhookData, {
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "User-Agent": "PayOS-Test-Webhook",
        },
        timeout: 10000,
    })
    .then((response) => {
        console.log("✅ Webhook test thành công!");
        console.log("📊 Status:", response.status);
        console.log("📄 Response:", response.data);
    })
    .catch((error) => {
        console.log("❌ Webhook test failed!");
        if (error.response) {
            console.log("📛 Status:", error.response.status);
            console.log("📄 Response:", error.response.data);
        } else {
            console.log("🌐 Error:", error.message);
        }
    });
