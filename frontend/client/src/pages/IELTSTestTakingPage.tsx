import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

// Lazy load component
const IELTSTest = lazy(() => import("@/components/ielts/IELTSTest"));

/**
 * IELTS Test Taking Page - Rendering the actual test interface
 */
const IELTSTestTakingPage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/practice/ielts-test"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <IELTSTest onBackToCenter={handleBack} />
        </Suspense>
    );
});

IELTSTestTakingPage.displayName = "IELTSTestTakingPage";

export default IELTSTestTakingPage;
