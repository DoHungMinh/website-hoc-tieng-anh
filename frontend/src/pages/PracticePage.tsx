import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const IELTSExamListComponent = lazy(() => import("@/components/ielts/IELTSExamList"));

/**
 * Practice Page - IELTS Exam List
 */
const PracticePage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <IELTSExamListComponent onBack={handleBack} />
        </Suspense>
    );
});

PracticePage.displayName = "PracticePage";

export default PracticePage;
