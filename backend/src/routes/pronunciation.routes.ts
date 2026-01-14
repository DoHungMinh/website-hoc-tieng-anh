import express from 'express';
import multer from 'multer';
import path from 'path';
import { pronunciationController } from '../controllers/pronunciationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer for audio file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp/audio'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
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
      'audio/mp4',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

/**
 * @route   POST /api/pronunciation/score
 * @desc    Score user's pronunciation recording
 * @access  Private
 */
router.post('/score', authenticateToken, upload.single('audio'), pronunciationController.scoreRecording);

/**
 * @route   GET /api/pronunciation/prompt-audio/:promptIndex
 * @desc    Get or generate audio for a specific prompt
 * @access  Public
 */
router.get('/prompt-audio/:promptIndex', pronunciationController.getPromptAudio);

/**
 * @route   GET /api/pronunciation/word-audio/:word
 * @desc    Get or generate audio for a specific word
 * @access  Public
 */
router.get('/word-audio/:word', pronunciationController.getWordAudio);

/**
 * @route   GET /api/pronunciation/history
 * @desc    Get user's practice history
 * @access  Private
 */
router.get('/history', authenticateToken, pronunciationController.getHistory);

/**
 * @route   GET /api/pronunciation/latest-session/:promptIndex
 * @desc    Get latest practice session for specific prompt
 * @access  Private
 */
router.get('/latest-session/:promptIndex', authenticateToken, pronunciationController.getLatestSession);

/**
 * @route   GET /api/pronunciation/session/:sessionId
 * @desc    Get session detail by ID
 * @access  Private
 */
router.get('/session/:sessionId', authenticateToken, pronunciationController.getSessionDetail);

/**
 * @route   GET /api/pronunciation/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, pronunciationController.getStats);

/**
 * @route   GET /api/pronunciation/cached-prompts
 * @desc    Get all cached prompt audio
 * @access  Public
 */
router.get('/cached-prompts', pronunciationController.getCachedPrompts);

/**
 * @route   GET /api/pronunciation/popular-words
 * @desc    Get most used words
 * @access  Public
 */
router.get('/popular-words', pronunciationController.getPopularWords);

export default router;
