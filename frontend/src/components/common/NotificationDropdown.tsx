import React, { useState } from 'react';
import { BookOpen, Settings, Paperclip } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'inbox' | 'general'>('inbox');

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const getAvatarClass = (index: number) => {
    const classes = [styles.avatarPink, styles.avatarGreen, styles.avatarPurple];
    return classes[index % classes.length];
  };

  const getEmoji = (index: number) => {
    const emojis = ['👨🏻', '👨🏻', '👩🏾', '👨🏾'];
    return emojis[index % emojis.length];
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.dropdown}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Thông báo</h3>
          <button onClick={markAllAsRead} className={styles.markAllRead}>
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`${styles.tab} ${activeTab === 'inbox' ? styles.tabActive : ''}`}
          >
            Hộp thư
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
          >
            Chung
          </button>
          <button className={styles.settingsButton}>
            <Settings size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen className={styles.emptyIcon} />
              <p>Chưa có thông báo nào</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Các khóa học bạn mua sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={styles.notificationItem}
                >
                  <div className={`${styles.avatar} ${getAvatarClass(index)}`}>
                    {getEmoji(index)}
                  </div>
                  
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationTitle}>
                      {notification.courseName}
                    </p>
                    <p className={styles.notificationMeta}>
                      {formatDate(notification.purchaseDate)}
                      <span className={styles.metaSeparator} />
                      Khóa học mới
                    </p>

                    {/* Example action buttons for specific notifications */}
                    {index === 2 && (
                      <div className={styles.actions}>
                        <button className={styles.declineButton}>Từ chối</button>
                        <button className={styles.acceptButton}>Chấp nhận</button>
                      </div>
                    )}

                    {/* Example file attachment */}
                    {index === 3 && (
                      <div className={styles.attachment}>
                        <Paperclip className={styles.attachmentIcon} />
                        <span>Tài liệu khóa học.pdf</span>
                      </div>
                    )}
                  </div>

                  {!notification.isRead && (
                    <div className={styles.unreadDot} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;