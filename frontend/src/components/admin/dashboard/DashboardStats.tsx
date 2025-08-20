import React from 'react';
import { Users, BookOpen, FileText, DollarSign, TrendingUp, Activity } from 'lucide-react';

const DashboardStats: React.FC = () => {
  // Mock data - sẽ được thay thế bằng API calls
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '12,543',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Khóa học hoạt động',
      value: '47',
      change: '+3',
      changeType: 'increase',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Đề thi',
      value: '156',
      change: '+8',
      changeType: 'increase',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Doanh thu tháng',
      value: '245M VNĐ',
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Người dùng hoạt động',
      value: '8,721',
      change: '+5%',
      changeType: 'increase',
      icon: Activity,
      color: 'bg-indigo-500'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: '87%',
      change: '+2%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tăng trưởng người dùng</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Người dùng mới đăng ký</p>
                <p className="text-xs text-gray-500">2 phút trước</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
