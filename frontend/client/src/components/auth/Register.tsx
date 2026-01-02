import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/components/common/Logo/Logo';
import styles from './Register.module.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
  onBackToHome?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegisterSuccess, onBackToHome }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng';
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
      // Prepare registration data
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      
      const response = await authAPI.register(registerData);
      
      if (response.success && response.user && response.token) {
        // Save user to store
        setUser(response.user, response.token);
        
        // Show success message (optional)
        console.log('Registration successful:', response.message);
        
        // Call success callback if provided
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      } else {
        setErrors({ general: response.message || 'Đăng ký thất bại' });
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
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
              "Đăng ký ngay để bắt đầu hành trình chinh phục tiếng Anh cùng EngPro!"
            </p>
            <div className={styles.author}>
              <p className={styles.authorName}>Đỗ Văn Dương</p>
              <p className={styles.authorTitle}>Học viên mới</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Tạo tài khoản</h1>
            <p className={styles.subtitle}>Bắt đầu hành trình học tiếng Anh của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Error Alert */}
            {errors.general && (
              <div className={styles.errorAlert}>
                <p className={styles.errorText}>{errors.general}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                placeholder="Nhập họ và tên của bạn"
              />
              {errors.fullName && (
                <p className={styles.fieldError}>{errors.fullName}</p>
              )}
            </div>

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
                placeholder="Nên nhập email chính xác của bạn để được đảm bảo quyền lợi"
              />
              {errors.email && (
                <p className={styles.fieldError}>{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="0123456789"
              />
              {errors.phone && (
                <p className={styles.fieldError}>{errors.phone}</p>
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

            {/* Confirm Password Field */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Xác nhận mật khẩu
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={styles.fieldError}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Tôi đồng ý với{' '}
                <a href="#" className={styles.checkboxLink}>Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="#" className={styles.checkboxLink}>Chính sách bảo mật</a>
              </span>
            </label>
            {errors.terms && (
              <p className={styles.fieldError}>{errors.terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                'Tạo tài khoản'
              )}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>HOẶC</span>
            </div>
            {/* Login Link */}
            <p className={styles.loginText}>
              Đã có tài khoản? <button type="button" onClick={onSwitchToLogin} className={styles.loginLink}>Đăng nhập</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;