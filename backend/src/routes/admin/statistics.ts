import { Router, Request, Response } from "express";
import { User } from "../../models/User";
import Course from "../../models/Course";
import { IELTSExam } from "../../models/IELTSExam";
import Enrollment from "../../models/Enrollment";
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

            // Tổng số khóa học (real data from Course model)
            const totalCourses = await Course.countDocuments();

            // Tính số khóa học tạo trong tháng hiện tại
            const newCoursesThisMonth = await Course.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính số khóa học tạo trong tháng trước
            const newCoursesPreviousMonth = await Course.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng khóa học
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

            // Tổng số đề thi (real data from IELTSExam model)
            const totalExams = await IELTSExam.countDocuments();

            // Tính số đề thi tạo trong tháng hiện tại
            const newExamsThisMonth = await IELTSExam.countDocuments({
                createdAt: { $gte: currentMonth },
            });

            // Tính số đề thi tạo trong tháng trước
            const newExamsPreviousMonth = await IELTSExam.countDocuments({
                createdAt: {
                    $gte: previousMonth,
                    $lt: currentMonth,
                },
            });

            // Tính tỷ lệ tăng trưởng đề thi
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

            // Doanh thu thực tế từ enrollments và course prices
            // Tháng này (từ đầu tháng đến cuối tháng)
            const thisMonthStart = new Date(currentMonth);
            const nextMonthStart = new Date(currentMonth);
            nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

            const previousMonthStart = new Date(previousMonth);

            const thisMonthEnrollments = await Enrollment.find({
                enrolledAt: { $gte: thisMonthStart, $lt: nextMonthStart },
            }).populate("courseId");

            const previousMonthEnrollments = await Enrollment.find({
                enrolledAt: { $gte: previousMonthStart, $lt: thisMonthStart },
            }).populate("courseId");

            // Tính doanh thu tháng này
            let monthlyRevenue = 0;
            for (const enrollment of thisMonthEnrollments) {
                if (enrollment.courseId && (enrollment.courseId as any).price) {
                    monthlyRevenue += (enrollment.courseId as any).price;
                }
            }

            // Tính doanh thu tháng trước
            let previousMonthRevenue = 0;
            for (const enrollment of previousMonthEnrollments) {
                if (enrollment.courseId && (enrollment.courseId as any).price) {
                    previousMonthRevenue += (enrollment.courseId as any).price;
                }
            }

            // Tính tỷ lệ tăng trưởng doanh thu
            let revenueGrowthRate = 0;
            if (previousMonthRevenue > 0) {
                revenueGrowthRate = Math.round(
                    ((monthlyRevenue - previousMonthRevenue) /
                        previousMonthRevenue) *
                        100
                );
            } else if (monthlyRevenue > 0) {
                revenueGrowthRate = 100;
            }

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

// GET /api/admin/statistics/realtime - Thống kê real-time
router.get(
    "/realtime",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const now = new Date();

            // Người dùng online hiện tại (isOnline = true)
            const onlineUsers = await User.countDocuments({
                isOnline: true,
            });

            // Người dùng truy cập trong 5 phút qua
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            const recentVisitors = await User.countDocuments({
                lastSeen: { $gte: fiveMinutesAgo },
            });

            // Người dùng truy cập trong 1 giờ qua
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const visitorsLastHour = await User.countDocuments({
                lastSeen: { $gte: oneHourAgo },
            });

            // Người dùng truy cập trong ngày hôm nay
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const visitorsToday = await User.countDocuments({
                lastSeen: { $gte: startOfDay },
            });

            res.json({
                success: true,
                data: {
                    onlineUsers,
                    recentVisitors, // 5 phút qua
                    visitorsLastHour, // 1 giờ qua
                    visitorsToday, // hôm nay
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

// GET /api/admin/statistics/user-growth - Thống kê tăng trưởng người dùng theo tuần/tháng/năm
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
                // Lấy dữ liệu 7 ngày gần nhất trong tuần hiện tại
                const today = new Date(now);
                const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

                // Tính ngày đầu tuần (Thứ 2)
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
                // Lấy dữ liệu 12 tháng gần nhất
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

                    // Tạo tên tháng ngắn gọn
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
                // Lấy dữ liệu 5 năm gần nhất
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

            // Debug log để kiểm tra dữ liệu
            console.log(
                `User growth data for ${period}:`,
                growthData.map((d) => ({
                    name: d.name,
                    users: d.users,
                    fullDate: d.fullDate,
                }))
            );

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

// GET /api/admin/statistics/recent-activities - Hoạt động gần đây
router.get(
    "/recent-activities",
    authenticateToken,
    requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const activities = [];

            // Lấy người dùng mới đăng ký (10 người gần nhất)
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

            // Lấy khóa học mới được tạo (5 khóa gần nhất)
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

            // Lấy đề thi mới được tạo (3 đề gần nhất)
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

            // Lấy giao dịch mua khóa học gần nhất (5 giao dịch)
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

            // Sắp xếp theo thời gian và lấy số lượng yêu cầu
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

// Helper function để tính thời gian tương đối
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

export default router;
