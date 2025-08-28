import express from 'express';
import { requireAuth } from '../middleware/auth';
import {
  initializeProgress,
  getUserProgress,
  updateVocabularyProgress,
  updateListeningProgress,
  updateTestProgress
} from '../controllers/progressController';

const router = express.Router();

// All progress routes require authentication
router.use(requireAuth);

// Initialize progress for new user
router.post('/initialize', initializeProgress);

// Get user progress
router.get('/', getUserProgress);

// Update vocabulary progress
router.post('/vocabulary', updateVocabularyProgress);

// Update listening progress
router.post('/listening', updateListeningProgress);

// Update test progress
router.post('/test', updateTestProgress);

export default router;
