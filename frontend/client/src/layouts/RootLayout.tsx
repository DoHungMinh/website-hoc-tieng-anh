import { useEffect, useState, Suspense, memo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AccountDisabledNotification from "../components/common/AccountDisabledNotification";
import PageLoader from "../components/common/PageLoader";
import Chatbot from "../components/chatbot/Chatbot";
import { syncTokens } from "../utils/tokenSync";
import { useActivityHeartbeat } from "../hooks/useActivityHeartbeat";
import { setupGlobalErrorInterceptor } from "../utils/errorInterceptor";
import { useLenis } from "../hooks/useLenis";
import { useScrollToTop } from "../hooks/useScrollToTop";

/** Routes configuration for hiding header/footer */
const HIDE_LAYOUT_ROUTES = ["/login", "/register", "/admin", "/placement-test"];

/**
 * Root Layout Component
 * Wraps all pages with common layout elements (Header, Footer)
 * Handles global initialization
 */
const RootLayout = memo(() => {
    const { pathname } = useLocation();
    const [accountDisabledMessage, setAccountDisabledMessage] = useState<string | null>(null);

    // Initialize hooks
    useActivityHeartbeat();
    useLenis();
    useScrollToTop();

    // Setup global error interceptor and sync tokens on mount
    useEffect(() => {
        setupGlobalErrorInterceptor();
        syncTokens();
    }, []);

    // Listen for account disabled events
    useEffect(() => {
        const handleAccountDisabled = (event: CustomEvent) => {
            setAccountDisabledMessage(event.detail.message);
        };

        window.addEventListener("accountDisabled", handleAccountDisabled as EventListener);
        return () => window.removeEventListener("accountDisabled", handleAccountDisabled as EventListener);
    }, []);

    // Determine if header/footer should be hidden
    const hideLayout = HIDE_LAYOUT_ROUTES.some((route) => pathname.startsWith(route));

    return (
        <Layout
            hideHeader={hideLayout}
            hideFooter={hideLayout}
            currentPage={pathname.slice(1) || "home"}
        >
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>

            {accountDisabledMessage && (
                <AccountDisabledNotification
                    message={accountDisabledMessage}
                    onClose={() => setAccountDisabledMessage(null)}
                />
            )}

            <Chatbot />
        </Layout>
    );
});

RootLayout.displayName = "RootLayout";

export default RootLayout;
