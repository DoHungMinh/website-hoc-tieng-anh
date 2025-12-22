import React from 'react';
import { BookOpen, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-lime-400" />
              <span className="font-bold text-2xl">EnglishPro</span>
            </div>
            <p className="text-green-100 leading-relaxed">
              Nền tảng học tiếng Anh trực tuyến hàng đầu với công nghệ AI tiên tiến, 
              giúp hàng triệu học viên chinh phục ước mơ tiếng Anh.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-300 hover:text-lime-400 transition-colors duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-green-300 hover:text-lime-400 transition-colors duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-green-300 hover:text-lime-400 transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-green-300 hover:text-lime-400 transition-colors duration-200">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-lime-400">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Về chúng tôi</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Khóa học</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Giáo viên</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Tin tức</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Liên hệ</a></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-lime-400">Khóa học</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Tiếng Anh cơ bản</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">IELTS</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">TOEIC</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Tiếng Anh giao tiếp</a></li>
              <li><a href="#" className="text-green-100 hover:text-lime-400 transition-colors duration-200">Tiếng Anh doanh nghiệp</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-lime-400">Liên hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-lime-400 mt-1" />
                <div>
                  <p className="text-green-100">123 Đường ABC, Quận 1</p>
                  <p className="text-green-100">TP. Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-lime-400" />
                <p className="text-green-100">+84 123 456 789</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-lime-400" />
                <p className="text-green-100">info@englishpro.vn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-200 text-sm">
              © 2024 EnglishPro. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-green-200 hover:text-lime-400 text-sm transition-colors duration-200">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-green-200 hover:text-lime-400 text-sm transition-colors duration-200">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-green-200 hover:text-lime-400 text-sm transition-colors duration-200">
                Hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;