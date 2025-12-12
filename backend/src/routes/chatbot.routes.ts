import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { simpleChatbotController } from "../controllers/simpleChatbotController";
import realDataChatbotController from "../controllers/realDataChatbotController";

const router = Router();

// =================================================================
// PUBLIC ENDPOINTS (Simple Mock Data - No Authentication)
// =================================================================

// Simple chatbot message (mock data)
router.post("/simple/message", simpleChatbotController.sendMessage);

// Simple progress analysis (mock data)
router.post("/simple/analysis", simpleChatbotController.generateProgressAnalysis);

// Simple learning recommendations (mock data)
router.post("/simple/recommendations", simpleChatbotController.generateLearningRecommendations);

// Chatbot test endpoint
router.get("/test", (req, res) => {
    res.json({
        message: "Chatbot API is working!",
        endpoints: {
            simple: "No auth required - Mock data",
            realData: "Auth required - Real MongoDB data",
        },
        user: "guest",
        timestamp: new Date().toISOString(),
    });
});

// =================================================================
// PROTECTED ENDPOINTS (Real Data - Authentication Required)
// =================================================================

// Real chatbot message (uses real user data)
router.post("/message", authenticateToken, realDataChatbotController.sendMessage);

// Real progress analysis (uses real user data)
router.post("/analysis", authenticateToken, realDataChatbotController.generateProgressAnalysis);

// Real learning recommendations (uses real user data)
router.post("/recommendations", authenticateToken, realDataChatbotController.generateLearningRecommendations);

// =================================================================
// CHAT HISTORY MANAGEMENT (Authentication Required)
// =================================================================

// Get chat history
router.get("/history", authenticateToken, realDataChatbotController.getChatHistory);

// Get specific chat session
router.get("/session/:sessionId", authenticateToken, realDataChatbotController.getChatSession);

// Clear chat history
router.delete("/history", authenticateToken, realDataChatbotController.clearChatHistory);

export default router;
