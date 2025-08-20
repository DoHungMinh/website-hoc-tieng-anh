import React from 'react';
import { Search, Plus, Edit, Trash2, Eye, Play } from 'lucide-react';

const CourseManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h2>
          <p className="text-gray-600">Quản lý nội dung và cấu trúc khóa học</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Plus className="h-4 w-4" />
          Tạo khóa học mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Tất cả cấp độ</option>
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
            <option>C2</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Trạng thái</option>
            <option>Hoạt động</option>
            <option>Tạm dừng</option>
            <option>Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  B{item}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Hoạt động
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Khóa học Tiếng Anh Giao Tiếp {item}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Khóa học dành cho người mới bắt đầu học tiếng Anh
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>15 bài học</span>
                <span>245 học viên</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-1">
                  <Play className="h-4 w-4" />
                  Xem trước
                </button>
                <button className="text-gray-600 hover:text-gray-800 p-2">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 p-2">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;
