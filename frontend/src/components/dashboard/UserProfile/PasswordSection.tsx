import React from 'react';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import { PasswordFormData } from './types';

interface PasswordSectionProps {
  passwordForm: PasswordFormData;
  showPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onSave: () => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  passwordForm,
  showPassword,
  showNewPassword,
  showConfirmPassword,
  onPasswordChange,
  onTogglePassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onSave,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-800 to-black rounded-lg flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Thay đổi mật khẩu</h3>
        </div>

        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => onPasswordChange('newPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
              <button
                type="button"
                onClick={onToggleNewPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={onToggleConfirmPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={onSave}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Cập nhật mật khẩu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordSection;
