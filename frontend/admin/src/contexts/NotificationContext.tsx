import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface NotificationContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};