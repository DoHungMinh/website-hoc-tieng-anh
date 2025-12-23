import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

const AdminDashboardComponent = lazy(() => import("@/components/admin/AdminDashboard"));

/**
 * Admin Dashboard Page
 */
const AdminPage = memo(() => {
    const navigate = useNavigate();

    const handleLogout = useCallback(() => navigate("/"), [navigate]);

    return (
        <Suspense fallback={<PageLoader />}>
            <AdminDashboardComponent onLogout={handleLogout} />
        </Suspense>
    );
});

AdminPage.displayName = "AdminPage";

export default AdminPage;
