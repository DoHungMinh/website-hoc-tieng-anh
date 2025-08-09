import { useState } from 'react';
import { TrendingUp, Calendar, Award, Target, Trophy, Medal, Star, BookOpen } from 'lucide-react';
import { Progress as ProgressData } from '../../types';

const ProgressDashboard = () => {
  // Mock data - sẽ được thay thế bằng data thật từ API
  const [progressData] = useState<ProgressData>({
    _id: '1',
    userId: 'user1',
    vocabulary: {
      learned: 2847,
      target: 5000,
      recentWords: []
    },
    listening: {
      hoursCompleted: 128,
      target: 200,
      recentSessions: []
    },
    testsCompleted: {
      completed: 45,
      target: 60,
      recentTests: []
    },
    studyStreak: {
      current: 23,
      target: 30,
      lastStudyDate: new Date().toISOString()
    },
    weeklyActivity: [],
    totalStudyTime: 156.5,
    level: 'B1',
    achievements: [
      {
        id: '1',
        title: 'First Steps',
        description: 'Hoàn thành bài học đầu tiên',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'general'
      },
      {
        id: '2',
        title: 'Vocabulary Master',
        description: 'Học được 1000 từ vựng',
        icon: '📚',
        unlockedAt: new Date().toISOString(),
        category: 'vocabulary'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const progressItems = [
    {
      title: 'Từ vựng đã học',
      current: progressData.vocabulary.learned,
      target: progressData.vocabulary.target,
      percentage: Math.round((progressData.vocabulary.learned / progressData.vocabulary.target) * 100),
      icon: Target,
      color: 'from-green-500 to-lime-500',
      bgColor: 'from-green-50 to-lime-50'
    },
    {
      title: 'Giờ luyện nghe',
      current: progressData.listening.hoursCompleted,
      target: progressData.listening.target,
      percentage: Math.round((progressData.listening.hoursCompleted / progressData.listening.target) * 100),
      icon: Calendar,
      color: 'from-green-600 to-green-400',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Bài kiểm tra hoàn thành',
      current: progressData.testsCompleted.completed,
      target: progressData.testsCompleted.target,
      percentage: Math.round((progressData.testsCompleted.completed / progressData.testsCompleted.target) * 100),
      icon: Award,
      color: 'from-lime-500 to-green-500',
      bgColor: 'from-lime-50 to-green-50'
    },
    {
      title: 'Streak học tập',
      current: progressData.studyStreak.current,
      target: progressData.studyStreak.target,
      percentage: Math.round((progressData.studyStreak.current / progressData.studyStreak.target) * 100),
      icon: TrendingUp,
      color: 'from-green-700 to-lime-600',
      bgColor: 'from-green-100 to-lime-50'
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

  const levelColors: Record<string, string> = {
    A1: 'from-green-400 to-green-600',
    A2: 'from-green-500 to-green-700',
    B1: 'from-lime-500 to-green-600',
    B2: 'from-lime-600 to-green-700',
    C1: 'from-orange-500 to-orange-700',
    C2: 'from-red-500 to-red-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard học tập</h1>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Chào mừng trở lại! 👋</h2>
                <p className="text-gray-600">Hãy tiếp tục hành trình học tiếng Anh của bạn</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${levelColors[progressData.level]} text-white font-semibold`}>
                  <Star className="h-5 w-5 mr-2" />
                  Trình độ {progressData.level}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Tổng thời gian học: {progressData.totalStudyTime}h
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className="xl:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan tiến độ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {progressItems.map((item, index) => (
                <div key={index} className={`bg-gradient-to-r ${item.bgColor} rounded-2xl p-6 border border-green-100`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.current} / {item.target}
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {item.percentage}%
                    </div>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 shadow-inner">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Hoạt động trong tuần</h3>
              <div className="space-y-4">
                {weeklyActivity.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 text-sm font-medium text-gray-700">
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
              <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl border border-green-200">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Thành tích</h3>
              </div>
              
              <div className="space-y-4">
                {progressData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200">
                Xem tất cả thành tích
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Hành động nhanh</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Tiếp tục bài học</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200">
                  <Medal className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Làm bài kiểm tra</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Luyện từ vựng</span>
                </button>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🔥</div>
                <h3 className="text-xl font-bold">Streak học tập</h3>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{progressData.studyStreak.current}</div>
                <p className="text-orange-100">ngày liên tiếp</p>
                <p className="text-sm text-orange-200 mt-2">
                  Mục tiêu: {progressData.studyStreak.target} ngày
                </p>
              </div>
              
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(progressData.studyStreak.current / progressData.studyStreak.target) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
