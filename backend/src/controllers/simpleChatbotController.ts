import { Request, Response } from 'express';
import { ChatbotHelpers } from '../utils/chatbotHelpers';

export const simpleChatbotController = {
  
  // Simple chat endpoint for testing
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const userId = req.user?._id?.toString() || 'guest';

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Simple bot responses for testing
      const responses = [
        `Chào bạn! Tôi hiểu bạn đang hỏi về: "${message}". Đây là AI Assistant của EnglishPro, tôi có thể giúp bạn phân tích tiến độ học tập và đưa ra gợi ý cải thiện.`,
        `Câu hỏi thú vị! Về "${message}" - tôi khuyên bạn nên tập trung vào việc luyện tập thường xuyên. Bạn có muốn tôi phân tích tiến độ học tập hiện tại không?`,
        `Tuyệt vời! Tôi thấy bạn quan tâm đến "${message}". Dựa trên dữ liệu học tập, tôi có thể đưa ra lời khuyên cụ thể để cải thiện kỹ năng này.`,
        `Đó là một chủ đề hay về "${message}"! Để học hiệu quả hơn, tôi gợi ý bạn nên có kế hoạch học tập rõ ràng. Bạn muốn tôi tạo lộ trình học phù hợp không?`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      return res.json({
        success: true,
        response: randomResponse,
        messageCount: 1,
        type: 'test_response'
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({ 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Simple progress analysis for testing
  async generateProgressAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString() || 'guest';

      const mockAnalysis = `
📊 **PHÂN TÍCH TIẾN ĐỘ HỌC TẬP**

Bạn cần phải đăng nhập và làm bài test đầu vào để tôi có thể phân tích được chính xác tiến độ học tập của bạn 
      `;

      return res.json({
        success: true,
        analysis: mockAnalysis,
        type: 'progress_analysis'
      });

    } catch (error) {
      console.error('Error in generateProgressAnalysis:', error);
      return res.status(500).json({ 
        error: 'Failed to generate progress analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Simple recommendations for testing
  async generateLearningRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString() || 'guest';

      const mockRecommendations = `
🎯 **LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA**

Bạn cần phải đăng nhập và làm bài test đầu vào để tôi có thể đưa ra lộ trình học tập của bạn
      `;

      return res.json({
        success: true,
        recommendations: mockRecommendations,
        type: 'learning_recommendations'
      });

    } catch (error) {
      console.error('Error in generateLearningRecommendations:', error);
      return res.status(500).json({ 
        error: 'Failed to generate learning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get chat history (mock data for testing)
  async getChatHistory(req: Request, res: Response) {
    try {
      const { limit = 20, page = 1 } = req.query;
      
      // Mock chat history data
      const mockHistory = [
        {
          _id: 'session_1',
          userId: req.user?._id || 'test_user',
          messages: [
            {
              role: 'user',
              content: 'Hãy phân tích tiến độ học của tôi',
              timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            },
            {
              role: 'assistant', 
              content: '📊 Dựa trên dữ liệu học tập, bạn đã có tiến bộ tốt trong tuần qua...',
              timestamp: new Date(Date.now() - 3600000 + 30000) // 30s later
            }
          ],
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3500000)
        }
      ];

      res.json({
        success: true,
        message: 'Lấy lịch sử chat thành công',
        history: mockHistory,
        pagination: {
          total: mockHistory.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: 1
        }
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử chat'
      });
    }
  },

  // Get specific chat session
  async getChatSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      // Mock session data
      const mockSession = {
        _id: sessionId,
        userId: req.user?._id || 'test_user',
        messages: [
          {
            role: 'user',
            content: 'Xin chào AI Assistant!',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: 'Chào bạn! Tôi là AI Assistant chuyên về học tiếng Anh. Tôi có thể giúp bạn phân tích tiến độ học tập và đưa ra lời khuyên cá nhân hóa.',
            timestamp: new Date()
          }
        ],
        userContext: {
          currentLevel: 'B1',
          learningGoals: ['IELTS', 'Business English'],
          lastActivity: 'lesson'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Lấy session thành công',
        session: mockSession
      });
    } catch (error) {
      console.error('Error getting chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy chat session'
      });
    }
  },

  // Clear chat history
  async clearChatHistory(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Đã xóa lịch sử chat thành công',
        data: {
          deletedCount: 5, // Mock number
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa lịch sử chat'
      });
    }
  }
};
