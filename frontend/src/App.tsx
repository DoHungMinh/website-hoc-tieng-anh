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
import CourseApp from './components/CourseApp';
import NewCourseNotification from './components/NewCourseNotification';
import UserProfile from './components/UserProfile';
import { useAuthStore } from './stores/authStore';

type Page = 'home' | 'login' | 'register' | 'auth' | 'placement-test' | 'dashboard' | 'courses' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user, isAuthenticated } = useAuthStore();

  const handleNavigation = (page: string) => {
    const validPages: Page[] = ['home', 'login', 'register', 'auth', 'placement-test', 'dashboard', 'courses', 'profile'];
    if (validPages.includes(page as Page)) {
      // Nếu navigate đến 'auth', chuyển đến 'register' (trang đăng ký)
      if (page === 'auth') {
        setCurrentPage('register');
      } else {
        setCurrentPage(page as Page);
      }
    }
  };

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
      return <ProgressDashboard onNavigate={handleNavigation} />;
    }
    if (currentPage === 'profile') {
      return <UserProfile onBack={() => setCurrentPage('home')} />;
    }
  }

  if (currentPage === 'login') {
    return (
      <Login
        onLoginSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setCurrentPage('register')}
        onBackToHome={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Register
        onRegisterSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setCurrentPage('login')}
        onBackToHome={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'placement-test') {
    return <PlacementTest />;
  }

  if (currentPage === 'dashboard') {
    return <ProgressDashboard onNavigate={handleNavigation} />;
  }

  if (currentPage === 'courses') {
    return <CourseApp 
      onBack={() => setCurrentPage('home')} 
      onAuthRequired={() => setCurrentPage('login')} 
    />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={handleAuthClick} onNavigate={handleNavigation} />
      <Hero />
      <Features onNavigate={handleNavigation} />
      <Practice />
      <Progress />
      <Footer />
      <Chatbot />
      <NewCourseNotification onNavigate={handleNavigation} />
    </div>
  );
}

export default App;