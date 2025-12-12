import { Router, Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// =================================================================
// PAYOS PAYMENT ROUTES
// =================================================================

// PayOS success callback (for course purchases)
router.get("/payos/success", async (req: Request, res: Response) => {
    try {
        const { orderCode, status } = req.query;

        console.log("📬 PayOS callback received:", { orderCode, status });

        if (status === "PAID") {
            console.log(
                `✅ Payment successful for order: ${orderCode}`
            );

            // Redirect to success page (frontend will handle enrollment update)
            res.redirect(
                `${process.env.FRONTEND_URL || "http://localhost:5173"
                }/payment/success?orderCode=${orderCode}`
            );
        } else {
            console.log(`❌ Payment failed for order: ${orderCode}`);
            res.redirect(
                `${process.env.FRONTEND_URL || "http://localhost:5173"
                }/payment/failed?orderCode=${orderCode}`
            );
        }
    } catch (error: any) {
        console.error("❌ PayOS callback error:", error);
        res.redirect(
            `${process.env.FRONTEND_URL || "http://localhost:5173"
            }/payment/failed`
        );
    }
});

// =================================================================
// PAYMENT HISTORY ROUTES (Admin only)
// =================================================================

// Get payment history for admin
router.get(
    "/history",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");
            const {
                status,
                startDate,
                endDate,
                page = 1,
                limit = 20,
            } = req.query;

            // Build filter
            const filter: any = {};
            if (status && status !== "all") filter.status = status;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) {
                    // User input is in Vietnam timezone - convert to UTC for MongoDB
                    // startDate = "2025-09-14" means 00:00 14/09/2025 Vietnam time
                    const start = new Date(
                        (startDate as string) + "T00:00:00.000+07:00"
                    );
                    filter.createdAt.$gte = start;
                }
                if (endDate) {
                    // endDate = "2025-09-21" means 23:59 21/09/2025 Vietnam time
                    const end = new Date(
                        (endDate as string) + "T23:59:59.999+07:00"
                    );
                    filter.createdAt.$lte = end;
                }
            }

            // Pagination
            const skip = (Number(page) - 1) * Number(limit);

            // Get payments with populated data
            const payments = await PaymentHistory.find(filter)
                .populate("courseId", "title type level price")
                .populate("userId", "fullName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));

            const total = await PaymentHistory.countDocuments(filter);
            const stats = await PaymentHistory.getPaymentStats();

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        current: Number(page),
                        pages: Math.ceil(total / Number(limit)),
                        total,
                    },
                    statistics: stats,
                },
            });
        } catch (error: any) {
            console.error("❌ Get payment history error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy lịch sử thanh toán",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get payment statistics for admin dashboard
router.get(
    "/stats",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");
            const stats = await PaymentHistory.getPaymentStats();
            const recentPayments = await PaymentHistory.getRecentPayments(5);

            res.json({
                success: true,
                data: {
                    overall: stats,
                    recent: recentPayments,
                },
            });
        } catch (error: any) {
            console.error("❌ Get payment stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê thanh toán",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get today's payment statistics
router.get(
    "/stats/today",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get today's payments
            const todayPayments = await PaymentHistory.find({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow,
                },
            });

            const todayRevenue = todayPayments
                .filter((payment: any) => payment.status === "PAID")
                .reduce((sum: number, payment: any) => sum + payment.amount, 0);

            const todayTransactions = todayPayments.length;

            res.json({
                success: true,
                data: {
                    todayRevenue,
                    todayTransactions,
                },
            });
        } catch (error: any) {
            console.error("❌ Get today stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê hôm nay",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get month's payment statistics
router.get(
    "/stats/month",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            const now = new Date();
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

            // Get this month's payments
            const monthPayments = await PaymentHistory.find({
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
            });

            const monthRevenue = monthPayments
                .filter((payment: any) => payment.status === "PAID")
                .reduce((sum: number, payment: any) => sum + payment.amount, 0);

            res.json({
                success: true,
                data: {
                    monthRevenue,
                },
            });
        } catch (error: any) {
            console.error("❌ Get month stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tháng",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get week's payment statistics (Monday to Sunday)
router.get(
    "/stats/week",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            // Sử dụng Vietnam timezone (UTC+7) để tính tuần chính xác
            const now = new Date();
            console.log(`🕐 Current server time: ${now.toString()}`);

            // Tính ngày thứ 2 của tuần hiện tại (start of week) theo Vietnam time
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - daysFromMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            // Tính Chủ nhật (end of week)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            console.log(
                `📅 Week range (Vietnam time): ${startOfWeek.toLocaleString(
                    "vi-VN"
                )} → ${endOfWeek.toLocaleString("vi-VN")}`
            );
            console.log(
                `📅 Week range (UTC): ${startOfWeek.toISOString()} → ${endOfWeek.toISOString()}`
            );

            // Get this week's payments (Monday to Sunday)
            const weekPayments = await PaymentHistory.find({
                createdAt: {
                    $gte: startOfWeek,
                    $lte: endOfWeek,
                },
            });

            console.log(
                `💳 Found ${weekPayments.length} total payments in current week`
            );

            // Log payment details for debugging
            if (weekPayments.length > 0) {
                console.log(`📋 Payment details:`);
                weekPayments.forEach((payment: any, index: number) => {
                    const paymentDate = new Date(payment.createdAt);
                    console.log(
                        `  ${index + 1}. ${paymentDate.toLocaleString(
                            "vi-VN"
                        )} - ${payment.amount} VNĐ - ${payment.status}`
                    );
                });
            }

            const paidPayments = weekPayments.filter(
                (payment: any) => payment.status === "PAID"
            );
            const weekRevenue = paidPayments.reduce(
                (sum: number, payment: any) => sum + payment.amount,
                0
            );

            console.log(
                `💰 Week revenue: ${weekRevenue} VNĐ from ${paidPayments.length} PAID payments (out of ${weekPayments.length} total)`
            );

            res.json({
                success: true,
                data: {
                    weekRevenue,
                    weekTransactions: weekPayments.length,
                    paidTransactions: paidPayments.length,
                    startDate: startOfWeek.toISOString(),
                    endDate: endOfWeek.toISOString(),
                    weekRange: {
                        start: startOfWeek.toLocaleString("vi-VN"),
                        end: endOfWeek.toLocaleString("vi-VN"),
                    },
                },
            });
        } catch (error: any) {
            console.error("❌ Get week stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tuần",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Get payment success rate statistics
router.get(
    "/stats/success-rate",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const PaymentHistory = require("../../payos/PaymentHistory");

            const totalPayments = await PaymentHistory.countDocuments();
            const successfulPayments = await PaymentHistory.countDocuments({
                status: "PAID",
            });

            const successRate =
                totalPayments > 0
                    ? (successfulPayments / totalPayments) * 100
                    : 0;

            res.json({
                success: true,
                data: {
                    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
                },
            });
        } catch (error: any) {
            console.error("❌ Get success rate stats error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy tỷ lệ thành công",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

export default router;
