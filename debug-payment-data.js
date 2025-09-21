// Debug script to check payment data
const mongoose = require("mongoose");

// Connect to MongoDB
const MONGODB_URI =
    "mongodb+srv://admin:KkYrONpUhiHPJD9u@ac-k48vuhr-shard-00-02.z6bkumx.mongodb.net/english_learning_web?retryWrites=true&w=majority";

async function debugPaymentData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Import PaymentHistory model
        const PaymentHistory = require("./backend/payos/PaymentHistory");

        console.log("\n=== PAYMENT DATA DEBUG ===");

        // Get all payments from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const allPayments = await PaymentHistory.find({
            createdAt: { $gte: thirtyDaysAgo },
        }).sort({ createdAt: -1 });

        console.log(`📊 Total payments in last 30 days: ${allPayments.length}`);

        if (allPayments.length > 0) {
            console.log("\n📋 Recent payments:");
            allPayments.slice(0, 10).forEach((payment, index) => {
                const date = new Date(payment.createdAt);
                const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
                    date.getDay()
                ];
                console.log(
                    `${index + 1}. ${dayName} ${date.toLocaleDateString(
                        "vi-VN"
                    )} - ${payment.amount} VNĐ - ${payment.status}`
                );
            });
        }

        // Test week calculation
        console.log("\n=== CURRENT WEEK CALCULATION ===");
        const now = new Date();
        console.log(`Current time: ${now.toString()}`);

        // Week calculation logic (same as backend)
        const currentDay = now.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        console.log(
            `Week range: ${startOfWeek.toISOString()} → ${endOfWeek.toISOString()}`
        );

        // Get current week payments
        const weekPayments = await PaymentHistory.find({
            createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek,
            },
        });

        console.log(`\n💰 This week's payments: ${weekPayments.length}`);
        weekPayments.forEach((payment, index) => {
            const date = new Date(payment.createdAt);
            const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
                date.getDay()
            ];
            console.log(
                `${index + 1}. ${dayName} ${date.toLocaleDateString(
                    "vi-VN"
                )} ${date.toLocaleTimeString("vi-VN")} - ${
                    payment.amount
                } VNĐ - ${payment.status}`
            );
        });

        const weekRevenue = weekPayments
            .filter((payment) => payment.status === "PAID")
            .reduce((sum, payment) => sum + payment.amount, 0);

        console.log(`\n🎯 Week revenue (PAID only): ${weekRevenue} VNĐ`);

        // Compare with month revenue
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        const monthPayments = await PaymentHistory.find({
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });

        const monthRevenue = monthPayments
            .filter((payment) => payment.status === "PAID")
            .reduce((sum, payment) => sum + payment.amount, 0);

        console.log(`\n📅 Month revenue (PAID only): ${monthRevenue} VNĐ`);
        console.log(`📊 Week vs Month: ${weekRevenue} vs ${monthRevenue}`);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
    }
}

debugPaymentData();
