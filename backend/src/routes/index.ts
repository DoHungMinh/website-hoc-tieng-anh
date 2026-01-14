import { Router } from "express";

// Import route modules
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import ieltsRoutes from "./ielts.routes";
import chatbotRoutes from "./chatbot.routes";
import aiRoutes from "./ai.routes";
import progressRoutes from "./progress.routes";
import enrollmentRoutes from "./enrollment.routes";
import paymentRoutes from "./payment.routes";
import analyticsRoutes from "./analytics.routes";
import voiceChatRoutes from "./voiceChat.routes";
import levelPackageRoutes from "./levelPackage.routes";
import levelEnrollmentRoutes from "./levelEnrollment.routes";
import pronunciationRoutes from "./pronunciation.routes";

const router = Router();

// =================================================================
// MOUNT ALL ROUTE MODULES
// =================================================================

// Authentication routes
router.use("/auth", authRoutes);

// User management routes
router.use("/user", userRoutes);

// Course management routes
router.use("/course", courseRoutes);

// IELTS exam routes
router.use("/ielts", ieltsRoutes);

// Chatbot routes
router.use("/chatbot", chatbotRoutes);

// AI generation routes
router.use("/ai", aiRoutes);

// Progress tracking routes
router.use("/progress", progressRoutes);

// Enrollment routes
router.use("/enrollment", enrollmentRoutes);

// Payment routes (PayOS)
router.use("/payments", paymentRoutes);

// Admin analytics/statistics routes
router.use("/admin/statistics", analyticsRoutes);

// Voice chat routes
router.use("/voice", voiceChatRoutes);

// Pronunciation practice routes (NEW)
router.use("/pronunciation", pronunciationRoutes);

// Level Package routes (NEW - Level-based learning)
router.use("/level-packages", levelPackageRoutes);

// Level Enrollment routes (NEW)
router.use("/level-enrollments", levelEnrollmentRoutes);

// =================================================================
// ASSESSMENT & LEARNING ROUTES (To be implemented)
// =================================================================

// Assessment routes placeholder
router.get("/assessment/test", (req, res) => {
    res.json({ message: "Assessment routes working" });
});

// Learning routes placeholder
router.get("/learning/test", (req, res) => {
    res.json({ message: "Learning routes working" });
});

// =================================================================
// ROOT TEST ROUTE
// =================================================================

router.get("/", (req, res) => {
    res.json({
        message: "VTI English Learning API",
        version: "2.0.0",
        status: "active",
        routes: {
            auth: "/api/auth",
            user: "/api/user",
            course: "/api/course",
            ielts: "/api/ielts",
            chatbot: "/api/chatbot",
            ai: "/api/ai",
            progress: "/api/progress",
            enrollment: "/api/enrollment",
            payments: "/api/payments",
            analytics: "/api/admin/statistics",
            voice: "/api/voice",
            pronunciation: "/api/pronunciation",
            levelPackage: "/api/level-package",
            levelEnrollment: "/api/level-enrollment",
        },
    });
});

export default router;
