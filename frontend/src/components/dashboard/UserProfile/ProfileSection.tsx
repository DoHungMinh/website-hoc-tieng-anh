import React from 'react';
import { Shield, Edit3, Save, X, LogOut } from 'lucide-react';
import { EditFormData } from './types';
import AvatarDisplay from '@/components/common/AvatarDisplay';
import styles from './UserProfile.module.css';

interface ProfileSectionProps {
  user: {
    fullName?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null;
  editForm: EditFormData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
  onAvatarClick: () => void;
  onLogout: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  editForm,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
  onAvatarClick,
  onLogout,
}) => {
  return (
    <div>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div 
          className={styles.profileAvatar}
          onClick={onAvatarClick}
        >
          <AvatarDisplay
            src={user?.avatar}
            name={user?.fullName || ''}
            size="xl"
            showOnlineStatus={false}
            bgColor="from-gray-800 to-gray-900"
          />
        </div>
        
        <div className={styles.profileInfo}>
          <h2>{user?.fullName || 'Tên người dùng'}</h2>
          <p>{user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
          <p>Hà Nội, Việt Nam</p>
          <div className={styles.profileBadge}>
            <Shield className="h-3 w-3 mr-1" />
            Đã xác minh
          </div>
        </div>
        
        {!isEditing && (
          <button onClick={onEdit} className={styles.editButton}>
            <Edit3 size={16} />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Personal Information */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Thông tin cá nhân</h3>
          {!isEditing && (
            <button onClick={onEdit} className={styles.editButton}>
              <Edit3 size={16} />
              Chỉnh sửa
            </button>
          )}
        </div>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tên</label>
            <input
              type="text"
              value={editForm.fullName.split(' ')[0] || ''}
              onChange={(e) => {
                const lastName = editForm.fullName.split(' ').slice(1).join(' ');
                onInputChange('fullName', `${e.target.value} ${lastName}`.trim());
              }}
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Tên"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Họ</label>
            <input
              type="text"
              value={editForm.fullName.split(' ').slice(1).join(' ')}
              onChange={(e) => {
                const firstName = editForm.fullName.split(' ')[0] || '';
                onInputChange('fullName', `${firstName} ${e.target.value}`.trim());
              }}
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Họ"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Địa chỉ email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Địa chỉ email"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số điện thoại</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Số điện thoại"
            />
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Tiểu sử</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              className={styles.formTextarea}
              readOnly={!isEditing}
              placeholder="Tiểu sử"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Địa chỉ</h3>
          {!isEditing && (
            <button onClick={onEdit} className={styles.editButton}>
              <Edit3 size={16} />
              Chỉnh sửa
            </button>
          )}
        </div>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quốc gia</label>
            <input
              type="text"
              value="Việt Nam"
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Quốc gia"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Thành phố/Tỉnh</label>
            <input
              type="text"
              value="Hà Nội, Việt Nam"
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Thành phố/Tỉnh"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mã bưu điện</label>
            <input
              type="text"
              value="100000"
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Mã bưu điện"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mã số thuế</label>
            <input
              type="text"
              value=""
              className={styles.formInput}
              readOnly={!isEditing}
              placeholder="Mã số thuế"
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className={styles.formActions}>
          <button onClick={onSave} className={styles.saveButton}>
            <Save size={16} />
            Lưu thay đổi
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            <X size={16} />
            Hủy
          </button>
        </div>
      )}

      {/* Logout Button - Mobile Only */}
      <button onClick={onLogout} className={styles.mobileLogout}>
        <LogOut size={18} />
        Đăng xuất
      </button>
    </div>
  );
};

export default ProfileSection;
