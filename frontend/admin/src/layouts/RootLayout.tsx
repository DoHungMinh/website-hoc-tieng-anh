import { useEffect, useState, Suspense, memo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AccountDisabledNotification from "../components/common/AccountDisabledNotification";
import { AuthDebugger } from "../components/auth/AuthDebugger";
import PageLoader from "../components/common/PageLoader";
import { useAuthStore } from "../stores/authStore";
import { syncTokens } from "../utils/tokenSync";
import { useActivityHeartbeat } from "../hooks/useActivityHeartbeat";
import { setupGlobalErrorInterceptor } from "../utils/errorInterceptor";
import { useLenis } from "../hooks/useLenis";
import { useScrollToTop } from "../hooks/useScrollToTop";

/** Pages that should hide header */
const HIDE_HEADER_ROUTES = ["/login", "/register", "/admin", "/placement-test"];

/** Pages that should hide footer */
const HIDE_FOOTER_ROUTES = ["/login", "/register", "/admin", "/placement-test"];

/**
 * Root Layout Component
 * Wraps all pages with common layout elements (Header, Footer)
 * Handles global initialization and auth redirects
 */
const RootLayout = memo(() => {
    const location = useLocation();
    const navigate = useNavigate();
    // Atomic selectors - chỉ re-render khi giá trị cụ thể thay đổi
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Account disabled state
    const [accountDisabledMessage, setAccountDisabledMessage] = useState<
        string | null
    >(null);
    const clearAccountDisabledMessage = () => setAccountDisabledMessage(null);

    // Initialize activity heartbeat
    useActivityHeartbeat();

    // Initialize smooth scrolling
    useLenis();

    // Scroll to top on route change
    useScrollToTop();

    // Listen for account disabled events
    useEffect(() => {
        const handleAccountDisabled = (event: CustomEvent) => {
            setAccountDisabledMessage(event.detail.message);
        };

        window.addEventListener(
            "accountDisabled",
            handleAccountDisabled as EventListener
        );

        return () => {
            window.removeEventListener(
                "accountDisabled",
                handleAccountDisabled as EventListener
            );
        };
    }, []);

    // Setup global error interceptor and sync tokens on mount
    useEffect(() => {
        setupGlobalErrorInterceptor();
        syncTokens();
    }, []);

    // Determine if header/footer should be hidden
    const hideHeader = HIDE_HEADER_ROUTES.some((route) =>
        location.pathname.startsWith(route)
    );
    const hideFooter = HIDE_FOOTER_ROUTES.some((route) =>
        location.pathname.startsWith(route)
    );

    return (
        <Layout
            hideHeader={hideHeader}
            hideFooter={hideFooter}
            currentPage={location.pathname.slice(1) || "home"}
        >
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>

            {/* Account Disabled Notification */}
            {accountDisabledMessage && (
                <AccountDisabledNotification
                    message={accountDisabledMessage}
                    onClose={clearAccountDisabledMessage}
                />
            )}

            {/* Auth Debugger - only in development */}
            {import.meta.env.DEV && <AuthDebugger />}
        </Layout>
    );
});

RootLayout.displayName = "RootLayout";

export default RootLayout;
