import React, { useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface NewCourseNotificationProps {
  onNavigate?: (page: string) => void;
}

const NewCourseNotification: React.FC<NewCourseNotificationProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleViewCourse = () => {
    setIsVisible(false);
    onNavigate?.('courses');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">🎉 Khóa học mới!</h3>
            <p className="text-sm opacity-90 mb-3">
              Khóa học "Thành ngữ tiếng Anh thông dụng" đã được thêm vào danh sách!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleViewCourse}
                className="bg-white text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Xem ngay
              </button>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCourseNotification;
