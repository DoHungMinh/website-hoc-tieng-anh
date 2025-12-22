import { TrendingUp, Target, Medal, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
    progressService,
    UserProgressStats,
} from "@/services/progressService";

const Progress = () => {
    const { isAuthenticated } = useAuthStore();
    const [progressStats, setProgressStats] =
        useState<UserProgressStats | null>(null);

    // Fetch progress data when user is authenticated
    const fetchProgressData = async () => {
        console.log(
            "Progress: fetchProgressData called, isAuthenticated:",
            isAuthenticated
        );

        if (!isAuthenticated) {
            console.log("Progress: User not authenticated, using mock data");
            // Use default mock data for non-authenticated users
            setProgressStats({
                weeklyActivity: [
                    { day: "Mon", dayLabel: "T2", hours: 2.5 },
                    { day: "Tue", dayLabel: "T3", hours: 1.8 },
                    { day: "Wed", dayLabel: "T4", hours: 3.2 },
                    { day: "Thu", dayLabel: "T5", hours: 2.1 },
                    { day: "Fri", dayLabel: "T6", hours: 2.8 },
                    { day: "Sat", dayLabel: "T7", hours: 1.5 },
                    { day: "Sun", dayLabel: "CN", hours: 3.5 },
                ],
                testsCompleted: 45,
                coursesEnrolled: 5,
                averageScore: 7.8,
                totalStudyTime: 187.5,
                weeklyStudyTime: 17.4,
                weeklyGrowth: 12,
            });
            return;
        }

        console.log("Progress: User authenticated, fetching real data...");
        try {
            const stats = await progressService.getUserProgressStats();
            console.log("Progress: Stats received:", stats);
            setProgressStats(stats);
        } catch (error) {
            console.error("Error fetching progress data:", error);
            // Use fallback data on error
            setProgressStats({
                weeklyActivity: [
                    { day: "Mon", dayLabel: "T2", hours: 0 },
                    { day: "Tue", dayLabel: "T3", hours: 0 },
                    { day: "Wed", dayLabel: "T4", hours: 0 },
                    { day: "Thu", dayLabel: "T5", hours: 0 },
                    { day: "Fri", dayLabel: "T6", hours: 0 },
                    { day: "Sat", dayLabel: "T7", hours: 0 },
                    { day: "Sun", dayLabel: "CN", hours: 0 },
                ],
                testsCompleted: 0,
                coursesEnrolled: 0,
                averageScore: 0,
                totalStudyTime: 0,
                weeklyStudyTime: 0,
                weeklyGrowth: 0,
            });
        }
    };

    useEffect(() => {
        fetchProgressData();
    }, [isAuthenticated]);

    if (!progressStats) {
        return (
            <section id="progress" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const progressData = [
        {
            title: "Hoạt động trong tuần",
            description: `${progressStats.weeklyStudyTime} giờ học tập`,
            percentage: Math.min(
                (progressStats.weeklyStudyTime / 20) * 100,
                100
            ), // Assuming 20h weekly goal
            value: `${progressStats.weeklyGrowth >= 0 ? "+" : ""}${
                progressStats.weeklyGrowth
            }%`,
            icon: Clock,
            color: "from-green-500 to-lime-500",
        },
        {
            title: "Đề thi đã làm",
            description: `${progressStats.testsCompleted} bài kiểm tra`,
            percentage: Math.min(
                (progressStats.testsCompleted / 60) * 100,
                100
            ), // Assuming 60 tests goal
            value: progressStats.testsCompleted.toString(),
            icon: Target,
            color: "from-green-600 to-green-400",
        },
        {
            title: "Khóa học đã mua",
            description: `${progressStats.coursesEnrolled} khóa học`,
            percentage: Math.min(
                (progressStats.coursesEnrolled / 10) * 100,
                100
            ), // Assuming 10 courses max
            value: progressStats.coursesEnrolled.toString(),
            icon: Medal,
            color: "from-lime-500 to-green-500",
        },
        {
            title: "Điểm trung bình",
            description: `${progressStats.averageScore} điểm`,
            percentage: (progressStats.averageScore / 9) * 100, // IELTS scale 0-9
            value: progressStats.averageScore.toString(),
            icon: TrendingUp,
            color: "from-green-700 to-lime-600",
        },
    ];

    const maxHours = Math.max(
        ...progressStats.weeklyActivity.map((day) => day.hours),
        1
    ); // Avoid division by 0

    return (
        <section id="progress" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                        Theo dõi tiến độ
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Xem chi tiết quá trình học tập của bạn và đạt được những
                        mục tiêu đã đề ra
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Progress Cards */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Thống kê tổng quan
                        </h3>
                        {progressData.map((item, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}
                                        >
                                            <item.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {item.value}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Weekly Activity Chart */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Hoạt động trong tuần
                        </h3>

                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="space-y-4">
                                {progressStats.weeklyActivity.map(
                                    (day, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-12 text-sm font-medium text-center text-gray-700">
                                                {day.dayLabel}
                                            </div>
                                            <div className="relative flex-1">
                                                <div className="relative h-8 overflow-hidden bg-gray-100 rounded-full">
                                                    <div
                                                        className="flex items-center justify-end h-full px-3 transition-all duration-500 rounded-full bg-gradient-to-r from-green-500 to-lime-500"
                                                        style={{
                                                            width: `${Math.max(
                                                                (day.hours /
                                                                    maxHours) *
                                                                    100,
                                                                8
                                                            )}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs font-medium text-white">
                                                            {day.hours}h
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 mt-8 border border-green-200 md:grid-cols-2 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        Tổng thời gian tuần này
                                    </p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {progressStats.weeklyStudyTime} giờ
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        So với tuần trước
                                    </p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {progressStats.weeklyGrowth >= 0
                                            ? "+"
                                            : ""}
                                        {progressStats.weeklyGrowth}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Progress;
