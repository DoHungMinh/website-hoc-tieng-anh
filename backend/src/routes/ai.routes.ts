import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
    generateCourse,
    getTopicSuggestions,
} from "../controllers/aiCourseController";
import {
    generateIELTSReading,
    getIELTSTopicSuggestions,
    validateIELTSContent,
} from "../controllers/aiIELTSController";

const router = Router();

// =================================================================
// AI COURSE GENERATION ROUTES (Admin only)
// =================================================================

// Generate course using AI
router.post("/generate-course", authenticateToken, requireAdmin, generateCourse);

// Get topic suggestions for course generation
router.get(
    "/topic-suggestions",
    authenticateToken,
    requireAdmin,
    getTopicSuggestions
);

// =================================================================
// AI IELTS GENERATION ROUTES (Admin only)
// =================================================================

// Generate IELTS Reading test using AI
router.post(
    "/generate-ielts-reading",
    authenticateToken,
    requireAdmin,
    generateIELTSReading
);

// Get topic suggestions for IELTS Reading
router.get(
    "/ielts-topic-suggestions",
    authenticateToken,
    requireAdmin,
    getIELTSTopicSuggestions
);

// Validate IELTS content
router.post(
    "/validate-ielts",
    authenticateToken,
    requireAdmin,
    validateIELTSContent
);

export default router;
