import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Practice from './components/Practice';
import Progress from './components/Progress';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import PlacementTest from './components/assessment/PlacementTest';
import ProgressDashboard from './components/dashboard/ProgressDashboard';
import { useAuthStore } from './stores/authStore';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'placement-test' | 'dashboard'>('home');
  const { user, isAuthenticated } = useAuthStore();

  const handleAuthClick = () => {
    setCurrentPage('login');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('home');
  };

  const handleAdminLogout = () => {
    setCurrentPage('home');
  };

  // If user is admin and authenticated, show admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // If user is authenticated (regular user), show user dashboard
  if (isAuthenticated && user?.role === 'user') {
    if (currentPage === 'placement-test') {
      return <PlacementTest />;
    }
    if (currentPage === 'dashboard') {
      return <ProgressDashboard />;
    }
  }

  if (currentPage === 'login') {
    return (
      <Login
        onLoginSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Register
        onRegisterSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'placement-test') {
    return <PlacementTest />;
  }

  if (currentPage === 'dashboard') {
    return <ProgressDashboard />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={handleAuthClick} />
      <Hero />
      <Features />
      <Practice />
      <Progress />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;