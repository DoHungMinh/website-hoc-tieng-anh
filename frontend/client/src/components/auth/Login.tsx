import React, { useState } from 'react';
import { Eye, EyeOff, Home } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    const newErrors: { [key: string]: string } = {};

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

            {/* Guest Mode Button */}
            <button
              type="button"
              onClick={onBackToHome}
              className={styles.googleButton}
            >
              <Home className={styles.googleIcon} />
              Tiếp tục với tư cách khách
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