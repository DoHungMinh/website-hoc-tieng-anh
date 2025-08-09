import React, { useState } from 'react';
import { BookOpen, Menu, X, User, Bell } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-green-800 via-green-700 to-lime-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="font-bold text-xl text-white">EnglishPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Trang chủ
            </a>
            <a href="#courses" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Khóa học
            </a>
            <a href="#practice" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Luyện tập
            </a>
            <a href="#tests" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Kiểm tra
            </a>
            <a href="#progress" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Tiến độ
            </a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white hover:text-lime-200 transition-colors duration-200">
              <Bell className="h-6 w-6" />
            </button>
            <button className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
              <User className="h-5 w-5 inline mr-2" />
              Tài khoản
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-lime-200 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-600">
            <div className="flex flex-col space-y-2">
              <a href="#home" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Trang chủ
              </a>
              <a href="#courses" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Khóa học
              </a>
              <a href="#practice" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Luyện tập
              </a>
              <a href="#tests" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Kiểm tra
              </a>
              <a href="#progress" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Tiến độ
              </a>
              <button className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200 mt-4">
                Tài khoản
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;