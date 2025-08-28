import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface AccountDisabledNotificationProps {
  message: string;
  onClose: () => void;
}

const AccountDisabledNotification: React.FC<AccountDisabledNotificationProps> = ({
  message,
  onClose
}) => {
  const [countdown, setCountdown] = useState(15);

  const handleLogout = () => {
    onClose();
    
    // Clear auth data manually thay vì dùng forceLogout (để không redirect về trang chủ)
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('english_learning_token');
    localStorage.removeItem('english_learning_user');
    
    // Reset auth store
    const authStore = useAuthStore.getState();
    authStore.logout();
    
    // Reload trang để về trang login, không redirect về trang chủ
    window.location.reload();
  };

  useEffect(() => {
    // Countdown timer từ 15 về 0
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []); // Bỏ dependency để tránh re-render

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tài khoản bị khóa
            </h3>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Bạn sẽ được đăng xuất tự động trong <span className="font-semibold text-red-600">{countdown}</span> giây...
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledNotification;
