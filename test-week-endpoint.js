// Test script để gọi week endpoint trực tiếp
async function testWeekEndpoint() {
    try {
        console.log("🧪 Testing /api/payments/stats/week endpoint...");

        // Note: Cần token thật để test, ở đây test without auth
        const response = await fetch(
            "http://localhost:5002/api/payments/stats/week",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // 'Authorization': 'Bearer YOUR_REAL_TOKEN_HERE'
                },
            }
        );

        console.log("📊 Response status:", response.status);
        console.log(
            "📊 Response headers:",
            Object.fromEntries(response.headers.entries())
        );

        const data = await response.text();
        console.log("📊 Response body:", data);

        if (response.status === 401) {
            console.log("❌ Unauthorized - Cần token để test endpoint này");
            console.log(
                "💡 Hãy truy cập PaymentManagement trong browser để test với token thật"
            );
        }
    } catch (error) {
        console.error("❌ Error calling endpoint:", error);
    }
}

testWeekEndpoint();
