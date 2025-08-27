import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { simpleChatbotController } from '../controllers/simpleChatbotController';
import { realDataChatbotController } from '../controllers/realDataChatbotController';

const router = express.Router();

// ===== PUBLIC ENDPOINTS (Simple Mock Data - No Authentication) =====
router.post('/simple/message', simpleChatbotController.sendMessage);
router.post('/simple/analysis', simpleChatbotController.generateProgressAnalysis);
router.post('/simple/recommendations', simpleChatbotController.generateLearningRecommendations);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Chatbot API is working!',
    endpoints: {
      simple: 'No auth required - Mock data',
      realData: 'Auth required - Real MongoDB data'
    },
    user: 'guest',
    timestamp: new Date().toISOString()
  });
});

// ===== PROTECTED ENDPOINTS (Real Data - Authentication Required) =====
router.use(authenticateToken);

// Real data endpoints - require login and real user data
router.post('/message', realDataChatbotController.sendMessage);
router.post('/analysis', realDataChatbotController.generateProgressAnalysis);
router.post('/recommendations', realDataChatbotController.generateLearningRecommendations);

// User data management endpoints
router.get('/history', simpleChatbotController.getChatHistory);
router.get('/session/:sessionId', simpleChatbotController.getChatSession);
router.delete('/history', simpleChatbotController.clearChatHistory);
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Simple Chatbot API is working!',
    user: req.user?.email || 'anonymous',
    timestamp: new Date().toISOString()
  });
});

export default router;
