import React, { useState, useEffect, useRef } from "react";
import {
    Users,
    BookOpen,
    FileText,
    DollarSign,
    Clock,
    Calendar,
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/constants";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { io, Socket } from "socket.io-client";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface StatItem {
    value: number;
    growth: number;
    display: string;
    label?: string; // Thêm label tùy chọn
}

interface OverviewData {
    totalUsers: StatItem;
    activeCourses: StatItem;
    totalExams: StatItem;
    monthlyRevenue: StatItem;
    activeUsers: StatItem;
    completionRate: StatItem;
}

interface RealtimeData {
    onlineUsers: number;
    recentVisitors: number;
    visitorsLastHour: number;
    visitorsToday: number;
    timestamp: string;
}

interface UserGrowthData {
    name: string;
    users: number;
    fullDate: string;
    date: string;
}

interface RevenueData {
    name: string;
    revenue: number;
    fullDate: string;
    date: string;
}

interface RecentActivity {
    type: string;
    action: string;
    time: string;
    timeAgo: string;
    icon: string;
    color: string;
}

const DashboardStats: React.FC = () => {
    // Prevent page reload on unhandled errors
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error("Unhandled promise rejection:", event.reason);
            event.preventDefault(); // Prevent default browser behavior
            return false;
        };

        const handleError = (event: ErrorEvent) => {
            console.error("Unhandled error:", event.error);
            event.preventDefault(); // Prevent default browser behavior
            return false;
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        window.addEventListener("error", handleError);

        return () => {
            window.removeEventListener(
                "unhandledrejection",
                handleUnhandledRejection
            );
            window.removeEventListener("error", handleError);
        };
    }, []);

    const [stats, setStats] = useState<OverviewData | null>(null);
    const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
    const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revenueTimeframe, setRevenueTimeframe] = useState<
        "week" | "month" | "year"
    >("month");
    const [userGrowthPeriod, setUserGrowthPeriod] = useState<
        "week" | "month" | "year"
    >("month");
    const [lastOverviewFetch, setLastOverviewFetch] = useState<number>(0);
    const [lastRealtimeFetch, setLastRealtimeFetch] = useState<number>(0);

    // Socket.IO for real-time updates
    const socketRef = useRef<Socket | null>(null);

    // Track initial load to reduce unnecessary logs
    const initialLoadRef = useRef<boolean>(false);

    // Cache duration: 2 minutes for overview, 10 seconds for realtime
    const OVERVIEW_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
    const REALTIME_CACHE_DURATION = 10 * 1000; // 10 seconds

    useEffect(() => {
        fetchOverviewStats();
        fetchRealtimeData();
        fetchUserGrowthData();
        fetchRecentActivities();
        fetchRevenueData();

        // Setup Socket.IO connection for real-time updates
        const setupSocket = () => {
            try {
                // Extract base URL for socket connection (remove /api suffix)
                const socketUrl = API_BASE_URL.replace(/\/api$/, "");

                const socket = io(socketUrl, {
                    transports: ["websocket", "polling"],
                    timeout: 5000,
                    reconnection: true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 2000,
                    forceNew: true,
                });

                socketRef.current = socket;

                socket.on("connect", () => {
                    console.log("🔗 Connected to real-time server");
                    socket.emit("join_admin"); // Join admin room for statistics
                });

                socket.on("connect_error", (error) => {
                    console.warn("🔌 Socket connection error:", error.message);
                    // Don't throw error, just log it
                });

                socket.on("disconnect", (reason) => {
                    console.log("🔌 Socket disconnected:", reason);
                });

                // Listen for user activity events
                socket.on("user_activity", (data) => {
                    console.log("👤 User activity:", data);
                    // Just log the activity, no notifications UI
                });

                // Listen for statistics updates
                socket.on("statistics_update", (data) => {
                    console.log("📊 Statistics update:", data);
                    if (data.type === "realtime") {
                        setRealtimeData(data.data);
                        setLastRealtimeFetch(Date.now());
                    }
                });

                // Listen for recent activity updates
                socket.on("recent_activity", (activity) => {
                    console.log("🔔 Recent activity:", activity);
                    setRecentActivities((prev) => [
                        activity,
                        ...prev.slice(0, 5),
                    ]);
                });
            } catch (error) {
                console.warn("� Failed to setup socket connection:", error);
                // Continue without real-time features
            }
        };

        // Try to setup socket with delay to ensure backend is ready
        const socketTimer = setTimeout(() => {
            setupSocket();
        }, 1000);

        // Cập nhật real-time data mỗi 10 giây (fallback)
        const realtimeInterval = setInterval(fetchRealtimeData, 10000);

        // Cập nhật overview stats mỗi 2 phút để tránh rate limit
        const overviewInterval = setInterval(fetchOverviewStats, 2 * 60 * 1000);

        // Cập nhật recent activities mỗi 30 giây (fallback)
        const activitiesInterval = setInterval(fetchRecentActivities, 30000);

        return () => {
            clearTimeout(socketTimer);
            clearInterval(realtimeInterval);
            clearInterval(overviewInterval);
            clearInterval(activitiesInterval);

            // Cleanup socket connection
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Fetch user growth data khi userGrowthPeriod thay đổi
    useEffect(() => {
        fetchUserGrowthData();
    }, [userGrowthPeriod]);

    // Fetch revenue data khi revenueTimeframe thay đổi
    useEffect(() => {
        // Chỉ log lần đầu tiên khi component mount
        if (!initialLoadRef.current) {
            console.log(
                "📊 Dashboard initialized with period:",
                revenueTimeframe
            );
            initialLoadRef.current = true;
        }

        const fetchData = async () => {
            try {
                // Reset cache để force refresh overview stats
                setLastOverviewFetch(0);

                // Fetch both revenue data and overview stats
                await Promise.all([fetchRevenueData(), fetchOverviewStats()]);

                // Không log gì thêm để giảm noise
            } catch (error) {
                console.error(
                    "❌ Error updating data for timeframe change:",
                    error
                );
                // Don't throw error to prevent page reload
            }
        };

        fetchData();
    }, [revenueTimeframe]);

    const fetchOverviewStats = async () => {
        try {
            // Check cache - only fetch if cache expired
            const now = Date.now();
            if (stats && now - lastOverviewFetch < OVERVIEW_CACHE_DURATION) {
                return;
            }

            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Chưa đăng nhập");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATISTICS_OVERVIEW}?period=${revenueTimeframe}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    setError("Quá nhiều yêu cầu. Vui lòng đợi một chút...");
                    return;
                }
                if (response.status === 401 || response.status === 403) {
                    // Silently handle auth errors to prevent reload
                    console.warn(
                        "Auth error in dashboard stats - ignoring to prevent reload"
                    );
                    return;
                }
                throw new Error("Không thể tải thống kê");
            }

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
                setLastOverviewFetch(now);
                setError(null); // Clear any previous errors
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

    const fetchRealtimeData = async () => {
        try {
            // Check cache - only fetch if cache expired
            const now = Date.now();
            if (
                realtimeData &&
                now - lastRealtimeFetch < REALTIME_CACHE_DURATION
            ) {
                return;
            }

            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATISTICS_REALTIME}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn(
                        "Rate limited for realtime data, using cached data"
                    );
                    return;
                }
                if (response.status === 401 || response.status === 403) {
                    // Silently handle auth errors to prevent reload
                    console.warn(
                        "Auth error in realtime data - ignoring to prevent reload"
                    );
                    return;
                }
                throw new Error("Không thể tải thống kê real-time");
            }

            const data = await response.json();
            if (data.success) {
                setRealtimeData(data.data);
                setLastRealtimeFetch(now);
            }
        } catch (error) {
            console.error("Error fetching realtime data:", error);
        }
    };

    const fetchUserGrowthData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No auth token found for user growth data");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATISTICS_USER_GROWTH}?period=${userGrowthPeriod}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("Rate limited for user growth data");
                    return;
                }
                if (response.status === 401 || response.status === 403) {
                    // Silently handle auth errors to prevent reload
                    console.warn(
                        "Auth error in user growth data - ignoring to prevent reload"
                    );
                    return;
                }
                throw new Error("Không thể tải dữ liệu tăng trưởng người dùng");
            }

            const data = await response.json();
            if (data.success) {
                setUserGrowthData(data.data.growthData);
            }
        } catch (error) {
            console.error("Error fetching user growth data:", error);
        }
    };

    const fetchRecentActivities = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No auth token found for recent activities");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATISTICS_RECENT_ACTIVITIES}?limit=6`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("Rate limited for recent activities data");
                    return;
                }
                if (response.status === 401 || response.status === 403) {
                    // Silently handle auth errors to prevent reload
                    console.warn(
                        "Auth error in recent activities - ignoring to prevent reload"
                    );
                    return;
                }
                throw new Error("Không thể tải dữ liệu hoạt động gần đây");
            }

            const data = await response.json();
            if (data.success) {
                setRecentActivities(data.data.activities);
            }
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        }
    };

    const fetchRevenueData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No auth token found for revenue data");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/admin/statistics/revenue?period=${revenueTimeframe}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("Rate limited for revenue data");
                    return;
                }
                if (response.status === 401 || response.status === 403) {
                    console.warn(
                        "Auth error in revenue data - ignoring to prevent reload"
                    );
                    return;
                }
                console.error(
                    "Error response for revenue data:",
                    response.status
                );
                return; // Don't throw, just return to prevent page reload
            }

            const data = await response.json();
            if (data.success) {
                setRevenueData(data.data.revenueData);
            }
        } catch (error) {
            console.error("Error fetching revenue data:", error);
        }
    };

    // Helper function để map icon string sang React component
    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case "Users":
                return Users;
            case "BookOpen":
                return BookOpen;
            case "FileText":
                return FileText;
            case "DollarSign":
                return DollarSign;
            default:
                return Users;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
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
        const isRateLimit = error.includes("Quá nhiều yêu cầu");
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center mb-2 space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <p className="font-medium text-red-600">
                        {isRateLimit
                            ? "Tạm thời không thể tải dữ liệu"
                            : "Lỗi kết nối"}
                    </p>
                </div>
                <p className="mb-3 text-sm text-red-600">{error}</p>
                {isRateLimit && (
                    <p className="mb-3 text-xs text-red-500">
                        Hệ thống sẽ tự động thử lại sau 2 phút hoặc bạn có thể
                        thử lại ngay.
                    </p>
                )}
                <button
                    onClick={() => {
                        setError(null);
                        fetchOverviewStats();
                    }}
                    className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                >
                    Thử lại ngay
                </button>
            </div>
        );
    }

    if (!stats) return null;

    // Function to generate chart data
    const getUserGrowthChartData = () => {
        return {
            labels: userGrowthData.map((item) => item.name),
            datasets: [
                {
                    label: "Người dùng mới",
                    data: userGrowthData.map((item) => item.users),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                },
            ],
        };
    };

    // Generate revenue chart data using real data
    const getRevenueChartData = () => {
        if (!revenueData || revenueData.length === 0) {
            // Fallback to empty data if no revenue data available
            return {
                labels: [],
                datasets: [
                    {
                        label: "Doanh thu (Triệu VNĐ)",
                        data: [],
                        backgroundColor: "rgba(147, 51, 234, 0.8)",
                        borderColor: "rgba(147, 51, 234, 1)",
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                ],
            };
        }

        return {
            labels: revenueData.map((item) => item.name),
            datasets: [
                {
                    label: "Doanh thu (Triệu VNĐ)",
                    data: revenueData.map(
                        (item) => Math.round(item.revenue * 10) / 10
                    ), // Round to 1 decimal
                    backgroundColor: "rgba(147, 51, 234, 0.8)",
                    borderColor: "rgba(147, 51, 234, 1)",
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context: any) {
                        const dataIndex = context.dataIndex;
                        const item = userGrowthData[dataIndex];
                        let result = item ? `Thời gian: ${item.fullDate}` : "";

                        // Tính phần trăm thay đổi so với cột trước
                        if (dataIndex > 0) {
                            const currentValue = context.parsed.y;
                            const previousValue =
                                context.dataset.data[dataIndex - 1];

                            // Xác định text theo loại thời gian
                            let timeText = "trước";
                            if (userGrowthPeriod === "week") {
                                timeText = "ngày trước";
                            } else if (userGrowthPeriod === "month") {
                                timeText = "tháng trước";
                            } else if (userGrowthPeriod === "year") {
                                timeText = "năm trước";
                            }

                            if (previousValue !== 0) {
                                const percentChange =
                                    ((currentValue - previousValue) /
                                        previousValue) *
                                    100;
                                const changeColor =
                                    percentChange >= 0 ? "Tăng" : "Giảm";
                                result += `\n${changeColor} ${Math.abs(
                                    percentChange
                                ).toFixed(1)}% so với ${timeText}`;
                            } else if (currentValue > 0) {
                                result += `\nTăng 100% so với ${timeText} (từ 0)`;
                            } else {
                                result += "\nKhông thay đổi";
                            }
                        }

                        return result;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: "rgba(229, 231, 235, 0.8)",
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context: any) {
                        const dataIndex = context.dataIndex;
                        let result = "";

                        // Tính phần trăm thay đổi so với cột trước
                        if (dataIndex > 0) {
                            const currentValue = context.parsed.y;
                            const previousValue =
                                context.dataset.data[dataIndex - 1];

                            // Xác định text theo loại thời gian
                            let timeText = "trước";
                            if (revenueTimeframe === "week") {
                                timeText = "ngày trước";
                            } else if (revenueTimeframe === "month") {
                                timeText = "tháng trước";
                            } else if (revenueTimeframe === "year") {
                                timeText = "năm trước";
                            }

                            if (previousValue !== 0) {
                                const percentChange =
                                    ((currentValue - previousValue) /
                                        previousValue) *
                                    100;
                                const changeColor =
                                    percentChange >= 0 ? "Tăng" : "Giảm";
                                result = `${changeColor} ${Math.abs(
                                    percentChange
                                ).toFixed(1)}% so với ${timeText}`;
                            } else if (currentValue > 0) {
                                result = `Tăng 100% so với ${timeText} (từ 0)`;
                            } else {
                                result = "Không thay đổi";
                            }
                        }

                        return result;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return value + "M";
                    },
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: "rgba(229, 231, 235, 0.8)",
                },
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    // Function to get revenue text based on timeframe
    const getRevenueTitle = () => {
        return stats?.monthlyRevenue?.label || "Doanh thu";
    };

    const getRevenueValue = () => {
        return stats?.monthlyRevenue?.display || "0 VNĐ";
    };

    // Tạo array stats theo đúng thứ tự trong giao diện
    const displayStats = [
        {
            title: "Tổng số khóa học",
            value: stats.activeCourses.display,
            icon: BookOpen,
            color: "bg-green-500",
        },
        {
            title: "Tổng số đề thi",
            value: stats.totalExams.display,
            icon: FileText,
            color: "bg-yellow-500",
        },
        {
            title: "Tổng số người dùng",
            value: stats.totalUsers.display,
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: getRevenueTitle(),
            value: getRevenueValue(),
            icon: DollarSign,
            color: "bg-purple-500",
            hasTimeFilter: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Recent Visitors Alert */}
            <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-blue-900">
                            Hoạt động người dùng
                        </p>
                        <p className="text-sm text-blue-700">
                            {realtimeData?.visitorsLastHour || 0} người truy cập
                            trong 1 giờ qua
                        </p>
                        {realtimeData && (
                            <p className="text-xs text-blue-600">
                                Hôm nay: {realtimeData.visitorsToday} | Đang
                                online: {realtimeData.onlineUsers}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <button
                        onClick={() => {
                            setLastRealtimeFetch(0); // Force refresh by clearing cache
                            fetchRealtimeData();
                        }}
                        className="px-3 py-1 mb-1 text-sm font-semibold text-white transition-all duration-200 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
                        title="Nhấn để cập nhật ngay"
                    >
                        {realtimeData?.onlineUsers || 0}
                    </button>
                    <div className="text-xs font-medium text-blue-600">
                        Online
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                {displayStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-gray-600">
                                        {stat.title}
                                    </p>
                                    {stat.hasTimeFilter && (
                                        <div className="relative">
                                            <select
                                                value={revenueTimeframe}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    try {
                                                        const newValue =
                                                            e.target.value;
                                                        // Removed logging to reduce console noise

                                                        // Validate value
                                                        if (
                                                            [
                                                                "week",
                                                                "month",
                                                                "year",
                                                            ].includes(newValue)
                                                        ) {
                                                            setRevenueTimeframe(
                                                                newValue as
                                                                | "week"
                                                                | "month"
                                                                | "year"
                                                            );
                                                            // Removed success logging
                                                        } else {
                                                            console.warn(
                                                                "Invalid timeframe value:",
                                                                newValue
                                                            );
                                                        }
                                                    } catch (error) {
                                                        console.error(
                                                            "Error changing revenue timeframe:",
                                                            error
                                                        );
                                                    }
                                                    return false;
                                                }}
                                                className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="week">
                                                    Tuần
                                                </option>
                                                <option value="month">
                                                    Tháng
                                                </option>
                                                <option value="year">
                                                    Năm
                                                </option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 text-3xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tăng trưởng người dùng
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <select
                                value={userGrowthPeriod}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                        const newValue = e.target.value;
                                        console.log(
                                            "User growth period changing to:",
                                            newValue
                                        );

                                        if (
                                            ["week", "month", "year"].includes(
                                                newValue
                                            )
                                        ) {
                                            setUserGrowthPeriod(
                                                newValue as
                                                | "week"
                                                | "month"
                                                | "year"
                                            );
                                            console.log(
                                                "User growth period changed successfully"
                                            );
                                        } else {
                                            console.warn(
                                                "Invalid period value:",
                                                newValue
                                            );
                                        }
                                    } catch (error) {
                                        console.error(
                                            "Error changing user growth period:",
                                            error
                                        );
                                    }
                                    return false;
                                }}
                                className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="week">Tuần</option>
                                <option value="month">Tháng</option>
                                <option value="year">Năm</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-64">
                        {userGrowthData.length > 0 ? (
                            <Bar
                                data={getUserGrowthChartData()}
                                options={chartOptions}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Doanh thu
                        </h3>
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <select
                                value={revenueTimeframe}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                        const newValue = e.target.value;
                                        // Removed logging to reduce console noise

                                        if (
                                            ["week", "month", "year"].includes(
                                                newValue
                                            )
                                        ) {
                                            setRevenueTimeframe(
                                                newValue as
                                                | "week"
                                                | "month"
                                                | "year"
                                            );
                                            // Removed success logging
                                        } else {
                                            console.warn(
                                                "Invalid timeframe value:",
                                                newValue
                                            );
                                        }
                                    } catch (error) {
                                        console.error(
                                            "Error changing revenue timeframe:",
                                            error
                                        );
                                    }
                                    return false;
                                }}
                                className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="week">Tuần</option>
                                <option value="month">Tháng</option>
                                <option value="year">Năm</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar
                            data={getRevenueChartData()}
                            options={revenueChartOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Hoạt động gần đây
                    </h3>
                </div>
                <div className="space-y-4">
                    {/* Recent activities */}
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => {
                            const IconComponent = getIconComponent(
                                activity.icon
                            );
                            return (
                                <div
                                    key={index}
                                    className="flex items-center py-2 space-x-3"
                                >
                                    <div
                                        className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}
                                    >
                                        <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p
                                            className="text-sm text-gray-900"
                                            dangerouslySetInnerHTML={{
                                                __html: activity.action,
                                            }}
                                        />
                                        <p className="text-xs text-gray-500">
                                            {activity.timeAgo}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">
                                Chưa có hoạt động nào
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
