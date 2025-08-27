import { Request, Response } from 'express';
import ChatSession from '../models/ChatSession';
import { AIService } from '../services/aiService';
import { AnalyticsService } from '../services/analyticsService';

const aiService = new AIService();
const analyticsService = new AnalyticsService();

export const chatbotController = {
  
  // Send message to AI chatbot
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, type = 'general' } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get or create chat session
      let chatSession = await ChatSession.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!chatSession) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          context: {}
        });
      }

      // Add user message to session
      chatSession.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { type }
      });

      // Get user learning data for context
      const learningData = await analyticsService.getUserLearningData(userId);

      // Generate AI response based on message type
      let aiResponse: string;
      
      switch (type) {
        case 'progress_analysis':
          aiResponse = await aiService.analyzeUserProgress(learningData);
          break;
        case 'learning_recommendations':
          const recommendationData = await analyticsService.getRecommendationData(userId);
          aiResponse = await aiService.generateLearningRecommendations(recommendationData);
          break;
        default:
          aiResponse = await aiService.generateChatResponse(message, learningData, chatSession.messages);
      }

      // Add AI response to session
      chatSession.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: { type: 'response' }
      });

      // Update context
      chatSession.context = {
        lastInteraction: new Date(),
        messageCount: chatSession.messages.length,
        currentLevel: learningData.user.level,
        recentTopics: this.extractTopics(chatSession.messages.slice(-10))
      };

      await chatSession.save();

      return res.json({
        success: true,
        response: aiResponse,
        sessionId: chatSession._id,
        messageCount: chatSession.messages.length
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({ 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get user's chat history
  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const { limit = 50, page = 1 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const chatSessions = await ChatSession.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      // Format for frontend
      const history = chatSessions.map((session: any) => ({
        sessionId: session._id,
        createdAt: session.createdAt,
        messageCount: session.messages.length,
        lastMessage: session.messages[session.messages.length - 1]?.content?.substring(0, 100) + '...',
        context: session.context
      }));

      return res.json({
        success: true,
        history,
        totalSessions: await ChatSession.countDocuments({ userId })
      });

    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get detailed chat session
  async getChatSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const chatSession = await ChatSession.findOne({ 
        _id: sessionId, 
        userId 
      });

      if (!chatSession) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      return res.json({
        success: true,
        session: {
          id: chatSession._id,
          messages: chatSession.messages,
          context: chatSession.context,
          createdAt: chatSession.createdAt,
          updatedAt: chatSession.updatedAt
        }
      });

    } catch (error) {
      console.error('Error in getChatSession:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch chat session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Generate progress analysis
  async generateProgressAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get comprehensive learning data
      const learningData = await analyticsService.getUserLearningData(userId);
      
      // Generate AI analysis
      const analysis = await aiService.analyzeUserProgress(learningData);

      // Save analysis to chat session
      let chatSession = await ChatSession.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!chatSession) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          context: {}
        });
      }

      chatSession.messages.push({
        role: 'assistant',
        content: analysis,
        timestamp: new Date(),
        metadata: { type: 'progress_analysis', auto: true }
      });

      await chatSession.save();

      return res.json({
        success: true,
        analysis,
        stats: learningData.stats,
        progress: learningData.progress,
        sessionId: chatSession._id
      });

    } catch (error) {
      console.error('Error in generateProgressAnalysis:', error);
      return res.status(500).json({ 
        error: 'Failed to generate progress analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Generate post-assessment feedback
  async generateAssessmentFeedback(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!assessmentId) {
        return res.status(400).json({ error: 'Assessment ID is required' });
      }

      // Get post-assessment data
      const assessmentData = await analyticsService.getPostAssessmentData(userId, assessmentId);
      
      // Generate AI feedback
      const feedback = await aiService.generateAssessmentFeedback(assessmentData);

      // Save feedback to chat session
      let chatSession = await ChatSession.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!chatSession) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          context: {}
        });
      }

      chatSession.messages.push({
        role: 'assistant',
        content: feedback,
        timestamp: new Date(),
        metadata: { 
          type: 'assessment_feedback', 
          assessmentId,
          auto: true 
        }
      });

      await chatSession.save();

      return res.json({
        success: true,
        feedback,
        assessment: assessmentData.assessment,
        comparison: assessmentData.comparison,
        sessionId: chatSession._id
      });

    } catch (error) {
      console.error('Error in generateAssessmentFeedback:', error);
      return res.status(500).json({ 
        error: 'Failed to generate assessment feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Generate learning recommendations
  async generateLearningRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get recommendation data
      const recommendationData = await analyticsService.getRecommendationData(userId);
      
      // Generate AI recommendations
      const recommendations = await aiService.generateLearningRecommendations(recommendationData);

      // Save recommendations to chat session
      let chatSession = await ChatSession.findOne({ userId }).sort({ createdAt: -1 });
      
      if (!chatSession) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          context: {}
        });
      }

      chatSession.messages.push({
        role: 'assistant',
        content: recommendations,
        timestamp: new Date(),
        metadata: { type: 'learning_recommendations', auto: true }
      });

      await chatSession.save();

      return res.json({
        success: true,
        recommendations,
        learningPath: recommendationData.learningPath,
        nextActivities: recommendationData.nextActivities,
        sessionId: chatSession._id
      });

    } catch (error) {
      console.error('Error in generateLearningRecommendations:', error);
      return res.status(500).json({ 
        error: 'Failed to generate learning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Clear chat history
  async clearChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await ChatSession.deleteMany({ userId });

      return res.json({
        success: true,
        message: 'Chat history cleared successfully'
      });

    } catch (error) {
      console.error('Error in clearChatHistory:', error);
      return res.status(500).json({ 
        error: 'Failed to clear chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Helper method to extract topics from messages
  extractTopics(messages: any[]): string[] {
    const topics: string[] = [];
    const keywords = [
      'vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking',
      'IELTS', 'test', 'exam', 'practice', 'lesson', 'study', 'progress',
      'level', 'skill', 'improvement', 'recommendation', 'feedback'
    ];

    messages.forEach(message => {
      if (message.content) {
        keywords.forEach(keyword => {
          if (message.content.toLowerCase().includes(keyword.toLowerCase())) {
            if (!topics.includes(keyword)) {
              topics.push(keyword);
            }
          }
        });
      }
    });

    return topics.slice(0, 5); // Return top 5 topics
  }
};
