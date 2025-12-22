import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Hero from "./components/layout/landing/Hero";
import Features from "./components/layout/landing/Features";
import Practice from "./components/learning/Practice";
import Progress from "./components/dashboard/Progress";
import Footer from "./components/layout/Footer";
import Chatbot from "./components/chatbot/Chatbot";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminDashboard from "./components/admin/AdminDashboard";
import PlacementTest from "./components/assessment/PlacementTest";
import CourseApp from "./components/learning/CourseApp";
import UserProfile from "./components/dashboard/UserProfile";
import IELTSExamList from "./components/ielts/IELTSExamList";
import AccountDisabledNotification from "./components/common/AccountDisabledNotification";
import PaymentSuccessHandler from "./components/learning/PaymentSuccessHandler";
import { AuthDebugger } from "./components/auth/AuthDebugger";
import { useAuthStore } from "./stores/authStore";
import { syncTokens } from "./utils/tokenSync";
// import { useHeartbeat } from "./hooks/useHeartbeat"; // TẠMTHỜI TẮT để tránh crash backend
import { useActivityHeartbeat } from "./hooks/useActivityHeartbeat";
import { setupGlobalErrorInterceptor } from "./utils/errorInterceptor";

type Page =
    | "home"
    | "login"
    | "register"
    | "auth"
    | "placement-test"
    | "dashboard"
    | "courses"
    | "profile"
    | "practice";

function App() {
    const [currentPage, setCurrentPage] = useState<Page>("home");
    const { user, isAuthenticated } = useAuthStore();

    // Check if we're on payment success page
    const isPaymentSuccessPage =
        window.location.pathname.includes("/payment/success");

    // Initialize heartbeat for authenticated users and get account disabled state
    // TẠMTHỜI TẮT Regular Heartbeat để tránh crash backend - chỉ dùng activity heartbeat
    // const { accountDisabledMessage, clearAccountDisabledMessage } = useHeartbeat();

    // Initialize activity-based heartbeat for faster detection
    useActivityHeartbeat(); // Re-enabled với throttling tốt hơn

    // Mock disabled message state for now - activity heartbeat will handle via events
    const [accountDisabledMessage, setAccountDisabledMessage] = useState<
        string | null
    >(null);
    const clearAccountDisabledMessage = () => setAccountDisabledMessage(null);

    // Listen for account disabled events from activity heartbeat
    useEffect(() => {
        const handleAccountDisabled = (event: CustomEvent) => {
            setAccountDisabledMessage(event.detail.message);
        };

        window.addEventListener(
            "accountDisabled",
            handleAccountDisabled as EventListener
        );

        return () => {
            window.removeEventListener(
                "accountDisabled",
                handleAccountDisabled as EventListener
            );
        };
    }, []);

    // Setup global error interceptor on app start
    useEffect(() => {
        setupGlobalErrorInterceptor();

        // Sync tokens để đảm bảo admin và user components đều có token
        syncTokens();
    }, []);

    const handleNavigation = (page: string) => {
        const validPages: Page[] = [
            "home",
            "login",
            "register",
            "auth",
            "placement-test",
            "dashboard",
            "courses",
            "profile",
            "practice",
        ];
        if (validPages.includes(page as Page)) {
            // Nếu navigate đến 'auth', chuyển đến 'register' (trang đăng ký)
            if (page === "auth") {
                setCurrentPage("register");
            } else {
                setCurrentPage(page as Page);
            }
        }
    };

    const handleAuthClick = () => {
        setCurrentPage("login");
    };

    const handleAuthSuccess = () => {
        setCurrentPage("home");
    };

    const handleAdminLogout = () => {
        setCurrentPage("home");
    };

    // Handle payment success page
    if (isPaymentSuccessPage) {
        return <PaymentSuccessHandler />;
    }

    // If user is admin and authenticated, show admin dashboard
    if (isAuthenticated && user?.role === "admin") {
        return <AdminDashboard onLogout={handleAdminLogout} />;
    }

    // If user is authenticated (regular user), show user dashboard
    if (isAuthenticated && user?.role === "user") {
        if (currentPage === "placement-test") {
            return <PlacementTest />;
        }
        if (currentPage === "dashboard") {
            return (
                <UserProfile
                    onBack={() => setCurrentPage("home")}
                    onNavigate={handleNavigation}
                />
            );
        }
    }

    if (currentPage === "login") {
        return (
            <Login
                onLoginSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setCurrentPage("register")}
                onBackToHome={() => setCurrentPage("home")}
            />
        );
    }

    if (currentPage === "register") {
        return (
            <Register
                onRegisterSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setCurrentPage("login")}
                onBackToHome={() => setCurrentPage("home")}
            />
        );
    }

    if (currentPage === "placement-test") {
        return <PlacementTest />;
    }

    // Dashboard route - always redirect to profile for authenticated users
    if (currentPage === "dashboard") {
        if (isAuthenticated) {
            return (
                <UserProfile
                    onBack={() => setCurrentPage("home")}
                    onNavigate={handleNavigation}
                />
            );
        } else {
            // Redirect non-authenticated users to login
            setCurrentPage("login");
            return null;
        }
    }
    if (currentPage === "courses") {
        return (
            <CourseApp
                onBack={() => setCurrentPage("home")}
                onAuthRequired={() => setCurrentPage("login")}
            />
        );
    }

    if (currentPage === "practice") {
        return <IELTSExamList onBack={() => setCurrentPage("home")} />;
    }

    if (currentPage === "profile") {
        return (
            <UserProfile
                onBack={() => setCurrentPage("home")}
                onNavigate={handleNavigation}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header
                onAuthClick={handleAuthClick}
                onNavigate={handleNavigation}
                currentPage={currentPage}
            />
            <Hero onNavigate={handleNavigation} />
            <Features onNavigate={handleNavigation} />
            <Practice onNavigate={handleNavigation} />
            <Progress />
            <Footer />
            <Chatbot />

            {/* Account Disabled Notification */}
            {accountDisabledMessage && (
                <AccountDisabledNotification
                    message={accountDisabledMessage}
                    onClose={clearAccountDisabledMessage}
                />
            )}

            {/* Auth Debugger - only in development */}
            {import.meta.env.DEV && <AuthDebugger />}
        </div>
    );
}

export default App;
