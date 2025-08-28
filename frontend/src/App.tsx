import { useState, useEffect } from 'react';
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
import IELTSExamList from './components/ielts/IELTSExamList';
import AccountDisabledNotification from './components/AccountDisabledNotification';
import { useAuthStore } from './stores/authStore';
import { useHeartbeat } from './hooks/useHeartbeat';
import { useActivityHeartbeat } from './hooks/useActivityHeartbeat';
import { setupGlobalErrorInterceptor } from './utils/errorInterceptor';

type Page = 'home' | 'login' | 'register' | 'auth' | 'placement-test' | 'dashboard' | 'courses' | 'profile' | 'practice';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user, isAuthenticated } = useAuthStore();
  
  // Initialize heartbeat for authenticated users and get account disabled state
  const { accountDisabledMessage, clearAccountDisabledMessage } = useHeartbeat();
  
  // Initialize activity-based heartbeat for faster detection
  useActivityHeartbeat();

  // Setup global error interceptor on app start
  useEffect(() => {
    setupGlobalErrorInterceptor();
  }, []);

  const handleNavigation = (page: string) => {
    const validPages: Page[] = ['home', 'login', 'register', 'auth', 'placement-test', 'dashboard', 'courses', 'profile', 'practice'];
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
      return <UserProfile onBack={() => setCurrentPage('home')} onNavigateToCourses={() => setCurrentPage('courses')} />;
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

  if (currentPage === 'practice') {
    return <IELTSExamList onBack={() => setCurrentPage('home')} />;
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
      
      {/* Account Disabled Notification */}
      {accountDisabledMessage && (
        <AccountDisabledNotification
          message={accountDisabledMessage}
          onClose={clearAccountDisabledMessage}
        />
      )}
    </div>
  );
}

export default App;