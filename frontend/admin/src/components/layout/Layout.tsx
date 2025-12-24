import React, { memo, ReactNode, Suspense } from "react";
import styles from "./Layout.module.css";

// Lazy load Header and Footer for better initial load performance
const Header = React.lazy(() => import("./Header"));
const Footer = React.lazy(() => import("./Footer"));

interface LayoutProps {
    children: ReactNode;
    /** Hide header - useful for full-screen pages like auth */
    hideHeader?: boolean;
    /** Hide footer - useful for pages with fixed bottom elements */
    hideFooter?: boolean;
    /** Current page for header navigation state */
    currentPage?: string;
    /** Additional className for the main content wrapper */
    className?: string;
}

/** Skeleton loader for Header */
const HeaderSkeleton = memo(() => (
    <div className={styles.headerSkeleton}>
        <div className={styles.skeletonLogo} />
        <div className={styles.skeletonNav}>
            <div className={styles.skeletonNavItem} />
            <div className={styles.skeletonNavItem} />
            <div className={styles.skeletonNavItem} />
        </div>
        <div className={styles.skeletonButton} />
    </div>
));

HeaderSkeleton.displayName = "HeaderSkeleton";

/** Skeleton loader for Footer */
const FooterSkeleton = memo(() => (
    <div className={styles.footerSkeleton}>
        <div className={styles.skeletonFooterContent} />
    </div>
));

FooterSkeleton.displayName = "FooterSkeleton";

/**
 * Layout wrapper component that provides consistent structure across all pages.
 *
 * Features:
 * - Lazy loaded Header/Footer with Suspense fallback skeletons
 * - Flexible configuration via props (hide header/footer)
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - CSS Modules for scoped styling
 * - Works with React Router - Header uses useNavigate internally
 *
 * @example
 * // Basic usage with React Router (Header handles navigation internally)
 * <Layout>
 *   <HomePage />
 * </Layout>
 *
 * @example
 * // Full-screen page without header
 * <Layout hideHeader>
 *   <FullScreenContent />
 * </Layout>
 */
const Layout = memo<LayoutProps>(
    ({
        children,
        hideHeader = false,
        hideFooter = false,
        currentPage,
        className,
    }) => {
        return (
            <div className={styles.layout}>
                {!hideHeader && (
                    <Suspense fallback={<HeaderSkeleton />}>
                        <Header currentPage={currentPage} />
                    </Suspense>
                )}

                <main
                    className={`${styles.mainContent}${className ? ` ${className}` : ""}`}
                >
                    {children}
                </main>

                {!hideFooter && (
                    <Suspense fallback={<FooterSkeleton />}>
                        <Footer />
                    </Suspense>
                )}
            </div>
        );
    }
);

Layout.displayName = "Layout";

export default Layout;
