import { lazy, Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";

// Lazy load sections for better performance
const Hero = lazy(() => import("@/components/home/Hero"));
const Partners = lazy(() => import("@/components/home/Partners/Partners"));
const Features = lazy(() => import("@/components/home/Features"));
const Course = lazy(() => import("@/components/home/Course/Course"));
const Rating = lazy(() => import("@/components/home/Rating/Rating"));
const Pricing = lazy(() => import("@/components/home/Pricing/Pricing"));
const Chatbot = lazy(() => import("@/components/chatbot/Chatbot"));

/**
 * Home Page - Landing page with Hero, Features, Practice sections
 */
const HomePage = memo(() => {
    const navigate = useNavigate();

    const handleNavigate = useCallback((page: string) => {
        const routeMap: Record<string, string> = {
            home: "/",
            login: "/login",
            register: "/register",
            courses: "/courses",
            practice: "/practice",
            dashboard: "/dashboard",
            profile: "/profile",
            "placement-test": "/placement-test",
        };
        navigate(routeMap[page] || "/");
    }, [navigate]);

    return (
        <>
            <Suspense fallback={<PageLoader />}>
                <Hero onNavigate={handleNavigate} />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
                <Partners />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
                <Features onNavigate={handleNavigate} />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
                <Course />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
                <Rating />
            </Suspense>
            <Suspense fallback={<PageLoader />}>
                <Pricing />
            </Suspense>
          
            <Suspense fallback={<PageLoader />}>
                <Chatbot />
            </Suspense>
        </>
    );
});

HomePage.displayName = "HomePage";

export default HomePage;
