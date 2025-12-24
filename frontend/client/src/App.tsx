import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PlacementTestPage = lazy(() => import("./pages/PlacementTestPage"));
const ChatPage = lazy(() => import("./pages/Chat/Chat"));

const PaymentSuccessHandler = lazy(
    () => import("./components/learning/PaymentSuccessHandler")
);

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
            // ============ PUBLIC ROUTES ============
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "courses",
                element: <CoursesPage />,
            },
            {
                path: "practice",
                element: <PracticePage />,
            },
            {
                path: "aichat",
                element: <ChatPage />,
            },

            // ============ PROTECTED ROUTES (require authentication) ============
            {
                path: "dashboard",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "placement-test",
                element: (
                    <ProtectedRoute>
                        <PlacementTestPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "payment/success",
                element: (
                    <ProtectedRoute>
                        <PaymentSuccessHandler />
                    </ProtectedRoute>
                ),
            },

            // ============ REDIRECTS ============
            // Redirect auth to register for backwards compatibility
            {
                path: "auth",
                element: <Navigate to="/register" replace />,
            },
            // Catch-all redirect to home
            {
                path: "*",
                element: <Navigate to="/" replace />,
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
