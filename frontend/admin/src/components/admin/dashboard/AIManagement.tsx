import React from 'react';
import { Bot, Settings, Activity, AlertCircle, Play } from 'lucide-react';

const AIManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý AI</h2>
          <p className="text-gray-600">Quản lý chatbot và các tính năng AI</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Settings className="h-4 w-4" />
          Cấu hình AI
        </button>
      </div>

      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái Chatbot</p>
              <p className="text-2xl font-bold text-green-600">Hoạt động</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Bot className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">99.8% uptime</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cuộc trò chuyện hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +15% so với hôm qua
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Độ hài lòng</p>
              <p className="text-2xl font-bold text-gray-900">4.8/5</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Từ 2,451 đánh giá
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Cài đặt Chatbot
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tự động trả lời</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Học từ cuộc trò chuyện</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Gợi ý thông minh</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            Lưu cài đặt
          </button>
        </div>

        {/* Training Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dữ liệu huấn luyện</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ngữ pháp tiếng Anh</span>
                <span className="text-xs text-green-600">Đã cập nhật</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Từ vựng theo chủ đề</span>
                <span className="text-xs text-yellow-600">Đang cập nhật</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Giao tiếp hàng ngày</span>
                <span className="text-xs text-blue-600">Sẵn sàng</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuộc trò chuyện gần đây</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-semibold">U{item}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Người dùng {item}</span>
                </div>
                <span className="text-xs text-gray-500">2 phút trước</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                "Làm thế nào để cải thiện khả năng nghe tiếng Anh?"
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Xem chi tiết
                </button>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-green-600">Đã trả lời</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIManagement;
