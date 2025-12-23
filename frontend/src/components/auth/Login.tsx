import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/auth';
import { STORAGE_KEYS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/components/common/Logo/Logo';
import styles from './Login.module.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
  onBackToHome?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLoginSuccess, onBackToHome }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Atomic selector để tối ưu performance
  const setUser = useAuthStore((state) => state.setUser);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authAPI.login(formData);
      
      if (response.success && response.user && response.token) {
        // Save user to store
        setUser(response.user, response.token);
        // Also persist token under unified key for ApiService immediate usage
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        // Also set token for admin components
        localStorage.setItem('token', response.token);
        
        // Show success message (optional)
        console.log('Login successful:', response.message);
        
        // Call success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setErrors({ general: response.message || 'Đăng nhập thất bại' });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi kết nối. Vui lòng thử lại.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Side - Image & Testimonial */}
      <div className={styles.leftSide}>
        <div className={styles.leftContent}>
          <div className={styles.logoSection}>
            <Logo color="#ffffff" />
            <span className={styles.brandName}>EngPro</span>
          </div>

          <div className={styles.testimonial}>
            <p className={styles.quote}>
              "Nền tảng học tiếng Anh tuyệt vời nhất mà tôi từng sử dụng."
            </p>
            <div className={styles.author}>
              <p className={styles.authorName}>Đỗ Minh Mân</p>
              <p className={styles.authorTitle}>Học viên xuất sắc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Chào mừng trở lại EngPro</h1>
            <p className={styles.subtitle}>Tiếp tục hành trình học tiếng Anh của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* General Error Message */}
            {errors.general && (
              <div className={styles.errorAlert}>
                <p className={styles.errorText}>{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="alex.jordan@gmail.com"
              />
              {errors.email && (
                <p className={styles.fieldError}>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Mật khẩu
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className={styles.fieldError}>{errors.password}</p>
              )}
            </div>

            <a href="#" className={styles.forgotPassword}>
              Quên mật khẩu?
            </a>

            {/* Remember Me */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Ghi nhớ đăng nhập</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>HOẶC</span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className={styles.googleButton}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>

            {/* Sign Up Link */}
            <p className={styles.signupText}>
              Chưa có tài khoản? <button type="button" onClick={onSwitchToRegister} className={styles.signupLink}>Đăng ký</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;