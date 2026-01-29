import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
    getIELTSExams,
    getIELTSExamById,
    createIELTSExam,
    updateIELTSExam,
    toggleExamStatus,
    deleteIELTSExam,
    uploadAudio,
    getExamStats,
    submitTestResult,
    getUserTestHistory,
    getTestResultDetail,
} from "../controllers/ieltsController";

const router = Router();

// =================================================================
// MULTER CONFIGURATION FOR AUDIO UPLOAD
// =================================================================

// Configure memory storage for audio files
// Using memoryStorage because controller uses req.file.buffer to upload to Cloudinary
// File is temporarily stored in RAM and automatically released after upload
const audioStorage = multer.memoryStorage();

const audioUpload = multer({
    storage: audioStorage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ chấp nhận file audio (MP3, WAV, WEBM)"));
        }
    },
});

// =================================================================
// PUBLIC ROUTES (for students to access published exams)
// =================================================================

// IMPORTANT: Specific routes MUST come before dynamic routes (/:id)

// Get all published IELTS exams
router.get("/", getIELTSExams);

// =================================================================
// ADMIN ROUTES (require authentication and admin role)
// =================================================================

// Get exam statistics - MUST be before /:id
router.get("/admin/stats", authenticateToken, requireAdmin, getExamStats);

// =================================================================
// STUDENT ROUTES (test results) - MUST be before /:id
// =================================================================

// Get user's test history
router.get("/results/history", authenticateToken, getUserTestHistory);

// Get specific test result detail
router.get("/results/:resultId", authenticateToken, getTestResultDetail);

// =================================================================
// PUBLIC ROUTES (continued)
// =================================================================

// Get specific IELTS exam by ID - MUST be after specific routes
router.get("/:id", getIELTSExamById);

// =================================================================
// ADMIN ROUTES (continued)
// =================================================================

// Create new IELTS exam
router.post("/", authenticateToken, requireAdmin, createIELTSExam);

// Update IELTS exam
router.put("/:id", authenticateToken, requireAdmin, updateIELTSExam);

// Toggle exam status (publish/unpublish)
router.patch(
    "/:id/status",
    authenticateToken,
    requireAdmin,
    toggleExamStatus
);

// Delete IELTS exam
router.delete("/:id", authenticateToken, requireAdmin, deleteIELTSExam);

// Upload audio for IELTS exam
router.post(
    "/upload-audio",
    authenticateToken,
    requireAdmin,
    audioUpload.single("audio"),
    uploadAudio
);

// =================================================================
// STUDENT ROUTES (continued)
// =================================================================

// Submit test result
router.post("/:examId/submit", authenticateToken, submitTestResult);

export default router;
