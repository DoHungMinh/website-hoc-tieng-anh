import React, { useState } from "react";
import { TrendingUp, Target, Medal, Clock } from "lucide-react";

interface UserStatisticsProps {
    onNavigate?: (page: string) => void;
}

interface WeeklyActivityData {
    day: string;
    dayLabel: string;
    hours: number;
}

const UserStatistics: React.FC<UserStatisticsProps> = () => {
    const [weeklyActivity] = useState<WeeklyActivityData[]>([
        { day: "Mon", dayLabel: "T2", hours: 2.5 },
        { day: "Tue", dayLabel: "T3", hours: 1.8 },
        { day: "Wed", dayLabel: "T4", hours: 3.2 },
        { day: "Thu", dayLabel: "T5", hours: 2.1 },
        { day: "Fri", dayLabel: "T6", hours: 2.8 },
        { day: "Sat", dayLabel: "T7", hours: 1.5 },
        { day: "Sun", dayLabel: "CN", hours: 3.5 },
    ]);

    const maxWeeklyHours = Math.max(...weeklyActivity.map((day) => day.hours));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="relative p-8 overflow-hidden text-center bg-white rounded-3xl">
                        <div className="relative flex flex-col items-center justify-center gap-6 text-center">
                            <div>
                                <h1 className="mb-4 text-4xl font-bold md:text-5xl bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent">
                                    Theo dõi tiến độ
                                </h1>
                                <p className="mb-6 text-xl text-gray-600 max-w-3xl mx-auto">
                                    Xem chi tiết quá trình học tập của bạn và
                                    đạt được những mục tiêu đã đề ra
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left Column - Thống kê tổng quan */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Thống kê tổng quan
                        </h3>

                        {/* Stats Items */}
                        <div className="space-y-6">
                            {/* Số hoạt động trong tuần */}
                            <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Hoạt động trong tuần
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                17.4 giờ học tập
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        +12%
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-green-500 to-lime-500"
                                        style={{ width: "80%" }}
                                    ></div>
                                </div>
                            </div>

                            {/* Các đề thi đã làm */}
                            <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-400 rounded-xl flex items-center justify-center">
                                            <Target className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Đề thi đã làm
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                45 bài kiểm tra
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        45
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-green-600 to-green-400"
                                        style={{ width: "75%" }}
                                    ></div>
                                </div>
                            </div>

                            {/* Các khóa học đã mua */}
                            <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-lime-500 to-green-500 rounded-xl flex items-center justify-center">
                                            <Medal className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Khóa học đã mua
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                5 khóa học
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        5
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-lime-500 to-green-500"
                                        style={{ width: "100%" }}
                                    ></div>
                                </div>
                            </div>

                            {/* Điểm và điểm trung bình */}
                            <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-700 to-lime-600 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Điểm trung bình
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                78.5 điểm
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">
                                        7.8
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-green-700 to-lime-600"
                                        style={{ width: "78%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Hoạt động trong tuần */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Hoạt động trong tuần
                        </h3>

                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="space-y-4">
                                {weeklyActivity.map((day, index) => (
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
                                                                maxWeeklyHours) *
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
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 mt-8 border border-green-200 md:grid-cols-2 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        Tổng thời gian tuần này
                                    </p>
                                    <p className="text-3xl font-bold text-green-700">
                                        17.4 giờ
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        So với tuần trước
                                    </p>
                                    <p className="text-lg font-semibold text-green-600">
                                        +12%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatistics;
