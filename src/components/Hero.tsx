import React from 'react';
import { Play, Award, Users, BookOpen } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-lime-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-lime-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-300 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Học Tiếng Anh
            <span className="block text-lime-300">Hiệu Quả</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nền tảng học tiếng Anh trực tuyến hàng đầu với AI chatbot thông minh, 
            giúp bạn chinh phục mọi kỳ thi tiếng Anh.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="bg-lime-500 hover:bg-lime-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Bắt đầu học ngay
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-800 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2">
              <Play className="h-6 w-6" />
              Xem demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-lime-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">50,000+</div>
              <div className="text-green-100">Học viên tin tưởng</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-lime-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1,000+</div>
              <div className="text-green-100">Bài học tương tác</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-lime-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-green-100">Tỷ lệ đỗ kỳ thi</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;