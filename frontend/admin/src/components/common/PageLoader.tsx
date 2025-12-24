import { memo } from "react";
import styles from "./PageLoader.module.css";

/**
 * Page loading spinner component
 * Used as Suspense fallback for lazy-loaded components
 */
const PageLoader = memo(() => (
    <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
    </div>
));

PageLoader.displayName = "PageLoader";

export default PageLoader;
