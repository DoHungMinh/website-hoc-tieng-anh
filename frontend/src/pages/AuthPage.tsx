import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

interface AuthPageProps {
  onClose?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    // Close auth page and return to home
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {isLogin ? (
        <Login 
          onSwitchToRegister={() => setIsLogin(false)} 
          onLoginSuccess={handleSuccess}
        />
      ) : (
        <Register 
          onSwitchToLogin={() => setIsLogin(true)} 
          onRegisterSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default AuthPage;
