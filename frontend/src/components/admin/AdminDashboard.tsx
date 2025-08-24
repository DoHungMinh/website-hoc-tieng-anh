import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import DashboardStats from './dashboard/DashboardStats';
import UserManagement from './dashboard/UserManagement';
import CourseManagement from './dashboard/CourseManagement';
import ExamManagement from './dashboard/ExamManagementNew';
import PaymentManagement from './dashboard/PaymentManagement';
import AIManagement from './dashboard/AIManagement';
import Settings from './dashboard/Settings';

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'ai':
        return <AIManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
