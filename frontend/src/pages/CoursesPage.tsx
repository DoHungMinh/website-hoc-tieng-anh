import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const CourseAppComponent = lazy(() => import("@/components/learning/CourseApp"));

/**
 * Courses Page
 */
const CoursesPage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/"), [navigate]);
    const handleAuthRequired = useCallback(() => navigate("/login"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <CourseAppComponent
                onBack={handleBack}
                onAuthRequired={handleAuthRequired}
            />
        </Suspense>
    );
});

CoursesPage.displayName = "CoursesPage";

export default CoursesPage;
