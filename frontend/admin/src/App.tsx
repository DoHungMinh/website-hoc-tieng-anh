import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy load pages for code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

/**
 * Application Router Configuration
 * Defines all routes and their corresponding page components
 *
 * Route Types:
 * - Public: Accessible by anyone (home, login, register, courses, practice)
 * - Protected: Requires authentication (profile, dashboard, placement-test)
 * - Admin: Requires admin role (admin)
 */
const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/admin" replace />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "admin",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "*",
                element: <Navigate to="/admin" replace />,
            },
        ],
    },
]);

/**
 * Main Application Component
 * Uses React Router for client-side routing
 */
function App() {
    return <RouterProvider router={router} />;
}

export default App;
