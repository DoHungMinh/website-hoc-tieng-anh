import React, { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    FileText,
    DollarSign,
    TrendingUp,
    Activity,
} from "lucide-react";

interface StatItem {
    value: number;
    growth: number;
    display: string;
}

interface OverviewData {
    totalUsers: StatItem;
    totalCourses: StatItem;
    totalExams: StatItem;
    monthlyRevenue: StatItem;
    activeUsers: StatItem;
    completionRate: StatItem;
}

const DashboardStats: React.FC = () => {
    const [stats, setStats] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOverviewStats();
    }, []);

    const fetchOverviewStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Chưa đăng nhập");
                return;
            }

            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:5002"
                }/admin/statistics/overview`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể tải thống kê");
            }

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.message || "Lỗi khi tải thống kê");
            }
        } catch (error) {
            console.error("Error fetching overview stats:", error);
            setError("Không thể kết nối đến server");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl"
                        >
                            <div className="animate-pulse">
                                <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                                <div className="w-1/2 h-8 mb-2 bg-gray-200 rounded"></div>
                                <div className="w-1/3 h-3 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchOverviewStats}
                    className="px-4 py-2 mt-2 text-white bg-red-600 rounded hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!stats) return null;

    // Tạo array stats theo đúng thứ tự trong giao diện
    const displayStats = [
        {
            title: "Tổng số người dùng",
            value: stats.totalUsers.display,
            change: `+${stats.totalUsers.growth}%`,
            changeType: stats.totalUsers.growth >= 0 ? "increase" : "decrease",
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Tổng số người dùng đang hoạt động",
            value: stats.activeUsers.display,
            change: `+${stats.activeUsers.growth}%`,
            changeType: stats.activeUsers.growth >= 0 ? "increase" : "decrease",
            icon: Activity,
            color: "bg-indigo-500",
        },
        {
            title: "Đề thi",
            value: stats.totalExams.display,
            change: `+${stats.totalExams.growth}`,
            changeType: stats.totalExams.growth >= 0 ? "increase" : "decrease",
            icon: FileText,
            color: "bg-yellow-500",
        },
        {
            title: "Doanh thu tháng",
            value: stats.monthlyRevenue.display,
            change: `+${stats.monthlyRevenue.growth}%`,
            changeType:
                stats.monthlyRevenue.growth >= 0 ? "increase" : "decrease",
            icon: DollarSign,
            color: "bg-purple-500",
        },
        {
            title: "Tổng số khóa học",
            value: stats.totalCourses.display,
            change: `+${stats.totalCourses.growth}`,
            changeType:
                stats.totalCourses.growth >= 0 ? "increase" : "decrease",
            icon: BookOpen,
            color: "bg-green-500",
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: stats.completionRate.display,
            change: `+${stats.completionRate.growth}%`,
            changeType:
                stats.completionRate.growth >= 0 ? "increase" : "decrease",
            icon: TrendingUp,
            color: "bg-pink-500",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                    <p
                                        className={`text-sm mt-1 ${
                                            stat.changeType === "increase"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {stat.change} so với tháng trước
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Tăng trưởng người dùng
                    </h3>
                    <div className="flex items-center justify-center h-64 rounded-lg bg-gray-50">
                        <p className="text-gray-500">
                            Biểu đồ sẽ được hiển thị ở đây
                        </p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Doanh thu theo tháng
                    </h3>
                    <div className="flex items-center justify-center h-64 rounded-lg bg-gray-50">
                        <p className="text-gray-500">
                            Biểu đồ sẽ được hiển thị ở đây
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Hoạt động gần đây
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="flex items-center py-2 space-x-3"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                    Người dùng mới đăng ký
                                </p>
                                <p className="text-xs text-gray-500">
                                    2 phút trước
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
