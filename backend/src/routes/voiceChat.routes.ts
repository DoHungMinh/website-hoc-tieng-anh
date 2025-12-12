import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middleware/auth";
import { voiceChatController } from "../controllers/voiceChatController";

const router = Router();

// =================================================================
// MULTER CONFIGURATION FOR AUDIO UPLOAD
// =================================================================

// Configure storage for audio files
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/audio/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

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
// VOICE CHAT ROUTES (Authentication Required)
// =================================================================

// Test voice service
router.get("/test", authenticateToken, voiceChatController.testVoiceService);

// Get available voices
router.get("/voices", authenticateToken, voiceChatController.getAvailableVoices);

// Main voice chat endpoint (STT → AI → TTS)
router.post(
    "/chat",
    authenticateToken,
    audioUpload.single("audio"),
    voiceChatController.processVoiceChat
);

// Transcribe only (STT only)
router.post(
    "/transcribe",
    authenticateToken,
    audioUpload.single("audio"),
    voiceChatController.transcribeOnly
);

// Text to speech only (TTS only)
router.post("/speak", authenticateToken, voiceChatController.speakText);

export default router;
