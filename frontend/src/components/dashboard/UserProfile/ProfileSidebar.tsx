import React from 'react';
import { User, Shield, Users, UserCheck, Bell, CreditCard, Download, Trash2, LogOut } from 'lucide-react';
import { ProfileTab, TabItem } from './types';
import styles from './UserProfile.module.css';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
}

const tabs: TabItem[] = [
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'billing', label: 'Thanh toán', icon: CreditCard },
  { id: 'delete-account', label: 'Xóa tài khoản', icon: Trash2, danger: true },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout 
}) => {
  return (
    <div className={styles.sidebar}>
      <h1 className={styles.sidebarTitle}>Cài đặt tài khoản</h1>
      
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${styles.tabItem} ${
              activeTab === tab.id ? styles.active : ''
            } ${tab.danger ? styles.danger : ''}`}
          >
            <tab.icon className={styles.tabIcon} />
            {tab.label}
          </button>
        ))}
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`${styles.tabItem} ${styles.logout}`}
        >
          <LogOut className={styles.tabIcon} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
export { tabs };
