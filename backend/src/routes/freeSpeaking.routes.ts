import express from 'express';
import multer from 'multer';
import path from 'path';
import { freeSpeakingController } from '../controllers/freeSpeakingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Multer config cho audio upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../temp/audio');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `free-speaking-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files allowed.`));
    }
  },
});

/**
 * POST /api/free-speaking/score
 * Score user's free speaking recording
 * 
 * Body (multipart/form-data):
 * - audio: Audio file (webm/mp3/wav)
 * - topicId: string ('food' | 'family' | 'animals')
 * - topicTitle: string
 * - questions: JSON string array
 */
router.post(
  '/score',
  authenticateToken,
  upload.single('audio'),
  freeSpeakingController.scoreRecording
);

/**
 * GET /api/free-speaking/latest/:topicId
 * Get latest session for specific topic
 */
router.get(
  '/latest/:topicId',
  authenticateToken,
  freeSpeakingController.getLatestSession
);

/**
 * GET /api/free-speaking/history?limit=20
 * Get user's free speaking history
 */
router.get(
  '/history',
  authenticateToken,
  freeSpeakingController.getHistory
);

export default router;
