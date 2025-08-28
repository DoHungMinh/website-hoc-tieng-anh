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
    activeCourses: StatItem;
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchOverviewStats}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
            title: "Tổng người dùng",
            value: stats.totalUsers.display,
            change: `+${stats.totalUsers.growth}%`,
            changeType: stats.totalUsers.growth >= 0 ? "increase" : "decrease",
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Khóa học hoạt động",
            value: stats.activeCourses.display,
            change: `+${stats.activeCourses.growth}`,
            changeType:
                stats.activeCourses.growth >= 0 ? "increase" : "decrease",
            icon: BookOpen,
            color: "bg-green-500",
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
            title: "Người dùng hoạt động",
            value: stats.activeUsers.display,
            change: `+${stats.activeUsers.growth}%`,
            changeType: stats.activeUsers.growth >= 0 ? "increase" : "decrease",
            icon: Activity,
            color: "bg-indigo-500",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
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
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Tăng trưởng người dùng
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">
                            Biểu đồ sẽ được hiển thị ở đây
                        </p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Doanh thu theo tháng
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">
                            Biểu đồ sẽ được hiển thị ở đây
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hoạt động gần đây
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="flex items-center space-x-3 py-2"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
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
