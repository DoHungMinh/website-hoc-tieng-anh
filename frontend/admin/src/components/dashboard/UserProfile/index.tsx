import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '../../common/Toast';
import ConfirmModal from '../../common/ConfirmModal';

import ProfileSidebar, { tabs } from './ProfileSidebar';
import ProfileSection from './ProfileSection';
import PasswordSection from './PasswordSection';
import AvatarModal from './AvatarModal';
import { ProfileTab, EditFormData, PasswordFormData, UserProfileProps } from './types';
import styles from './UserProfile.module.css';

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const navigate = useNavigate();
  
  // Atomic selectors để tối ưu performance
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  
  const { toasts, removeToast, success, error } = useToast();
  
  // UI State
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [editForm, setEditForm] = useState<EditFormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || '',
    bio: user?.bio || '',
    learningGoal: user?.learningGoal || '',
    level: user?.level || 'Beginner'
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile on component mount
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch('http://localhost:5002/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data, token);
        setEditForm({
          fullName: data.data.fullName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          birthDate: data.data.birthDate || '',
          bio: data.data.bio || '',
          learningGoal: data.data.learningGoal || '',
          level: data.data.level || 'Beginner'
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token, setUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handlers
  const handleLogout = useCallback(() => {
    logout();
    onBack();
  }, [logout, onBack]);

  const handleNavigateAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordChange = useCallback((field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
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
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await fetch('http://localhost:5002/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          birthDate: editForm.birthDate,
          bio: editForm.bio,
          learningGoal: editForm.learningGoal,
          level: editForm.level
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data, token);
        success('Thành công!', 'Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        error('Lỗi!', data.message || 'Lỗi khi cập nhật thông tin');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      error('Lỗi!', 'Không thể cập nhật thông tin');
    }
  }, [user, token, editForm, setUser, success, error]);

  const handlePasswordSave = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Lỗi!', 'Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error('Lỗi!', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (!passwordForm.currentPassword) {
      error('Lỗi!', 'Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    try {
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
        success('Thành công!', 'Đổi mật khẩu thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        error('Lỗi!', data.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      error('Lỗi!', 'Có lỗi xảy ra khi đổi mật khẩu!');
    }
  }, [token, passwordForm, success, error]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user || !token) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      error('Lỗi!', 'Vui lòng chọn file ảnh!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Lỗi!', 'Kích thước file không được vượt quá 5MB!');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`http://localhost:5002/api/user/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, avatar: data.data.avatar };
        setUser(updatedUser, token);
        setShowAvatarModal(false);
        success('Thành công!', 'Cập nhật ảnh đại diện thành công!');
      } else {
        error('Lỗi!', data.message || 'Lỗi khi upload ảnh');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      error('Lỗi!', 'Không thể upload ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, token, setUser, success, error]);

  const handleAvatarDelete = useCallback(async () => {
    if (!user || !token || !user.avatar) return;

    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`http://localhost:5002/api/user/${user.id}/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, avatar: undefined };
        setUser(updatedUser, token);
        setShowAvatarModal(false);
        success('Thành công!', 'Xóa ảnh đại diện thành công!');
      } else {
        error('Lỗi!', data.message || 'Lỗi khi xóa ảnh');
      }
    } catch (err) {
      console.error('Avatar delete error:', err);
      error('Lỗi!', 'Không thể xóa ảnh đại diện');
    }
  }, [user, token, setUser, success, error]);

  // Get active tab title
  const getActiveTabTitle = useCallback(() => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.label || 'Hồ sơ cá nhân';
  }, [activeTab]);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSection
            user={user}
            editForm={editForm}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onInputChange={handleInputChange}
            onAvatarClick={() => setShowAvatarModal(true)}
            onLogout={handleLogout}
            onNavigateAdmin={user?.role === 'admin' ? handleNavigateAdmin : undefined}
          />
        );
      case 'password':
      case 'security':
        return (
          <PasswordSection
            passwordForm={passwordForm}
            showPassword={showPassword}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            onPasswordChange={handlePasswordChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            onSave={handlePasswordSave}
          />
        );
      default:
        return (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sắp ra mắt</h3>
            <p>Phần {activeTab.replace('-', ' ')} đang được phát triển.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.userProfile}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <ProfileSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            isAdmin={user?.role === 'admin'}
            onNavigateAdmin={handleNavigateAdmin}
          />

          <div className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>{getActiveTabTitle()}</h2>
            </div>
            
            <div className={styles.contentBody}>
              {isLoadingProfile ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarModal
        isOpen={showAvatarModal}
        avatar={user?.avatar}
        isUploading={isUploadingAvatar}
        onClose={() => setShowAvatarModal(false)}
        onUpload={handleAvatarUpload}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xóa ảnh đại diện"
        message="Bạn có chắc chắn muốn xóa ảnh đại diện không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleAvatarDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default UserProfile;
