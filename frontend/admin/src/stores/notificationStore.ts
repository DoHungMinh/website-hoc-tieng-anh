import { create } from 'zustand';

interface CourseNotification {
  id: string;
  courseId: string;
  courseName: string;
  purchaseDate: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: CourseNotification[];
  unreadCount: number;
  isDropdownOpen: boolean;
  addNotification: (courseId: string, courseName: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setDropdownOpen: (isOpen: boolean) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isDropdownOpen: false,

  addNotification: (courseId: string, courseName: string) => {
    const newNotification: CourseNotification = {
      id: Date.now().toString(),
      courseId,
      courseName,
      purchaseDate: new Date().toISOString(),
      isRead: false,
    };

    set((state) => {
      const newNotifications = [newNotification, ...state.notifications];
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      
      // Lưu vào localStorage để persist
      localStorage.setItem('course_notifications', JSON.stringify(newNotifications));
      
      return {
        notifications: newNotifications,
        unreadCount,
      };
    });
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      localStorage.setItem('course_notifications', JSON.stringify(updatedNotifications));
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
      
      localStorage.setItem('course_notifications', JSON.stringify(updatedNotifications));
      
      return {
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    });
  },

  setDropdownOpen: (isOpen: boolean) => {
    set({ isDropdownOpen: isOpen });
  },

  clearNotifications: () => {
    localStorage.removeItem('course_notifications');
    set({
      notifications: [],
      unreadCount: 0,
      isDropdownOpen: false,
    });
  },
}));

// Load notifications từ localStorage khi app khởi động
export const loadNotificationsFromStorage = () => {
  try {
    const saved = localStorage.getItem('course_notifications');
    if (saved) {
      const notifications: CourseNotification[] = JSON.parse(saved);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      useNotificationStore.setState({
        notifications,
        unreadCount,
      });
    }
  } catch (error) {
    console.error('Error loading notifications from storage:', error);
  }
};