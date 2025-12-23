import React from 'react';
import { Linkedin, Instagram, Github } from 'lucide-react';
import Logo from '@/components/common/Logo/Logo';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.logoContainer}>
              <Logo height={32} color="#1a1a1a" />
              <h2 className={styles.logoText}>EngPro</h2>
            </div>
            <p className={styles.description}>
              Nền tảng học tiếng Anh trực tuyến hàng đầu với công nghệ AI tiên tiến, 
              giúp hàng triệu học viên chinh phục ước mơ tiếng Anh.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="X (Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Khóa học</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Tiếng Anh cơ bản</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>IELTS</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>TOEIC</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Giao tiếp</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Tài nguyên</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Tài liệu</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Hướng dẫn</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Blog</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Hỗ trợ</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Công ty</h3>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Về chúng tôi</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Tuyển dụng</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Liên hệ</a>
              </li>
              <li className={styles.linkItem}>
                <a href="#" className={styles.link}>Đối tác</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>© 2025 EngPro. Tất cả quyền được bảo lưu.</p>
            <div className={styles.legalLinks}>
              <a href="#" className={styles.legalLink}>Chính sách bảo mật</a>
              <a href="#" className={styles.legalLink}>Điều khoản dịch vụ</a>
              <a href="#" className={styles.legalLink}>Cài đặt Cookie</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;