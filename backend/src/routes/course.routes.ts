import { Router, Request, Response } from "express";
import express from "express";
import {
    authenticateToken,
    requireAdmin,
} from "../middleware/auth";
import { checkSpecificLevelAccess } from "../middleware/checkLevelAccess";
import {
    getCourses,
    getPublicCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStats,
    handlePayOSPaymentSuccess,
    generateWordAudio,
    generateAllAudio,
} from "../controllers/courseController";
import Enrollment from "../models/Enrollment";
import { getUserEnrollments } from "../controllers/enrollmentController";

const router = Router();

// =================================================================
// PUBLIC ROUTES (No authentication required)
// =================================================================

// Get all public courses (for browsing)
router.get("/public", getPublicCourses);

// Get public course by ID (for viewing course details)
router.get("/public/:id", getCourseById);

// Get courses by level WITH enrollment check (for enrolled users)
router.get("/level/:level", authenticateToken, (req: Request, res: Response) => {
    const { level } = req.params;
    
    // Check if user has access to this level
    const middleware = checkSpecificLevelAccess(level.toUpperCase());
    
    // Run the middleware check - if it passes, get the courses
    return middleware(req, res, () => {
        // Set level filter in query params
        req.query.level = level.toUpperCase();
        return getPublicCourses(req, res);
    });
});

// =================================================================
// USER ROUTES (Authentication required)
// =================================================================

// Get user enrollments
router.get("/enrollments", authenticateToken, getUserEnrollments);

// Enroll in course (simple inline implementation)
router.post(
    "/:id/enroll",
    authenticateToken,
    async (req: express.Request, res: express.Response) => {
        try {
            res.json({
                success: true,
                message: "Enrollment successful",
                data: {
                    courseId: req.params.id,
                    userId: req.user?._id,
                    enrolledAt: new Date(),
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Enrollment failed",
            });
        }
    }
);

// PayOS payment success route
router.post(
    "/payos-payment-success",
    authenticateToken,
    handlePayOSPaymentSuccess
);

// =================================================================
// ADMIN ROUTES (Admin only)
// =================================================================

// Get all courses (admin view)
router.get("/", authenticateToken, requireAdmin, getCourses);

// Get course statistics
router.get("/stats", authenticateToken, requireAdmin, getCourseStats);

// Get course by ID (admin view)
router.get("/:id", authenticateToken, requireAdmin, getCourseById);

// Create new course
router.post("/", authenticateToken, requireAdmin, createCourse);

// Update course
router.put("/:id", authenticateToken, requireAdmin, updateCourse);

// Generate audio for a specific word in vocabulary course
router.post("/:id/generate-word-audio", authenticateToken, requireAdmin, generateWordAudio);

// Generate audio for all words in vocabulary course
router.post("/:id/generate-all-audio", authenticateToken, requireAdmin, generateAllAudio);

// Delete course
router.delete("/:id", authenticateToken, requireAdmin, deleteCourse);

export default router;
