import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X, Bell } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore, loadNotificationsFromStorage } from '../stores/notificationStore';
import NotificationDropdown from './NotificationDropdown';
import AvatarDisplay from './AvatarDisplay';

interface HeaderProps {
  onAuthClick?: () => void;
  onNavigate?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthClick, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { unreadCount, isDropdownOpen, setDropdownOpen } = useNotificationStore();

  // Load notifications từ localStorage khi component mount
  useEffect(() => {
    loadNotificationsFromStorage();
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Chuyển thẳng đến trang thông tin cá nhân
      onNavigate?.('profile');
    } else {
      onAuthClick?.();
    }
  };

  const toggleNotificationDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

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
            <button 
              onClick={() => onNavigate?.('home')}
              className="text-white hover:text-lime-200 transition-colors duration-200 font-medium"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => onNavigate?.('courses')}
              className="text-white hover:text-lime-200 transition-colors duration-200 font-medium"
            >
              Khóa học
            </button>
            <button 
              onClick={() => onNavigate?.('practice')}
              className="text-white hover:text-lime-200 transition-colors duration-200 font-medium"
            >
              Luyện tập
            </button>
            <a href="#tests" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Kiểm tra
            </a>
            <a href="#progress" className="text-white hover:text-lime-200 transition-colors duration-200 font-medium">
              Tiến độ
            </a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <button 
                className="flex items-center space-x-2 text-white hover:text-lime-200 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
                onClick={handleAuthAction}
              >
                <AvatarDisplay 
                  src={user?.avatar} 
                  name={user?.fullName || ''} 
                  size="sm" 
                  showOnlineStatus={false}
                />
                <span className="font-medium">{user?.fullName}</span>
              </button>
            ) : (
              <button 
                onClick={handleAuthAction}
                className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Đăng nhập</span>
              </button>
            )}
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={toggleNotificationDropdown}
                className="text-white hover:text-lime-200 transition-colors duration-200 relative"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown 
                isOpen={isDropdownOpen}
                onClose={() => setDropdownOpen(false)}
              />
            </div>
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
              <button 
                onClick={() => {
                  onNavigate?.('home');
                  setIsMenuOpen(false);
                }}
                className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium text-left"
              >
                Trang chủ
              </button>
              <button 
                onClick={() => {
                  onNavigate?.('courses');
                  setIsMenuOpen(false);
                }}
                className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium text-left"
              >
                Khóa học
              </button>
              <button 
                onClick={() => {
                  onNavigate?.('practice');
                  setIsMenuOpen(false);
                }}
                className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium text-left"
              >
                Luyện tập
              </button>
              <a href="#tests" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Kiểm tra
              </a>
              <a href="#progress" className="text-white hover:text-lime-200 transition-colors duration-200 py-2 font-medium">
                Tiến độ
              </a>
              
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    handleAuthAction();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-white text-base font-medium py-2 border-t border-green-600 mt-2 pt-4 hover:text-lime-200 transition-colors duration-200 w-full text-left"
                >
                  <AvatarDisplay 
                    src={user?.avatar} 
                    name={user?.fullName || ''} 
                    size="sm" 
                    showOnlineStatus={false}
                  />
                  <span>{user?.fullName}</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleAuthAction();
                    setIsMenuOpen(false);
                  }}
                  className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200 mt-4 flex items-center justify-center space-x-2"
                >
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;