import React, { useState } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, LogOut, ArrowLeft, Shield, BookOpen, Award, Target, Phone, MapPin, GraduationCap, Heart, Lock, Eye, EyeOff, Play, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUserEnrollments } from '../hooks/useUserEnrollments';

interface UserProfileProps {
  onBack: () => void;
  onNavigateToCourses: () => void;
}

type ProfileTab = 'profile' | 'password' | 'courses' | 'achievements';

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onNavigateToCourses }) => {
  const { user, logout, setUser, token } = useAuthStore();
  const { enrollments, stats, loading: enrollmentsLoading, error: enrollmentsError } = useUserEnrollments();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
    learningGoal: user?.learningGoal || '',
    level: user?.level || 'Beginner'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile' as ProfileTab, label: 'Thông tin cá nhân', icon: User },
    { id: 'password' as ProfileTab, label: 'Đổi mật khẩu', icon: Lock },
    { id: 'courses' as ProfileTab, label: 'Khóa học của tôi', icon: BookOpen },
    { id: 'achievements' as ProfileTab, label: 'Thành tích', icon: Award },
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (user && token) {
      setUser({
        ...user,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        birthDate: editForm.birthDate,
        bio: editForm.bio,
        learningGoal: editForm.learningGoal,
        level: editForm.level
      }, token);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || '',
      learningGoal: user?.learningGoal || '',
      level: user?.level || 'Beginner'
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    onBack();
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSave = async () => {
    // Validate password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (!passwordForm.currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    try {
      // Call API to change password
      const response = await fetch('http://localhost:5002/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Đổi mật khẩu thành công!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu!');
    }
  };

  const renderPasswordContent = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-lime-500 rounded-lg flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Thay đổi mật khẩu</h3>
        </div>
        
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePasswordSave}
              className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Cập nhật mật khẩu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-8">
      {/* Profile Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-lime-500 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
            <p className="text-gray-500 text-sm">Quản lý thông tin cá nhân và học tập của bạn</p>
          </div>
        </div>
        
        {/* Edit Buttons */}
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
            >
              <Edit3 className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-lime-500 hover:bg-lime-400 text-green-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
              >
                <Save className="h-4 w-4" />
                <span>Lưu</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
              >
                <X className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-lime-500 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập họ và tên"
              />
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <User className="h-5 w-5 text-green-500" />
                <span className="text-gray-900 font-medium">{user?.fullName || 'Chưa cập nhật'}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập email"
              />
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-gray-900">{user?.email}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Phone className="h-5 w-5 text-green-500" />
                <span className="text-gray-900">{editForm.phone || 'Chưa cập nhật'}</span>
              </div>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            {isEditing ? (
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Calendar className="h-5 w-5 text-green-500" />
                <span className="text-gray-900">
                  {editForm.birthDate ? new Date(editForm.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Information Card */}
      <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-lime-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Thông tin học tập</h3>
        </div>

        <div className="space-y-6">
          {/* Learning Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trình độ hiện tại</label>
            {isEditing ? (
              <select
                value={editForm.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Beginner">Beginner (A1-A2)</option>
                <option value="Intermediate">Intermediate (B1-B2)</option>
                <option value="Advanced">Advanced (C1-C2)</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Target className="h-5 w-5 text-green-500" />
                <span className="text-gray-900 font-medium">{editForm.level}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  editForm.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                  editForm.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {editForm.level === 'Beginner' ? 'Cơ bản' :
                   editForm.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                </span>
              </div>
            )}
          </div>

          {/* Learning Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu học tập</label>
            {isEditing ? (
              <textarea
                value={editForm.learningGoal}
                onChange={(e) => handleInputChange('learningGoal', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Chia sẻ mục tiêu học tập của bạn..."
              />
            ) : (
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-gray-900 leading-relaxed">
                    {editForm.learningGoal || 'Chưa đặt mục tiêu cụ thể. Hãy chia sẻ động lực học tiếng Anh của bạn!'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Me Card */}
      <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-lime-500 rounded-lg flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Giới thiệu bản thân</h3>
        </div>

        {isEditing ? (
          <textarea
            value={editForm.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Chia sẻ câu chuyện về bản thân bạn..."
          />
        ) : (
          <div className="p-4 bg-white rounded-lg border">
            <p className="text-gray-900 leading-relaxed">
              {editForm.bio || 'Chưa có giới thiệu. Hãy chia sẻ những điều thú vị về bản thân bạn!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoursesContent = () => {
    if (enrollmentsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
        </div>
      );
    }

    if (enrollmentsError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">❌ Lỗi tải khóa học: {enrollmentsError}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có khóa học nào</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bắt đầu hành trình học tiếng Anh của bạn bằng cách tham gia các khóa học chất lượng của chúng tôi.
            </p>
            <button 
              onClick={onNavigateToCourses}
              className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Khám phá khóa học
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <div className="text-blue-100">Tổng khóa học</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.activeCourses}</div>
              <div className="text-green-100">Đang học</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
              <div className="text-purple-100">Hoàn thành</div>
            </div>
          </div>
        )}

        {/* Learning Analytics */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              Tổng quan tiến độ học tập
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Tiến độ tổng thể</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.overallProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-lime-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  Hoạt động gần đây
                </h4>
                <div className="space-y-2">
                  {enrollments.slice(0, 2).map((enrollment, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="truncate">
                        Học {enrollment.courseId.title} - {enrollment.progress.completionPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course List */}
        <div className="grid gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{enrollment.courseId.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : enrollment.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status === 'completed' ? 'Hoàn thành' : 
                       enrollment.status === 'active' ? 'Đang học' : 'Tạm dừng'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{enrollment.courseId.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>📚 {enrollment.courseId.lessonsCount} bài học</span>
                    <span>⏱️ {enrollment.courseId.duration}</span>
                    <span>📊 {enrollment.courseId.level}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Tiến độ</span>
                      <span className="text-sm font-medium text-gray-900">
                        {enrollment.progress.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-lime-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Tiếp tục học</span>
                    </button>
                    
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Courses Button */}
        <div className="text-center pt-6">
          <button 
            onClick={onNavigateToCourses}
            className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Khám phá thêm khóa học
          </button>
        </div>
      </div>
    );
  };

  const renderAchievementsContent = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có thành tích nào</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Tiếp tục học tập chăm chỉ để mở khóa các thành tích đầu tiên của bạn!
        </p>
        <div className="inline-flex items-center space-x-2 text-green-600 font-medium">
          <Target className="h-5 w-5" />
          <span>Hãy bắt đầu với bài học đầu tiên</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'password':
        return renderPasswordContent();
      case 'courses':
        return renderCoursesContent();
      case 'achievements':
        return renderAchievementsContent();
      default:
        return renderProfileContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-lime-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-white hover:text-lime-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Tài khoản của tôi</h1>
                <p className="text-lime-200 text-sm">Quản lý thông tin cá nhân và học tập</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-lime-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-3 border-white">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user?.fullName}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{user?.email}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <span className="capitalize">{user?.role || 'Học viên'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 border border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;