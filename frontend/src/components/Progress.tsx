import React from 'react';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';

const Progress = () => {
  const progressData = [
    {
      title: 'Từ vựng đã học',
      current: 2847,
      target: 5000,
      percentage: 57,
      icon: Target,
      color: 'from-green-500 to-lime-500'
    },
    {
      title: 'Giờ luyện nghe',
      current: 128,
      target: 200,
      percentage: 64,
      icon: Calendar,
      color: 'from-green-600 to-green-400'
    },
    {
      title: 'Bài kiểm tra hoàn thành',
      current: 45,
      target: 60,
      percentage: 75,
      icon: Award,
      color: 'from-lime-500 to-green-500'
    },
    {
      title: 'Streak học tập',
      current: 23,
      target: 30,
      percentage: 77,
      icon: TrendingUp,
      color: 'from-green-700 to-lime-600'
    }
  ];

  const weeklyActivity = [
    { day: 'T2', hours: 2.5 },
    { day: 'T3', hours: 1.8 },
    { day: 'T4', hours: 3.2 },
    { day: 'T5', hours: 2.1 },
    { day: 'T6', hours: 2.8 },
    { day: 'T7', hours: 1.5 },
    { day: 'CN', hours: 3.5 }
  ];

  const maxHours = Math.max(...weeklyActivity.map(day => day.hours));

  return (
    <section id="progress" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
            Theo dõi tiến độ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Xem chi tiết quá trình học tập của bạn và đạt được những mục tiêu đã đề ra
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Progress Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thống kê tổng quan</h3>
            {progressData.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.current} / {item.target}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {item.percentage}%
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
          <div className="bg-gradient-to-br from-green-50 to-lime-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Hoạt động trong tuần</h3>
            <div className="space-y-4">
              {weeklyActivity.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm font-medium text-gray-700">
                    {day.day}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-lime-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(day.hours / maxHours) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {day.hours}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-white rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng thời gian tuần này</p>
                  <p className="text-2xl font-bold text-green-700">17.4 giờ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">So với tuần trước</p>
                  <p className="text-lg font-semibold text-green-600">+12%</p>
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