import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

// Lazy load component
const IELTSExamList = lazy(() => import("@/components/ielts/IELTSExamList"));

/**
 * IELTS Practice Page - Rendering the IELTS Exam List
 */
const IELTSTestPage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/practice"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <IELTSExamList onBack={handleBack} />
        </Suspense>
    );
});

IELTSTestPage.displayName = "IELTSTestPage";

export default IELTSTestPage;
