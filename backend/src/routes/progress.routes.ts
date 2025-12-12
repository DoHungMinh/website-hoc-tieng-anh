import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
    initializeProgress,
    getUserProgress,
    getWeeklyActivity,
    updateVocabularyProgress,
    updateListeningProgress,
    updateTestProgress,
} from "../controllers/progressController";

const router = Router();

// =================================================================
// PROGRESS ROUTES (Authentication Required)
// =================================================================

// Initialize progress for new user
router.post("/initialize", requireAuth, initializeProgress);

// Get user progress
router.get("/", requireAuth, getUserProgress);

// Get weekly activity
router.get("/weekly-activity", requireAuth, getWeeklyActivity);

// Update vocabulary progress
router.post("/vocabulary", requireAuth, updateVocabularyProgress);

// Update listening progress
router.post("/listening", requireAuth, updateListeningProgress);

// Update test progress
router.post("/test", requireAuth, updateTestProgress);

export default router;
