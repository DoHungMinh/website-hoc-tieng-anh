import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

// Lazy load component
const VideoListeningLibrary = lazy(() => import("@/components/video/VideoListeningLibrary"));

/**
 * Video Listening Page
 */
const VideoListeningPage = memo(() => {
    const navigate = useNavigate();

    const handleBack = useCallback(() => navigate("/practice"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <VideoListeningLibrary onBack={handleBack} />
        </Suspense>
    );
});

VideoListeningPage.displayName = "VideoListeningPage";

export default VideoListeningPage;
