import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const RegisterComponent = lazy(() => import("@/components/auth/Register"));

/**
 * Register Page
 */
const RegisterPage = memo(() => {
    const navigate = useNavigate();

    const handleRegisterSuccess = useCallback(() => navigate("/"), [navigate]);
    const handleSwitchToLogin = useCallback(() => navigate("/login"), [navigate]);
    const handleBackToHome = useCallback(() => navigate("/"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <RegisterComponent
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={handleSwitchToLogin}
                onBackToHome={handleBackToHome}
            />
        </Suspense>
    );
});

RegisterPage.displayName = "RegisterPage";

export default RegisterPage;
