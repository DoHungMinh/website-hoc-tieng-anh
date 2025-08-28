import { Router, Request, Response } from "express";
import { User } from "../../models/User";
import { authenticateToken, requireAdmin } from "../../middleware/auth";

const router = Router();

// GET /api/admin/statistics/overview - Thống kê tổng quan như trong giao diện
router.get(
    "/overview",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            // Tổng người dùng
            const totalUsers = await User.countDocuments();

            // Tính người dùng mới trong tháng hiện tại
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const newUsersThisMonth = await User.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính người dùng mới trong tháng trước
            const previousMonth = new Date(currentMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const newUsersPreviousMonth = await User.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng
            let userGrowthRate = 0;
            if (newUsersPreviousMonth > 0) {
                userGrowthRate = Math.round(
                    ((newUsersThisMonth - newUsersPreviousMonth) /
                        newUsersPreviousMonth) *
                        100
                );
            } else if (newUsersThisMonth > 0) {
                userGrowthRate = 100;
            }

            // Khóa học hoạt động (mock data - có thể thay thế bằng Course model)
            const activeCourses = 47;
            const courseGrowthRate = 3;

            // Đề thi (mock data - có thể thay thế bằng Test/Exam model)
            const totalExams = 156;
            const examGrowthRate = 8;

            // Doanh thu tháng (mock data - cần model Payment/Revenue)
            const monthlyRevenue = 245000000; // 245M VNĐ
            const revenueGrowthRate = 15;

            // Người dùng hoạt động (đăng nhập trong 30 ngày qua)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeUsers = await User.countDocuments({
                lastSeen: { $gte: thirtyDaysAgo },
            });

            const activeUserGrowthRate = 5; // Mock rate

            // Tỷ lệ hoàn thành (mock data)
            const completionRate = 87;
            const completionGrowthRate = 2;

            res.json({
                success: true,
                data: {
                    totalUsers: {
                        value: totalUsers,
                        growth: userGrowthRate,
                        display: totalUsers.toLocaleString(),
                    },
                    activeCourses: {
                        value: activeCourses,
                        growth: courseGrowthRate,
                        display: activeCourses.toString(),
                    },
                    totalExams: {
                        value: totalExams,
                        growth: examGrowthRate,
                        display: totalExams.toString(),
                    },
                    monthlyRevenue: {
                        value: monthlyRevenue,
                        growth: revenueGrowthRate,
                        display: `${Math.round(monthlyRevenue / 1000000)}M VNĐ`,
                    },
                    activeUsers: {
                        value: activeUsers,
                        growth: activeUserGrowthRate,
                        display: activeUsers.toLocaleString(),
                    },
                    completionRate: {
                        value: completionRate,
                        growth: completionGrowthRate,
                        display: `${completionRate}%`,
                    },
                },
            });
        } catch (error) {
            console.error("Error fetching overview statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tổng quan",
            });
        }
    }
);

// GET /api/admin/statistics/users - Thống kê người dùng chi tiết
router.get(
    "/users",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const totalUsers = await User.countDocuments();

            // Thống kê theo tháng (12 tháng gần nhất)
            const monthlyStats = [];
            for (let i = 11; i >= 0; i--) {
                const monthStart = new Date();
                monthStart.setMonth(monthStart.getMonth() - i);
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);

                const monthlyCount = await User.countDocuments({
                    createdAt: {
                        $gte: monthStart,
                        $lt: monthEnd,
                    },
                });

                monthlyStats.push({
                    month: monthStart.toLocaleDateString("vi-VN", {
                        month: "short",
                        year: "numeric",
                    }),
                    count: monthlyCount,
                    timestamp: monthStart.getTime(),
                });
            }

            // Phân bố theo vai trò
            const usersByRole = await User.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Phân bố theo trình độ
            const usersByLevel = await User.aggregate([
                {
                    $group: {
                        _id: "$level",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Phân bố theo trạng thái
            const usersByStatus = await User.aggregate([
                {
                    $group: {
                        _id: "$accountStatus",
                        count: { $sum: 1 },
                    },
                },
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    monthlyStats,
                    usersByRole: usersByRole.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                    usersByLevel: usersByLevel.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                    usersByStatus: usersByStatus.reduce((acc, curr) => {
                        acc[curr._id] = curr.count;
                        return acc;
                    }, {} as Record<string, number>),
                },
            });
        } catch (error) {
            console.error("Error fetching user statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê người dùng",
            });
        }
    }
);

export default router;
