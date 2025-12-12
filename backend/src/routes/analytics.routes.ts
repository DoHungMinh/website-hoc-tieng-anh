import { Router, Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { User } from "../models/User";
import Course from "../models/Course";
import { IELTSExam } from "../models/IELTSExam";
import Enrollment from "../models/Enrollment";

const router = Router();

// =================================================================
// HELPER FUNCTIONS
// =================================================================

// Helper function to calculate time relative
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return "Vừa xong";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else {
        return new Date(date).toLocaleDateString("vi-VN");
    }
}

// =================================================================
// ADMIN STATISTICS ROUTES (Admin only)
// =================================================================

// GET /api/admin/statistics/overview - Overview statistics
router.get(
    "/overview",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const { period = "month" } = req.query;

            // Total users
            const totalUsers = await User.countDocuments();

            // Calculate new users this month
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const newUsersThisMonth = await User.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Calculate new users previous month
            const previousMonth = new Date(currentMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const newUsersPreviousMonth = await User.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Calculate user growth rate
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

            // Total courses
            const totalCourses = await Course.countDocuments();

            // Calculate new courses this month
            const newCoursesThisMonth = await Course.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Calculate new courses previous month
            const newCoursesPreviousMonth = await Course.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Calculate course growth rate
            let courseGrowthRate = 0;
            if (newCoursesPreviousMonth > 0) {
                courseGrowthRate = Math.round(
                    ((newCoursesThisMonth - newCoursesPreviousMonth) /
                        newCoursesPreviousMonth) *
                        100
                );
            } else if (newCoursesThisMonth > 0) {
                courseGrowthRate = 100;
            }

            // Total exams
            const totalExams = await IELTSExam.countDocuments();

            // Calculate new exams this month
            const newExamsThisMonth = await IELTSExam.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Calculate new exams previous month
            const newExamsPreviousMonth = await IELTSExam.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Calculate exam growth rate
            let examGrowthRate = 0;
            if (newExamsPreviousMonth > 0) {
                examGrowthRate = Math.round(
                    ((newExamsThisMonth - newExamsPreviousMonth) /
                        newExamsPreviousMonth) *
                        100
                );
            } else if (newExamsThisMonth > 0) {
                examGrowthRate = 100;
            }

            // Revenue from PaymentHistory based on selected period
            const PaymentHistory = require("../../payos/PaymentHistory");
            const now = new Date();
            let currentRevenue = 0;
            let previousRevenue = 0;
            let revenueLabel = "Doanh thu tháng";

            if (period === "week") {
                // Current week (Monday to Sunday)
                const today = new Date(now);
                const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

                const monday = new Date(today);
                monday.setDate(
                    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                );
                monday.setHours(0, 0, 0, 0);

                const nextMonday = new Date(monday);
                nextMonday.setDate(monday.getDate() + 7);

                // Previous week
                const prevMonday = new Date(monday);
                prevMonday.setDate(monday.getDate() - 7);

                const currentWeekPayments = await PaymentHistory.find({
                    createdAt: { $gte: monday, $lt: nextMonday },
                    status: "PAID",
                });

                const previousWeekPayments = await PaymentHistory.find({
                    createdAt: { $gte: prevMonday, $lt: monday },
                    status: "PAID",
                });

                currentRevenue = currentWeekPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                previousRevenue = previousWeekPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                revenueLabel = "Doanh thu tuần";
            } else if (period === "year") {
                // Current year
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

                // Previous year
                const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);

                const currentYearPayments = await PaymentHistory.find({
                    createdAt: { $gte: yearStart, $lt: nextYearStart },
                    status: "PAID",
                });

                const previousYearPayments = await PaymentHistory.find({
                    createdAt: { $gte: prevYearStart, $lt: yearStart },
                    status: "PAID",
                });

                currentRevenue = currentYearPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                previousRevenue = previousYearPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                revenueLabel = "Doanh thu năm";
            } else {
                // Default: Current month
                const thisMonthStart = new Date(currentMonth);
                const nextMonthStart = new Date(currentMonth);
                nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

                const previousMonthStart = new Date(previousMonth);

                const thisMonthPayments = await PaymentHistory.find({
                    createdAt: { $gte: thisMonthStart, $lt: nextMonthStart },
                    status: "PAID",
                });

                const previousMonthPayments = await PaymentHistory.find({
                    createdAt: {
                        $gte: previousMonthStart,
                        $lt: thisMonthStart,
                    },
                    status: "PAID",
                });

                currentRevenue = thisMonthPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                previousRevenue = previousMonthPayments.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0
                );
                revenueLabel = "Doanh thu tháng";
            }

            // Calculate revenue growth rate
            let revenueGrowthRate = 0;
            if (previousRevenue > 0) {
                revenueGrowthRate = Math.round(
                    ((currentRevenue - previousRevenue) / previousRevenue) * 100
                );
            } else if (currentRevenue > 0) {
                revenueGrowthRate = 100;
            }

            // Active users (logged in within 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeUsers = await User.countDocuments({
                lastSeen: { $gte: thirtyDaysAgo },
            });

            const activeUserGrowthRate = 5; // Mock rate

            // Completion rate (mock data)
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
                        value: totalCourses,
                        growth: courseGrowthRate,
                        display: totalCourses.toString(),
                    },
                    totalExams: {
                        value: totalExams,
                        growth: examGrowthRate,
                        display: totalExams.toString(),
                    },
                    monthlyRevenue: {
                        value: currentRevenue,
                        growth: revenueGrowthRate,
                        display:
                            currentRevenue >= 1000000
                                ? `${(currentRevenue / 1000000).toFixed(1)}M VNĐ`
                                : currentRevenue >= 1000
                                ? `${(currentRevenue / 1000).toFixed(0)}K VNĐ`
                                : `${currentRevenue.toLocaleString()} VNĐ`,
                        label: revenueLabel,
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

// GET /api/admin/statistics/users - Detailed user statistics
router.get(
    "/users",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const totalUsers = await User.countDocuments();

            // Monthly stats (last 12 months)
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

            // Distribution by role
            const usersByRole = await User.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Distribution by level
            const usersByLevel = await User.aggregate([
                {
                    $group: {
                        _id: "$level",
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Distribution by status
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

// GET /api/admin/statistics/realtime - Real-time statistics
router.get(
    "/realtime",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const now = new Date();

            // Currently online users
            const onlineUsers = await User.countDocuments({
                isOnline: true,
            });

            // Users accessed in last 5 minutes
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            const recentVisitors = await User.countDocuments({
                lastSeen: { $gte: fiveMinutesAgo },
            });

            // Users accessed in last hour
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const visitorsLastHour = await User.countDocuments({
                lastSeen: { $gte: oneHourAgo },
            });

            // Users accessed today
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const visitorsToday = await User.countDocuments({
                lastSeen: { $gte: startOfDay },
            });

            res.json({
                success: true,
                data: {
                    onlineUsers,
                    recentVisitors,
                    visitorsLastHour,
                    visitorsToday,
                    timestamp: now.toISOString(),
                },
            });
        } catch (error) {
            console.error("Error fetching realtime statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê real-time",
            });
        }
    }
);

// GET /api/admin/statistics/user-growth - User growth statistics
router.get(
    "/user-growth",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const { period = "month" } = req.query;
            const now = new Date();
            const growthData = [];

            if (period === "week") {
                // Last 7 days in current week
                const today = new Date(now);
                const dayOfWeek = today.getDay();

                // Calculate Monday of current week
                const monday = new Date(today);
                monday.setDate(
                    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                );
                monday.setHours(0, 0, 0, 0);

                const weekDays = [
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "Chủ nhật",
                ];

                for (let i = 0; i < 7; i++) {
                    const dayStart = new Date(monday);
                    dayStart.setDate(monday.getDate() + i);
                    dayStart.setHours(0, 0, 0, 0);

                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    const dailyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: dayStart,
                            $lt: dayEnd,
                        },
                    });

                    growthData.push({
                        name: weekDays[i],
                        users: dailyUsers,
                        fullDate: dayStart.toLocaleDateString("vi-VN"),
                        date: dayStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "month") {
                // Last 12 months
                for (let i = 11; i >= 0; i--) {
                    const monthStart = new Date(now);
                    monthStart.setMonth(monthStart.getMonth() - i);
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);

                    const monthEnd = new Date(monthStart);
                    monthEnd.setMonth(monthEnd.getMonth() + 1);

                    const monthlyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: monthStart,
                            $lt: monthEnd,
                        },
                    });

                    const monthNumber = monthStart.getMonth() + 1;
                    const year = monthStart.getFullYear();
                    const currentYear = now.getFullYear();

                    let displayName = `T${monthNumber}`;
                    if (year !== currentYear) {
                        displayName = `T${monthNumber}/${year
                            .toString()
                            .slice(-2)}`;
                    }

                    growthData.push({
                        name: displayName,
                        users: monthlyUsers,
                        fullDate: monthStart.toLocaleDateString("vi-VN", {
                            month: "long",
                            year: "numeric",
                        }),
                        date: monthStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "year") {
                // Last 5 years
                for (let i = 4; i >= 0; i--) {
                    const yearStart = new Date(now);
                    yearStart.setFullYear(yearStart.getFullYear() - i);
                    yearStart.setMonth(0, 1);
                    yearStart.setHours(0, 0, 0, 0);

                    const yearEnd = new Date(yearStart);
                    yearEnd.setFullYear(yearEnd.getFullYear() + 1);

                    const yearlyUsers = await User.countDocuments({
                        createdAt: {
                            $gte: yearStart,
                            $lt: yearEnd,
                        },
                    });

                    growthData.push({
                        name: yearStart.getFullYear().toString(),
                        users: yearlyUsers,
                        fullDate: `Năm ${yearStart.getFullYear()}`,
                        date: yearStart.toISOString().split("T")[0],
                    });
                }
            }

            res.json({
                success: true,
                data: {
                    period,
                    growthData,
                    totalPeriods: growthData.length,
                },
            });
        } catch (error) {
            console.error("Error fetching user growth statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê tăng trưởng người dùng",
            });
        }
    }
);

// GET /api/admin/statistics/recent-activities - Recent activities
router.get(
    "/recent-activities",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const activities = [];

            // Get new users (last 5)
            const newUsers = await User.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName email createdAt");

            for (const user of newUsers) {
                activities.push({
                    type: "user_register",
                    action: `<strong>${
                        user.fullName || user.email
                    }</strong> đã đăng ký tài khoản`,
                    time: user.createdAt,
                    icon: "Users",
                    color: "bg-green-500",
                });
            }

            // Get new courses (last 3)
            const newCourses = await Course.find({})
                .sort({ createdAt: -1 })
                .limit(3)
                .select("title createdAt");

            for (const course of newCourses) {
                activities.push({
                    type: "course_created",
                    action: `Khóa học <strong>${course.title}</strong> đã được tạo`,
                    time: course.createdAt,
                    icon: "BookOpen",
                    color: "bg-blue-500",
                });
            }

            // Get new exams (last 2)
            const newExams = await IELTSExam.find({})
                .sort({ createdAt: -1 })
                .limit(2)
                .select("title createdAt");

            for (const exam of newExams) {
                activities.push({
                    type: "exam_created",
                    action: `Đề thi <strong>${exam.title}</strong> đã được tạo`,
                    time: exam.createdAt,
                    icon: "FileText",
                    color: "bg-yellow-500",
                });
            }

            // Get recent enrollments (last 5)
            const recentEnrollments = await Enrollment.find({})
                .sort({ enrolledAt: -1 })
                .limit(5)
                .populate("userId", "fullName email")
                .populate("courseId", "title");

            for (const enrollment of recentEnrollments) {
                const user = enrollment.userId as any;
                const course = enrollment.courseId as any;
                if (user && course) {
                    activities.push({
                        type: "course_purchased",
                        action: `<strong>${
                            user.fullName || user.email
                        }</strong> đã mua khóa học <strong>${
                            course.title
                        }</strong>`,
                        time: enrollment.enrolledAt,
                        icon: "DollarSign",
                        color: "bg-purple-500",
                    });
                }
            }

            // Sort by time and limit
            const sortedActivities = activities
                .sort(
                    (a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                )
                .slice(0, limit)
                .map((activity) => ({
                    ...activity,
                    timeAgo: getTimeAgo(activity.time),
                }));

            res.json({
                success: true,
                data: {
                    activities: sortedActivities,
                    total: sortedActivities.length,
                },
            });
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy hoạt động gần đây",
            });
        }
    }
);

// GET /api/admin/statistics/revenue - Revenue statistics
router.get(
    "/revenue",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const { period = "month" } = req.query;
            const PaymentHistory = require("../../payos/PaymentHistory");
            const now = new Date();
            const revenueData = [];

            if (period === "week") {
                // Last 7 days
                const today = new Date(now);
                const dayOfWeek = today.getDay();

                const monday = new Date(today);
                monday.setDate(
                    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                );
                monday.setHours(0, 0, 0, 0);

                const weekDays = [
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "Chủ nhật",
                ];

                for (let i = 0; i < 7; i++) {
                    const dayStart = new Date(monday);
                    dayStart.setDate(monday.getDate() + i);
                    dayStart.setHours(0, 0, 0, 0);

                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    const dailyPayments = await PaymentHistory.find({
                        createdAt: { $gte: dayStart, $lt: dayEnd },
                        status: "PAID",
                    });

                    const dailyRevenue = dailyPayments.reduce(
                        (sum: number, payment: any) => sum + payment.amount,
                        0
                    );

                    revenueData.push({
                        name: weekDays[i],
                        revenue: dailyRevenue / 1000000, // Convert to millions
                        fullDate: dayStart.toLocaleDateString("vi-VN"),
                        date: dayStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "month") {
                // Last 12 months
                for (let i = 11; i >= 0; i--) {
                    const monthStart = new Date(now);
                    monthStart.setMonth(monthStart.getMonth() - i);
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);

                    const monthEnd = new Date(monthStart);
                    monthEnd.setMonth(monthEnd.getMonth() + 1);

                    const monthlyPayments = await PaymentHistory.find({
                        createdAt: { $gte: monthStart, $lt: monthEnd },
                        status: "PAID",
                    });

                    const monthlyRevenue = monthlyPayments.reduce(
                        (sum: number, payment: any) => sum + payment.amount,
                        0
                    );

                    const monthNumber = monthStart.getMonth() + 1;
                    const year = monthStart.getFullYear();
                    const currentYear = now.getFullYear();

                    let displayName = `T${monthNumber}`;
                    if (year !== currentYear) {
                        displayName = `T${monthNumber}/${year
                            .toString()
                            .slice(-2)}`;
                    }

                    revenueData.push({
                        name: displayName,
                        revenue: monthlyRevenue / 1000000,
                        fullDate: monthStart.toLocaleDateString("vi-VN", {
                            month: "long",
                            year: "numeric",
                        }),
                        date: monthStart.toISOString().split("T")[0],
                    });
                }
            } else if (period === "year") {
                // Last 5 years
                for (let i = 4; i >= 0; i--) {
                    const yearStart = new Date(now);
                    yearStart.setFullYear(yearStart.getFullYear() - i);
                    yearStart.setMonth(0, 1);
                    yearStart.setHours(0, 0, 0, 0);

                    const yearEnd = new Date(yearStart);
                    yearEnd.setFullYear(yearEnd.getFullYear() + 1);

                    const yearlyPayments = await PaymentHistory.find({
                        createdAt: { $gte: yearStart, $lt: yearEnd },
                        status: "PAID",
                    });

                    const yearlyRevenue = yearlyPayments.reduce(
                        (sum: number, payment: any) => sum + payment.amount,
                        0
                    );

                    revenueData.push({
                        name: yearStart.getFullYear().toString(),
                        revenue: yearlyRevenue / 1000000,
                        fullDate: `Năm ${yearStart.getFullYear()}`,
                        date: yearStart.toISOString().split("T")[0],
                    });
                }
            }

            res.json({
                success: true,
                data: {
                    period,
                    revenueData,
                    totalPeriods: revenueData.length,
                },
            });
        } catch (error) {
            console.error("Error fetching revenue statistics:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê doanh thu",
            });
        }
    }
);

export default router;
