import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
    enrollInCourse,
    getUserEnrollments,
} from "../controllers/enrollmentController";
import {
    getUserEnrollments as getSimpleUserEnrollments,
    enrollInCourse as simpleEnrollInCourse,
} from "../controllers/simpleEnrollmentController";

const router = Router();

// =================================================================
// ENROLLMENT ROUTES (Authentication Required)
// =================================================================

// Enroll in a course
router.post("/", authenticateToken, enrollInCourse);

// Get user enrollments
router.get("/", authenticateToken, getUserEnrollments);

// =================================================================
// SIMPLE ENROLLMENT ROUTES (Simpler implementation)
// =================================================================

// Get simple user enrollments
router.get("/simple", authenticateToken, getSimpleUserEnrollments);

// Simple enroll in course
router.post("/simple", authenticateToken, simpleEnrollInCourse);

export default router;
