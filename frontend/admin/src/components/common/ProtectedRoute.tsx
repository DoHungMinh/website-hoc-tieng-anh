import { memo, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
    children: ReactNode;
    /** Redirect path for unauthenticated users */
    redirectTo?: string;
    /** Required role to access this route */
    requiredRole?: "user" | "admin";
}

/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 * Optionally checks for specific user roles
 */
const ProtectedRoute = memo<ProtectedRouteProps>(
    ({ children, redirectTo = "/login", requiredRole }) => {
        const location = useLocation();
        const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
        const user = useAuthStore((state) => state.user);

        // Check authentication
        if (!isAuthenticated) {
            // Save the attempted URL for redirecting after login
            return <Navigate to={redirectTo} state={{ from: location }} replace />;
        }

        // Check role if required
        if (requiredRole && user?.role !== requiredRole) {
            // Redirect to home if user doesn't have required role
            return <Navigate to="/" replace />;
        }

        return <>{children}</>;
    }
);

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
