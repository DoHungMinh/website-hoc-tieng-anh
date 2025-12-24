import React, { useState, useEffect, useCallback, memo } from "react";
import { useLocation, Link } from "react-router-dom";
import { BookOpen, Menu, X, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
    useNotificationStore,
    loadNotificationsFromStorage,
} from "@/stores/notificationStore";
import NotificationDropdown from "../common/NotificationDropdown";
import AvatarDisplay from "@/components/common/AvatarDisplay";
import Logo from "@/components/common/Logo/Logo";
import styles from "./Header.module.css";

interface HeaderProps {
    /** Current page for header navigation state */
    currentPage?: string;
}

/** Navigation items */
const NAV_ITEMS = [
    { path: "/", label: "Trang chủ", key: "home" },
    { path: "/courses", label: "Khóa học", key: "courses" },
    { path: "/practice", label: "Luyện tập", key: "practice" },
    { path: "/pricing", label: "Bảng giá", key: "pricing" },
    { path: "/aichat", label: "AI Speaking", key: "voice" },
    { path: "/contact", label: "Liên hệ", key: "contact" },
];

/**
 * Header component with navigation and user actions
 * Uses React Router for navigation
 * Design based on modern minimal style with pill navigation
 */
const Header: React.FC<HeaderProps> = memo(({ currentPage: currentPageProp }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Atomic selectors - tránh re-render không cần thiết
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const { unreadCount, isDropdownOpen, setDropdownOpen } =
        useNotificationStore();

    // React Router hooks
    const location = useLocation();

    // Load notifications từ localStorage khi component mount
    useEffect(() => {
        loadNotificationsFromStorage();
    }, []);

    const toggleNotificationDropdown = useCallback(() => {
        setDropdownOpen(!isDropdownOpen);
    }, [isDropdownOpen, setDropdownOpen]);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    // Check if current path matches nav item
    const isActive = useCallback(
        (path: string) => {
            if (path === "/") {
                return location.pathname === "/";
            }
            return location.pathname.startsWith(path);
        },
        [location.pathname]
    );

    return (
        <header className={styles.header}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>
                <Logo color="#181D27" />
                <span className={styles.logoText}>EngPro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.key}
                        to={item.path}
                        className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ""
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Right Section */}
            <div className={styles.rightSection}>
                {/* Language Selector */}


                {isAuthenticated ? (
                    <>


                        {/* Notification Bell */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={toggleNotificationDropdown}
                                className={styles.notificationButton}
                            >
                                <Bell className={styles.bellIcon} />
                                {unreadCount > 0 && (
                                    <span className={styles.notificationBadge}>
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            <NotificationDropdown
                                isOpen={isDropdownOpen}
                                onClose={() => setDropdownOpen(false)}
                            />
                        </div>


                        {/* User Profile Button */}
                        <Link to="/profile" className={styles.userButton}>
                            <AvatarDisplay
                                src={user?.avatar}
                                name={user?.fullName || ""}
                                size="sm"
                                showOnlineStatus={false}
                                bgColor="from-gray-800 to-gray-900"
                            />
                            <span className={styles.userName}>
                                {user?.fullName}
                            </span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={styles.loginButton}>
                            Đăng nhập
                        </Link>
                        <Link to="/register" className={styles.signUpButton}>
                            Đăng ký
                        </Link>
                    </>
                )}

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={styles.mobileMenuButton}
                >
                    {isMenuOpen ? (
                        <X className={styles.menuIcon} />
                    ) : (
                        <Menu className={styles.menuIcon} />
                    )}
                </button>
            </div>

            {/* Mobile Navigation */}
            <div
                className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ""
                    }`}
            >
                <div className={styles.mobileNavList}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.key}
                            to={item.path}
                            onClick={closeMenu}
                            className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.mobileNavLinkActive : ""
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.mobileAuthSection}>
                    {isAuthenticated ? (
                        <>
                            {/* User Profile */}
                            <Link
                                to="/profile"
                                onClick={closeMenu}
                                className={styles.mobileUserButton}
                            >
                                <AvatarDisplay
                                    src={user?.avatar}
                                    name={user?.fullName || ""}
                                    size="sm"
                                    showOnlineStatus={false}
                                    bgColor="from-gray-800 to-gray-900"
                                />
                                <span className={styles.mobileUserName}>
                                    {user?.fullName}
                                </span>
                            </Link>


                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                onClick={closeMenu}
                                className={styles.mobileCTAButton}
                            >
                                Bắt đầu học miễn phí
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
});

Header.displayName = "Header";

export default Header;
