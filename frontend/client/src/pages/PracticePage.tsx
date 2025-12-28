import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const Practice = lazy(() => import("@/components/learning/Practice"));

/**
 * Practice Page - Practice Hub
 */
const PracticePage = memo(() => {
    const navigate = useNavigate();

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
            <Practice onNavigate={handleNavigate} />
        </Suspense>
    );
});

PracticePage.displayName = "PracticePage";

export default PracticePage;
