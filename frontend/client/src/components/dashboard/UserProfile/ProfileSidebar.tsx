import React from 'react';
import { User, Shield, Users, UserCheck, Bell, CreditCard, Download, Trash2, LogOut, LayoutDashboard } from 'lucide-react';
import { ProfileTab, TabItem } from './types';
import styles from './UserProfile.module.css';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
  isAdmin?: boolean;
  onNavigateAdmin?: () => void;
}

const tabs: TabItem[] = [
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'billing', label: 'Thanh toán', icon: CreditCard }
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout,
  isAdmin,
  onNavigateAdmin,
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
        
        {/* Admin Dashboard Button - Show only for admin */}
        {isAdmin && onNavigateAdmin && (
          <button
            onClick={onNavigateAdmin}
            className={`${styles.tabItem} ${styles.adminTab}`}
          >
            <LayoutDashboard className={styles.tabIcon} />
            Admin Dashboard
          </button>
        )}
        
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
