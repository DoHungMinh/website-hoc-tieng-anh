import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const LoginComponent = lazy(() => import("@/components/auth/Login"));

/**
 * Login Page
 */
const LoginPage = memo(() => {
    const navigate = useNavigate();

    const handleLoginSuccess = useCallback(() => navigate("/"), [navigate]);
    const handleSwitchToRegister = useCallback(() => navigate("/register"), [navigate]);
    const handleBackToHome = useCallback(() => navigate("/"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <LoginComponent
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={handleSwitchToRegister}
                onBackToHome={handleBackToHome}
            />
        </Suspense>
    );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
