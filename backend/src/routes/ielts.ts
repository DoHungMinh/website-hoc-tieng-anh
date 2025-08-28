import { Router } from 'express';
import { 
  getIELTSExams,
  getIELTSExamById,
  createIELTSExam,
  updateIELTSExam,
  deleteIELTSExam,
  toggleExamStatus,
  uploadAudio,
  getExamStats,
  submitTestResult,
  getUserTestHistory,
  getTestResultDetail,
  upload
} from '../controllers/ieltsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (for students to access published exams)
router.get('/', getIELTSExams);
router.get('/:id', getIELTSExamById);

// Admin routes (require authentication and admin role)
router.post('/', authenticateToken, requireAdmin, createIELTSExam);
router.put('/:id', authenticateToken, requireAdmin, updateIELTSExam);
router.patch('/:id/status', authenticateToken, requireAdmin, toggleExamStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteIELTSExam);

// Audio upload route
router.post('/upload-audio', authenticateToken, requireAdmin, upload.single('audio'), uploadAudio);

// Statistics route
router.get('/admin/stats', authenticateToken, requireAdmin, getExamStats);

// Test result routes (for students)
router.post('/:examId/submit', authenticateToken, submitTestResult);
router.get('/results/history', authenticateToken, getUserTestHistory);
router.get('/results/:resultId', authenticateToken, getTestResultDetail);

export default router;
