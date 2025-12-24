import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const UserProfileComponent = lazy(() => import("@/components/dashboard/UserProfile"));

/**
 * Profile / Dashboard Page
 */
const ProfilePage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/"), [navigate]);

    const handleNavigate = useCallback((page: string) => {
        const routeMap: Record<string, string> = {
            home: "/",
            login: "/login",
            register: "/register",
            courses: "/courses",
            practice: "/practice",
            dashboard: "/dashboard",
            profile: "/profile",
            "placement-test": "/placement-test",
        };
        navigate(routeMap[page] || "/");
    }, [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <UserProfileComponent
                onBack={handleBack}
                onNavigate={handleNavigate}
            />
        </Suspense>
    );
});

ProfilePage.displayName = "ProfilePage";

export default ProfilePage;
