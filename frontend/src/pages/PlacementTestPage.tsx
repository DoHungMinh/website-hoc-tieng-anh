import { lazy, Suspense, memo } from "react";
import PageLoader from "../components/common/PageLoader";

const PlacementTestComponent = lazy(() => import("../components/assessment/PlacementTest"));

/**
 * Placement Test Page
 */
const PlacementTestPage = memo(() => {
    return (
        <Suspense fallback={<PageLoader />}>
            <PlacementTestComponent />
        </Suspense>
    );
});

PlacementTestPage.displayName = "PlacementTestPage";

export default PlacementTestPage;
