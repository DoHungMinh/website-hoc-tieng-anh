import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Progress, IProgress } from '../models/Progress';
import { Assessment, IAssessment } from '../models/Assessment';
import IELTSTestResult from '../models/IELTSTestResult';
import Course, { ICourse } from '../models/Course';
import Enrollment, { IEnrollment } from '../models/Enrollment';
import ChatSession, { IChatSession, IChatMessage } from '../models/ChatSession';
import { AIService } from '../services/aiService';

export const realDataChatbotController = {
  // Chat với dữ liệu thật từ MongoDB và AI service
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Bạn cần đăng nhập để sử dụng AI Assistant với dữ liệu cá nhân' 
        });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Lấy thông tin user từ database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy thông tin người dùng' 
        });
      }

      // Lấy dữ liệu học tập để làm context
      const progress = await Progress.findOne({ userId });
      const recentAssessments = await Assessment.find({ 
        userId, 
        status: 'completed' 
      }).sort({ completedAt: -1 }).limit(5);
      const ieltsResults = await IELTSTestResult.find({ userId })
        .sort({ completedAt: -1 })
        .limit(10);

      // Tìm hoặc tạo chat session
      let chatSession = sessionId ? await ChatSession.findById(sessionId) : null;
      if (!chatSession || chatSession.userId !== userId) {
        chatSession = new ChatSession({
          userId,
          messages: [],
          context: {
            lastInteraction: new Date(),
            messageCount: 0,
            currentLevel: user.level,
            recentTopics: []
          },
          isActive: true
        });
        await chatSession.save();
      }

      // Thêm message của user vào session
      const userMessage: IChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      chatSession.messages.push(userMessage);

      let response = '';
      
      try {
        // Sử dụng AI Service để sinh response tự nhiên
        const aiService = new AIService();
        const learningData = {
          user,
          progress: progress || {} as IProgress,
          recentAssessments,
          stats: {
            ieltsCount: ieltsResults.length,
            averageScore: ieltsResults.length > 0 ? 
              ieltsResults.reduce((sum, r) => sum + r.score.percentage, 0) / ieltsResults.length : 0
          }
        };

        // Lấy lịch sử chat gần đây làm context
        const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        response = await aiService.generateChatResponse(message, learningData, conversationHistory);
        
      } catch (aiError) {
        console.error('AI Service error, falling back to rule-based response:', aiError);
        
        // Fallback: sử dụng logic rule-based hiện tại
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('trình độ') || lowerMessage.includes('level') || lowerMessage.includes('ở đâu') || lowerMessage.includes('bậc nào')) {
          response = await this.generateLevelAnalysis(user, ieltsResults);
        } else if (lowerMessage.includes('tiến độ') || lowerMessage.includes('progress') || lowerMessage.includes('học được gì')) {
          response = await this.generateProgressBasedResponse(user, ieltsResults);
        } else if (lowerMessage.includes('kết quả') || lowerMessage.includes('điểm') || lowerMessage.includes('test') || lowerMessage.includes('ielts')) {
          response = await this.generateIELTSTestBasedResponse(user, ieltsResults);
        } else if (lowerMessage.includes('học') || lowerMessage.includes('khóa học') || lowerMessage.includes('course')) {
          response = await this.generateCourseBasedResponse(user, ieltsResults);
        } else if (lowerMessage.includes('gợi ý') || lowerMessage.includes('nên học') || lowerMessage.includes('đề xuất')) {
          response = await this.generatePersonalizedRecommendations(user, ieltsResults);
        } else if (lowerMessage.includes('yếu') || lowerMessage.includes('cải thiện') || lowerMessage.includes('reading') || lowerMessage.includes('listening')) {
          response = await this.generateWeaknessAnalysis(user, ieltsResults);
        } else {
          // Response chung với dữ liệu thật
          const hasIELTSData = ieltsResults.length > 0;
          const latestResult = hasIELTSData ? ieltsResults[0] : null;
          
          response = `Chào ${user.fullName}! 👋 

${hasIELTSData && latestResult ? 
`📊 **Trình độ hiện tại**: ${user.level} (Band ${latestResult.score.bandScore || 'N/A'} - ${latestResult.score.percentage}%)` : 
`📊 **Trình độ hiện tại**: ${user.level}`}

Tôi có thể giúp bạn:
• **"trình độ của tôi ở đâu"** - Phân tích level chi tiết
• **"kết quả IELTS"** - Xem điểm số và feedback  
• **"gợi ý học tập"** - Lộ trình phù hợp

${hasIELTSData ? '✅ Đã có dữ liệu IELTS để phân tích chính xác!' : '⚠️ Làm bài test để có phân tích chi tiết hơn!'}`;
        }
      }

      // Thêm response của AI vào session
      const assistantMessage: IChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          type: 'chat_response'
        }
      };
      chatSession.messages.push(assistantMessage);

      // Cập nhật context
      chatSession.context.lastInteraction = new Date();
      chatSession.context.messageCount = chatSession.messages.length;
      
      await chatSession.save();

      return res.json({
        success: true,
        response,
        sessionId: chatSession._id,
        userData: {
          name: user.fullName,
          level: user.level,
          goals: user.learningGoals
        },
        type: 'real_data_response'
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi xử lý tin nhắn' 
      });
    }
  },

  // Phân tích tiến độ với dữ liệu thật và AI
  async generateProgressAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      console.log('🔍 REAL DATA ANALYSIS START:', { userId });

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Cần đăng nhập để xem phân tích tiến độ' 
        });
      }

      // Lấy dữ liệu từ database
      const user = await User.findById(userId);
      const progress = await Progress.findOne({ userId });
      const assessments = await Assessment.find({ 
        userId, 
        status: 'completed' 
      }).sort({ completedAt: -1 }).limit(5);

      // Lấy dữ liệu IELTS test results thật
      const ieltsResults = await IELTSTestResult.find({ userId })
        .sort({ completedAt: -1 })
        .limit(10);

      // Lấy thông tin enrollment/khóa học đã đăng ký
      const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title description level price')
        .sort({ enrolledAt: -1 });

      // Lấy danh sách khóa học có sẵn để gợi ý
      const availableCourses = await Course.find({ isActive: true })
        .select('title description level price')
        .limit(10);

      // Tạm thời bỏ IELTS exams để tránh lỗi import
      const availableIELTSExams: any[] = [];

      console.log('📊 REAL DATABASE DATA:', {
        userId,
        userFound: !!user,
        userName: user?.fullName,
        userLevel: user?.level,
        progressFound: !!progress,
        progressData: progress ? {
          vocabulary: progress.vocabulary,
          listening: progress.listening,
          testsCompleted: progress.testsCompleted
        } : null,
        assessmentsCount: assessments.length,
        ieltsResultsCount: ieltsResults.length,
        enrollmentsCount: enrollments.length,
        availableCoursesCount: availableCourses.length,
        availableIELTSExamsCount: availableIELTSExams.length
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy thông tin người dùng' 
        });
      }

      // Kiểm tra xem user có dữ liệu học tập không
      if (!progress && assessments.length === 0 && ieltsResults.length === 0 && enrollments.length === 0) {
        return res.json({
          success: true,
          analysis: `📊 **CHƯA CÓ DỮ LIỆU HỌC TẬP**

Xin chào ${user.fullName}! 👋

Tôi thấy bạn chưa có dữ liệu học tập để phân tích. Để AI Assistant có thể đưa ra phân tích chính xác, bạn cần:

🎯 **Làm ít nhất 1 bài test IELTS**
📚 **Tham gia ít nhất 1 khóa học** 
📈 **Hoàn thành một số bài học**

Sau khi có dữ liệu học tập, tôi sẽ có thể:
✅ Phân tích kết quả IELTS chi tiết với band scores
✅ Đưa ra gợi ý cải thiện dựa trên điểm yếu thực tế
✅ Theo dõi tiến độ qua thời gian
✅ Đề xuất lộ trình học từ các khóa học đã đăng ký

Hãy bắt đầu với một bài test IELTS để đánh giá trình độ nhé! 🚀`,
          hasData: false,
          type: 'no_data'
        });
      }

      let analysis = '';

      try {
        console.log('🤖 Trying AI Service for analysis...');
        // Không sử dụng AI Service để tránh progress fake data
        // Sử dụng trực tiếp fallback rule-based analysis
        console.log('🔄 Using rule-based analysis instead of AI Service...');
        analysis = await realDataChatbotController.buildComprehensiveAnalysis(user, progress, assessments, ieltsResults, enrollments, availableCourses, availableIELTSExams);
        console.log('✅ Rule-based analysis completed');

      } catch (aiError) {
        console.error('❌ Analysis error, falling back to basic response:', aiError);
        analysis = `📊 **PHÂN TÍCH HỌC TẬP - ${user.fullName}**\n\nXin lỗi, có lỗi trong quá trình phân tích. Hãy thử lại sau.`;
      }

      // Lưu vào chat session (tự động tạo session mới)
      try {
        const chatSession = new ChatSession({
          userId,
          messages: [
            {
              role: 'user',
              content: 'Phân tích tiến độ học tập của tôi',
              timestamp: new Date(),
              metadata: { type: 'progress_analysis_request' }
            },
            {
              role: 'assistant',
              content: analysis,
              timestamp: new Date(),
              metadata: { type: 'progress_analysis' }
            }
          ],
          context: {
            lastInteraction: new Date(),
            messageCount: 2,
            currentLevel: user.level,
            recentTopics: ['progress_analysis']
          },
          isActive: true
        });
        await chatSession.save();

        return res.json({
          success: true,
          analysis,
          sessionId: chatSession._id,
          hasData: true,
          type: 'real_progress_analysis'
        });

      } catch (sessionError) {
        console.error('Error saving chat session:', sessionError);
        // Vẫn trả về analysis ngay cả khi không lưu được session
        return res.json({
          success: true,
          analysis,
          hasData: true,
          type: 'real_progress_analysis'
        });
      }

    } catch (error) {
      console.error('Error in generateProgressAnalysis:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi phân tích tiến độ' 
      });
    }
  },

  // Gợi ý học tập với dữ liệu thật và AI
  async generateLearningRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Cần đăng nhập để nhận gợi ý học tập' 
        });
      }

      const user = await User.findById(userId);
      const progress = await Progress.findOne({ userId });
      const recentAssessments = await Assessment.find({ 
        userId, 
        status: 'completed' 
      }).sort({ completedAt: -1 }).limit(3);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy thông tin người dùng' 
        });
      }

      // Kiểm tra dữ liệu học tập
      if (!progress && recentAssessments.length === 0) {
        return res.json({
          success: true,
          recommendations: `🎯 **GỢI Ý HỌC TẬP CƠ BẢN**

Xin chào ${user.fullName}! 

Vì bạn chưa có dữ liệu học tập cụ thể, đây là gợi ý dành cho level ${user.level}:

📚 **Bước đầu tiên:**
1. 🎯 Làm bài test đánh giá trình độ
2. 📖 Chọn 1 khóa học phù hợp với level ${user.level}
3. 📝 Hoàn thành ít nhất 3 bài học đầu tiên

🎯 **Mục tiêu cho người mới:**
- Học 15-20 phút mỗi ngày
- Hoàn thành 1 bài test mỗi tuần
- Focus vào từ vựng cơ bản trước

Sau khi có dữ liệu học tập, tôi sẽ đưa ra lộ trình cá nhân hóa chính xác hơn! 🚀`,
          hasData: false,
          type: 'basic_recommendations'
        });
      }

      let recommendations = '';

      try {
        // Sử dụng AI Service để tạo gợi ý
        const aiService = new AIService();
        const recommendationData = {
          user,
          progress: progress || {} as IProgress,
          learningPath: user.learningGoals || [],
          nextActivities: recentAssessments.map(a => ({
            type: a.type,
            score: a.results?.percentage || 0,
            weaknesses: a.results?.weaknesses || []
          }))
        };

        recommendations = await aiService.generateLearningRecommendations(recommendationData);

      } catch (aiError) {
        console.error('AI Service error, falling back to rule-based recommendations:', aiError);
        
        // Fallback: sử dụng logic gợi ý hiện tại
        recommendations = await this.buildPersonalizedRecommendations(user, progress, recentAssessments);
      }

      // Lưu vào chat session
      try {
        const chatSession = new ChatSession({
          userId,
          messages: [
            {
              role: 'user',
              content: 'Gợi ý lộ trình học tập cho tôi',
              timestamp: new Date(),
              metadata: { type: 'recommendation_request' }
            },
            {
              role: 'assistant',
              content: recommendations,
              timestamp: new Date(),
              metadata: { type: 'learning_recommendations' }
            }
          ],
          context: {
            lastInteraction: new Date(),
            messageCount: 2,
            currentLevel: user.level,
            recentTopics: ['learning_recommendations']
          },
          isActive: true
        });
        await chatSession.save();

        return res.json({
          success: true,
          recommendations,
          sessionId: chatSession._id,
          hasData: true,
          type: 'personalized_recommendations'
        });

      } catch (sessionError) {
        console.error('Error saving recommendation session:', sessionError);
        return res.json({
          success: true,
          recommendations,
          hasData: true,
          type: 'personalized_recommendations'
        });
      }

    } catch (error) {
      console.error('Error in generateLearningRecommendations:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi tạo gợi ý học tập' 
      });
    }
  },

  // Helper method: Tạo response dựa trên tiến độ
  async generateProgressBasedResponse(user: IUser, ieltsResults: any[]): Promise<string> {
    const progress = await Progress.findOne({ userId: user._id });
    
    if (!progress && ieltsResults.length === 0) {
      return `${user.fullName}, tôi thấy bạn chưa có dữ liệu tiến độ học tập và chưa làm bài IELTS test nào. Hãy bắt đầu với một bài test IELTS để tôi có thể theo dõi và phân tích tiến độ của bạn nhé! 📊`;
    }

    let progressSection = '';
    if (progress) {
      progressSection = `📚 Từ vựng đã học: ${progress.vocabulary.learned}/${progress.vocabulary.target}
🎧 Thời gian nghe: ${progress.listening.hoursCompleted}h/${progress.listening.target}h  
📝 Bài test hoàn thành: ${progress.testsCompleted.completed}/${progress.testsCompleted.target}
🔥 Streak hiện tại: ${progress.studyStreak.current} ngày
⏱️ Tổng thời gian học: ${progress.totalStudyTime} giờ

${progress.studyStreak.current >= 7 ? '🎉 Tuyệt vời! Bạn đã duy trì học tập ổn định!' : '💪 Hãy cố gắng học đều đặn để tăng streak nhé!'}`;
    }

    let ieltsSection = '';
    if (ieltsResults.length > 0) {
      const latestResult = ieltsResults[0];
      const averageScore = ieltsResults.reduce((sum: number, result: any) => sum + result.score.percentage, 0) / ieltsResults.length;
      const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading').length;
      const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening').length;
      
      ieltsSection = `
🎯 **TIẾN ĐỘ IELTS:**
• Tổng bài test: ${ieltsResults.length} (Reading: ${readingTests}, Listening: ${listeningTests})
• Điểm trung bình: ${Math.round(averageScore)}%
• Kết quả mới nhất: ${latestResult.score.percentage}% (${latestResult.examTitle})
• Band Score mới nhất: ${latestResult.score.bandScore || 'N/A'}
• Xu hướng: ${ieltsResults.length >= 2 ? 
    (latestResult.score.percentage > ieltsResults[1].score.percentage ? '📈 Đang cải thiện' : 
     latestResult.score.percentage < ieltsResults[1].score.percentage ? '📉 Cần ôn tập thêm' : '➡️ Ổn định') : '📊 Cần thêm data'}`;
    }

    return `📈 **TIẾN ĐỘ CỦA ${user.fullName.toUpperCase()}**

🎯 Level hiện tại: ${user.level}
${progressSection}${ieltsSection}`;
  },

  // Helper method: Tạo response dựa trên kết quả IELTS test 
  async generateIELTSTestBasedResponse(user: IUser, ieltsResults: any[]): Promise<string> {
    if (ieltsResults.length === 0) {
      return `${user.fullName}, tôi thấy bạn chưa hoàn thành bài IELTS test nào. Hãy thử làm một bài test Reading hoặc Listening để tôi có thể phân tích kết quả và đưa ra feedback chi tiết nhé! 🎯

📝 **Lợi ích khi làm IELTS test:**
• Đánh giá chính xác trình độ hiện tại
• Phát hiện điểm mạnh/yếu cụ thể  
• Nhận gợi ý học tập cá nhân hóa
• Theo dõi tiến bộ qua thời gian`;
    }

    const latestTest = ieltsResults[0];
    const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading');
    const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening');
    
    // Tính điểm trung bình cho từng skill
    const readingAvg = readingTests.length > 0 ? 
      readingTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / readingTests.length : 0;
    const listeningAvg = listeningTests.length > 0 ? 
      listeningTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / listeningTests.length : 0;

    // Phân tích xu hướng
    const trend = ieltsResults.length >= 2 ? 
      (latestTest.score.percentage > ieltsResults[1].score.percentage ? '📈 Đang cải thiện' : 
       latestTest.score.percentage < ieltsResults[1].score.percentage ? '📉 Cần ôn tập thêm' : '➡️ Ổn định') : '📊 Cần thêm data';

    return `📊 **PHÂN TÍCH KẾT QUẢ IELTS CỦA ${user.fullName.toUpperCase()}**

🎯 **Kết quả mới nhất:**
• Đề thi: ${latestTest.examTitle}
• Loại: ${latestTest.examType === 'reading' ? '📖 Reading' : '🎧 Listening'}
• Điểm số: ${latestTest.score.percentage}% (${latestTest.score.correctAnswers}/${latestTest.score.totalQuestions} câu đúng)
• Band Score: ${latestTest.score.bandScore || 'N/A'}
• Đánh giá: ${latestTest.score.description || 'N/A'}
• Ngày làm: ${new Date(latestTest.completedAt).toLocaleDateString('vi-VN')}

� **Thống kê tổng quan:**
• Tổng bài test: ${ieltsResults.length}
${readingTests.length > 0 ? `• Reading trung bình: ${Math.round(readingAvg)}% (${readingTests.length} bài)` : ''}
${listeningTests.length > 0 ? `• Listening trung bình: ${Math.round(listeningAvg)}% (${listeningTests.length} bài)` : ''}
• Xu hướng: ${trend}

🎯 **Feedback:**
${latestTest.score.percentage >= 80 ? '🎉 Xuất sắc! Kết quả rất ấn tượng!' : 
  latestTest.score.percentage >= 70 ? '👍 Tốt! Bạn đang trên đúng hướng!' :
  latestTest.score.percentage >= 60 ? '💪 Khá! Cần cải thiện thêm một chút!' : 
  '🎯 Cần luyện tập nhiều hơn để đạt mục tiêu!'}

${readingTests.length > 0 && listeningTests.length > 0 ? 
  (readingAvg > listeningAvg ? '� Reading mạnh hơn Listening, hãy tập trung cải thiện kỹ năng nghe!' : 
   listeningAvg > readingAvg ? '🎧 Listening mạnh hơn Reading, hãy luyện đọc hiểu thêm!' : 
   '⚖️ Cả hai skill đều cần được cải thiện đồng đều!') : ''}`;
  },

  // Helper method: Tạo response dựa trên khóa học và IELTS results
  async generateCourseBasedResponse(user: IUser, ieltsResults: any[]): Promise<string> {
    // Lấy danh sách khóa học có sẵn
    const availableCourses = await Course.find({ status: 'published' }).select('title level description price');
    
    let ieltsAnalysis = '';
    let recommendedCourses = availableCourses;

    if (ieltsResults.length > 0) {
      const latestResult = ieltsResults[0];
      const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading');
      const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening');
      
      const readingAvg = readingTests.length > 0 ? 
        readingTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / readingTests.length : 0;
      const listeningAvg = listeningTests.length > 0 ? 
        listeningTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / listeningTests.length : 0;

      ieltsAnalysis = `
🎯 **Phân tích từ kết quả IELTS:**
• Reading: ${Math.round(readingAvg)}% (${readingTests.length} bài)
• Listening: ${Math.round(listeningAvg)}% (${listeningTests.length} bài)
• Điểm yếu: ${readingAvg < listeningAvg ? 'Reading' : listeningAvg < readingAvg ? 'Listening' : 'Cần cải thiện đồng đều'}

📚 **Khóa học được ưu tiên dựa trên kết quả:**`;

      // Filter courses based on weak areas
      if (readingAvg < listeningAvg && readingAvg < 70) {
        recommendedCourses = availableCourses.filter((course: any) => 
          course.title.toLowerCase().includes('reading') || 
          course.title.toLowerCase().includes('vocabulary') ||
          course.title.toLowerCase().includes('grammar')
        );
      } else if (listeningAvg < readingAvg && listeningAvg < 70) {
        recommendedCourses = availableCourses.filter((course: any) => 
          course.title.toLowerCase().includes('listening') || 
          course.title.toLowerCase().includes('pronunciation')
        );
      }
    }

    const courseList = recommendedCourses.slice(0, 5).map((course: any, index: number) => 
      `${index + 1}. **${course.title}** - ${course.level} - ${course.price.toLocaleString('vi-VN')}đ`
    ).join('\n');

    return `📚 **GỢI Ý KHÓA HỌC CHO ${user.fullName.toUpperCase()}**

${ieltsAnalysis}

🎯 **Mục tiêu học tập:** ${user.learningGoals.join(', ') || 'Chưa thiết lập'}

📖 **Khóa học phù hợp với level ${user.level}:**
${courseList || 'Đang cập nhật khóa học...'}

${ieltsResults.length > 0 ? '✅ Khóa học được sắp xếp theo độ ưu tiên dựa trên kết quả IELTS của bạn!' : '📝 Hãy làm một vài bài IELTS test để tôi có thể gợi ý khóa học chính xác hơn!'}

💡 **Lời khuyên:** Nên bắt đầu với 1-2 khóa học để tập trung học sâu thay vì học nhiều khóa một lúc!`;
  },

  // Lấy lịch sử chat thật từ database
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      const { limit = 20, page = 1 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Cần đăng nhập để xem lịch sử chat'
        });
        return;
      }

      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const skip = (pageNum - 1) * limitNum;

      // Lấy các chat sessions của user
      const sessions = await ChatSession.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limitNum)
        .skip(skip);

      const total = await ChatSession.countDocuments({ userId });

      // Format dữ liệu cho frontend
      const history = sessions.map(session => ({
        sessionId: session._id,
        lastMessage: session.messages.length > 0 ? 
          session.messages[session.messages.length - 1].content.substring(0, 100) + '...' : '',
        messageCount: session.messages.length,
        lastInteraction: session.context.lastInteraction || session.updatedAt,
        topics: session.context.recentTopics || [],
        isActive: session.isActive,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }));

      res.json({
        success: true,
        message: 'Lấy lịch sử chat thành công',
        history,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
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

  // Lấy chi tiết một chat session
  async getChatSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Cần đăng nhập để xem chat session'
        });
        return;
      }

      const session = await ChatSession.findOne({ 
        _id: sessionId, 
        userId 
      });

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy chat session'
        });
        return;
      }

      // Format messages cho frontend
      const formattedSession = {
        _id: session._id,
        userId: session.userId,
        messages: session.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata
        })),
        context: session.context,
        isActive: session.isActive,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      };

      res.json({
        success: true,
        message: 'Lấy session thành công',
        session: formattedSession
      });

    } catch (error) {
      console.error('Error getting chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy chat session'
      });
    }
  },

  // Xóa lịch sử chat
  async clearChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Cần đăng nhập để xóa lịch sử chat'
        });
        return;
      }

      // Đếm số sessions trước khi xóa
      const count = await ChatSession.countDocuments({ userId });

      // Xóa tất cả chat sessions của user
      await ChatSession.deleteMany({ userId });

      res.json({
        success: true,
        message: 'Đã xóa lịch sử chat thành công',
        data: {
          deletedCount: count,
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
  },

  // Helper method: Phân tích trình độ chi tiết
  async generateLevelAnalysis(user: IUser, ieltsResults: any[]): Promise<string> {
    const progress = await Progress.findOne({ userId: user._id });
    const hasIELTSData = ieltsResults.length > 0;
    const latestResult = hasIELTSData ? ieltsResults[0] : null;
    
    // Phân tích level dựa trên IELTS band score
    let levelDescription = '';
    let bandScore = 'Chưa có';
    
    if (latestResult && latestResult.score.bandScore) {
      bandScore = latestResult.score.bandScore.toString();
      const band = parseFloat(bandScore);
      
      if (band >= 7.0) {
        levelDescription = 'Trình độ tốt - Có thể giao tiếp tự tin trong hầu hết tình huống';
      } else if (band >= 6.0) {
        levelDescription = 'Trình độ trung bình khá - Giao tiếp được nhưng còn một số hạn chế';
      } else if (band >= 5.0) {
        levelDescription = 'Trình độ trung bình - Cần cải thiện để giao tiếp hiệu quả hơn';
      } else if (band >= 4.0) {
        levelDescription = 'Trình độ cơ bản - Cần tập trung học nền tảng';
      } else {
        levelDescription = 'Trình độ mới bắt đầu - Nên học từ cơ bản';
      }
    } else {
      // Phân tích dựa trên level trong profile
      switch (user.level) {
        case 'A1':
        case 'A2':
          levelDescription = 'Trình độ cơ bản - Đang học các kiến thức nền tảng';
          break;
        case 'B1':
        case 'B2':
          levelDescription = 'Trình độ trung bình - Có thể giao tiếp cơ bản';
          break;
        case 'C1':
        case 'C2':
          levelDescription = 'Trình độ cao - Giao tiếp tự tin trong nhiều tình huống';
          break;
        default:
          levelDescription = 'Chưa xác định rõ - Hãy làm bài test để đánh giá chính xác';
      }
    }

    return `📊 **PHÂN TÍCH TRÌNH ĐỘ CỦA ${user.fullName}**

🎯 **Trình độ hiện tại**: ${user.level.toUpperCase()}
${hasIELTSData ? `🏆 **IELTS Band Score**: ${bandScore}` : '📝 **IELTS**: Chưa có kết quả'}
${hasIELTSData ? `📈 **Điểm gần nhất**: ${latestResult.score.percentage}%` : ''}

💭 **Đánh giá**: ${levelDescription}

${hasIELTSData ? `📋 **Phân tích chi tiết từ ${ieltsResults.length} bài test**:
• Reading: ${this.getSkillLevel(latestResult, 'reading')}
• Listening: ${this.getSkillLevel(latestResult, 'listening')}
• Tổng thể: ${latestResult.score.percentage >= 70 ? 'Tốt' : latestResult.score.percentage >= 50 ? 'Trung bình' : 'Cần cải thiện'}` : ''}

🎯 **Bước tiếp theo**: ${hasIELTSData ? 
  (latestResult.score.percentage >= 70 ? 'Nâng cao kỹ năng chuyên sâu' : 'Tập trung khắc phục điểm yếu') : 
  'Làm bài test IELTS để đánh giá chính xác'}`;
  },

  // Helper method: Tạo gợi ý cá nhân hóa dựa trên IELTS results
  async generatePersonalizedRecommendations(user: IUser, ieltsResults: any[]): Promise<string> {
    const progress = await Progress.findOne({ userId: user._id });
    
    if (!progress && ieltsResults.length === 0) {
      return `🎯 **GỢI Ý CHO ${user.fullName}**

Level ${user.level} - Bước đầu:
1. 📝 Làm IELTS placement test để đánh giá chính xác
2. 📚 Bắt đầu với khóa học cơ bản  
3. 🎧 Luyện nghe 15 phút/ngày
4. 📖 Học 10 từ vựng mới mỗi ngày

Mục tiêu: ${user.learningGoals.join(', ') || 'Thiết lập mục tiêu học tập'}`;
    }

    let ieltsRecommendations = '';
    if (ieltsResults.length > 0) {
      const latestResult = ieltsResults[0];
      const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading');
      const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening');
      
      const readingAvg = readingTests.length > 0 ? 
        readingTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / readingTests.length : 0;
      const listeningAvg = listeningTests.length > 0 ? 
        listeningTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / listeningTests.length : 0;

      const weekPoints = readingAvg < listeningAvg ? 'Reading' : listeningAvg < readingAvg ? 'Listening' : 'Cả hai kỹ năng';
      const strongPoints = readingAvg > listeningAvg ? 'Reading' : listeningAvg > readingAvg ? 'Listening' : 'Đồng đều';

      ieltsRecommendations = `
🎯 **Dựa trên ${ieltsResults.length} bài IELTS test:**
• Điểm mạnh: ${strongPoints} (${Math.max(readingAvg, listeningAvg).toFixed(0)}%)
• Cần cải thiện: ${weekPoints} (${Math.min(readingAvg, listeningAvg).toFixed(0)}%)
• Band Score mục tiêu: ${latestResult.score.bandScore ? (latestResult.score.bandScore + 0.5).toFixed(1) : '6.5+'}

� **Lộ trình học cá nhân hóa:**
${readingAvg < 70 ? '• Đọc 2 bài Reading mỗi ngày (30 phút)' : ''}
${listeningAvg < 70 ? '• Nghe podcast/audiobook 20 phút mỗi ngày' : ''}
${readingAvg < 60 || listeningAvg < 60 ? '• Học 15-20 từ vựng mới hàng ngày' : '• Ôn lại từ vựng đã học (10 từ/ngày)'}
• Làm 1 bài IELTS test mỗi tuần để theo dõi tiến bộ`;
    }

    let progressRecommendations = '';
    if (progress) {
      progressRecommendations = `
📈 **Từ dữ liệu học tập chung:**
${progress.vocabulary.learned < progress.vocabulary.target * 0.5 ? '• 📚 Tăng cường từ vựng (hiện ' + Math.round((progress.vocabulary.learned/progress.vocabulary.target)*100) + '%)' : ''}
${progress.listening.hoursCompleted < progress.listening.target * 0.5 ? '• 🎧 Tăng thời gian luyện nghe' : ''}
${progress.testsCompleted.completed < progress.testsCompleted.target * 0.5 ? '• 📝 Làm thêm bài test đánh giá' : ''}

Streak hiện tại: ${progress.studyStreak.current} ngày 🔥`;
    }

    return `🎯 **GỢI Ý CÁ NHÂN HÓA CHO ${user.fullName.toUpperCase()}**
${ieltsRecommendations}${progressRecommendations}

⏰ **Lịch học được đề xuất:**
- **Thứ 2, 4, 6:** ${ieltsResults.some((r: any) => r.examType === 'reading' && r.score.percentage < 70) ? 'Reading Skills' : 'Vocabulary Building'} (25 phút)
- **Thứ 3, 5, 7:** ${ieltsResults.some((r: any) => r.examType === 'listening' && r.score.percentage < 70) ? 'Listening Practice' : 'Grammar Review'} (25 phút)  
- **Chủ nhật:** IELTS Full Test + Review (60 phút)

🎯 **Mục tiêu 4 tuần tới:**
${ieltsResults.length > 0 ? `• Cải thiện ${(() => {
      const readingResults = ieltsResults.filter((r: any) => r.examType === 'reading');
      const listeningResults = ieltsResults.filter((r: any) => r.examType === 'listening');
      const readingAvg = readingResults.length > 0 ? readingResults.reduce((sum: number, r: any) => sum + r.score.percentage, 0) / readingResults.length : 0;
      const listeningAvg = listeningResults.length > 0 ? listeningResults.reduce((sum: number, r: any) => sum + r.score.percentage, 0) / listeningResults.length : 0;
      return readingAvg < listeningAvg ? 'Reading' : 'Listening';
    })()} lên 75%+` : '• Hoàn thành 4 bài IELTS test đầu tiên'}
• Duy trì streak học tập 28 ngày
• ${user.learningGoals.join(', ') || 'Thiết lập mục tiêu rõ ràng'}`;
  },

  // Helper method: Phân tích điểm yếu từ IELTS results
  async generateWeaknessAnalysis(user: IUser, ieltsResults: any[]): Promise<string> {
    if (ieltsResults.length === 0) {
      return `${user.fullName}, để tôi có thể phân tích điểm yếu cụ thể, bạn cần hoàn thành ít nhất 2-3 bài IELTS test (Reading và Listening). 

📝 **Hãy bắt đầu với:**
• 1 bài Reading test để đánh giá khả năng đọc hiểu
• 1 bài Listening test để đánh giá khả năng nghe

Sau đó tôi sẽ phân tích chi tiết và đưa ra kế hoạch cải thiện cụ thể! 🎯`;
    }

    const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading');
    const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening');
    
    const readingAvg = readingTests.length > 0 ? 
      readingTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / readingTests.length : 0;
    const listeningAvg = listeningTests.length > 0 ? 
      listeningTests.reduce((sum: number, test: any) => sum + test.score.percentage, 0) / listeningTests.length : 0;

    // Phân tích chi tiết từ answers của bài test gần nhất
    const latestTest = ieltsResults[0];
    const wrongAnswers = latestTest.answers ? latestTest.answers.filter((a: any) => !a.isCorrect) : [];
    const totalQuestions = latestTest.score.totalQuestions;
    const correctRate = latestTest.score.correctAnswers / totalQuestions;

    let specificWeaknesses = '';
    if (wrongAnswers.length > 0 && wrongAnswers.length < 20) {
      // Chỉ hiển thị chi tiết nếu không quá nhiều câu sai
      specificWeaknesses = `
🔍 **Phân tích chi tiết bài test gần nhất (${latestTest.examTitle}):**
• Tỷ lệ đúng: ${Math.round(correctRate * 100)}%
• Số câu sai: ${wrongAnswers.length}/${totalQuestions}
• Những câu sai cần ôn lại: ${wrongAnswers.slice(0, 5).map((a: any) => `Q${a.questionId.replace('q', '')}`).join(', ')}${wrongAnswers.length > 5 ? '...' : ''}`;
    }

    const overallAssessment = 
      readingAvg >= 80 && listeningAvg >= 80 ? '🎉 Excellent! Cả hai kỹ năng đều rất tốt!' :
      readingAvg >= 70 && listeningAvg >= 70 ? '👍 Good! Đang trên đúng hướng!' :
      readingAvg >= 60 && listeningAvg >= 60 ? '💪 Fair! Cần cải thiện thêm!' :
      '🎯 Needs Improvement! Cần luyện tập nhiều hơn!';

    return `🔍 **PHÂN TÍCH ĐIỂM YẾU CỦA ${user.fullName.toUpperCase()}**

📊 **Đánh giá tổng quan:**
${readingTests.length > 0 ? `• Reading: ${Math.round(readingAvg)}% (${readingTests.length} bài test)` : '• Reading: Chưa có dữ liệu'}
${listeningTests.length > 0 ? `• Listening: ${Math.round(listeningAvg)}% (${listeningTests.length} bài test)` : '• Listening: Chưa có dữ liệu'}
• Kết quả: ${overallAssessment}

🎯 **Điểm yếu chính:**
${readingAvg < listeningAvg ? 
  `• **Reading (${Math.round(readingAvg)}%)**: Cần cải thiện khả năng đọc hiểu
  - Luyện đọc skimming & scanning  
  - Học từ vựng Academic
  - Luyện dạng câu hỏi True/False/Not Given` : 
  readingAvg > listeningAvg ?
  `• **Listening (${Math.round(listeningAvg)}%)**: Cần cải thiện khả năng nghe
  - Luyện nghe với accent khác nhau
  - Cải thiện kỹ năng note-taking
  - Luyện dạng câu hỏi Multiple Choice` :
  `• **Cả hai kỹ năng**: Cần cải thiện đồng đều
  - Tăng cường từ vựng tổng quát
  - Luyện tập đều đặn hàng ngày
  - Focus vào time management`}

${specificWeaknesses}

💡 **Kế hoạch cải thiện (2 tuần tới):**
${readingAvg < 70 ? '• Đọc 1 passage Academic mỗi ngày (15 phút)' : ''}
${listeningAvg < 70 ? '• Nghe podcast/TED talks 20 phút mỗi ngày' : ''}
• Ôn lại từ vựng từ các bài test đã làm
• Làm 1 bài full test mỗi tuần để đo tiến bộ
• Review và phân tích tất cả câu sai

🎯 **Mục tiêu:** Cải thiện điểm yếu lên 75%+ trong 1 tháng!`;
  },

  // Helper method: Xây dựng phân tích tiến độ thật
  async buildRealProgressAnalysis(user: IUser, progress: IProgress | null, assessments: IAssessment[]): Promise<string> {
    const recentScores = assessments.map(a => a.results?.percentage || 0);
    const avgScore = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const trend = recentScores.length >= 2 ? 
      (recentScores[0] > recentScores[1] ? '📈 Đang cải thiện' : 
       recentScores[0] < recentScores[1] ? '📉 Cần cố gắng thêm' : '➡️ Ổn định') : '📊 Cần thêm dữ liệu';

    return `📊 **PHÂN TÍCH TIẾN ĐỘ CỦA ${user.fullName.toUpperCase()}**

👤 **Thông tin cá nhân:**
- Level hiện tại: ${user.level}
- Mục tiêu: ${user.learningGoals.join(', ') || 'Chưa thiết lập'}
- Thời gian học: ${user.totalStudyHours} giờ

${progress ? `📈 **Tiến độ học tập:**
- Từ vựng: ${progress.vocabulary.learned}/${progress.vocabulary.target} (${Math.round((progress.vocabulary.learned/progress.vocabulary.target)*100)}%)
- Nghe: ${progress.listening.hoursCompleted}/${progress.listening.target}h (${Math.round((progress.listening.hoursCompleted/progress.listening.target)*100)}%)
- Bài test: ${progress.testsCompleted.completed}/${progress.testsCompleted.target} (${Math.round((progress.testsCompleted.completed/progress.testsCompleted.target)*100)}%)
- Streak: ${progress.studyStreak.current}/${progress.studyStreak.target} ngày` : '📚 **Chưa có dữ liệu tiến độ chi tiết**'}

${assessments.length > 0 ? `🎯 **Kết quả bài test:**
- Số bài đã làm: ${assessments.length}
- Điểm trung bình: ${avgScore.toFixed(1)}%
- Xu hướng: ${trend}
- Bài gần nhất: ${recentScores[0]}% (${assessments[0].completedAt?.toLocaleDateString('vi-VN')})` : '📝 **Chưa có kết quả bài test**'}

💡 **Nhận xét:**
${avgScore >= 80 ? '🎉 Xuất sắc! Bạn đang học rất hiệu quả!' :
  avgScore >= 60 ? '👍 Tốt! Tiếp tục duy trì nhịp độ học tập!' :
  avgScore > 0 ? '💪 Cần cố gắng thêm! Hãy review lại kiến thức đã học!' :
  '🚀 Hãy bắt đầu với một bài test để đánh giá trình độ!'}`;
  },

  // Helper method: Xây dựng gợi ý cá nhân hóa thật
  async buildPersonalizedRecommendations(user: IUser, progress: IProgress | null, assessments: IAssessment[]): Promise<string> {
    const weakAreas = [];
    const strongAreas = [];

    // Phân tích điểm mạnh/yếu từ dữ liệu thật
    if (progress) {
      const vocabPercent = (progress.vocabulary.learned / progress.vocabulary.target) * 100;
      const listeningPercent = (progress.listening.hoursCompleted / progress.listening.target) * 100;
      const testPercent = (progress.testsCompleted.completed / progress.testsCompleted.target) * 100;

      if (vocabPercent < 50) weakAreas.push('Từ vựng');
      else if (vocabPercent > 80) strongAreas.push('Từ vựng');

      if (listeningPercent < 50) weakAreas.push('Nghe');
      else if (listeningPercent > 80) strongAreas.push('Nghe');

      if (testPercent < 50) weakAreas.push('Làm bài test');
      else if (testPercent > 80) strongAreas.push('Làm bài test');
    }

    // Phân tích từ kết quả assessment
    if (assessments.length > 0) {
      const avgScore = assessments.reduce((sum, a) => sum + (a.results?.percentage || 0), 0) / assessments.length;
      if (avgScore < 60) weakAreas.push('Tổng hợp kiến thức');
      else if (avgScore > 80) strongAreas.push('Tổng hợp kiến thức');
    }

    return `🎯 **LỘ TRÌNH HỌC CÁ NHÂN CHO ${user.fullName.toUpperCase()}**

📊 **Phân tích dựa trên dữ liệu thật:**
${strongAreas.length > 0 ? `✅ Điểm mạnh: ${strongAreas.join(', ')}` : ''}
${weakAreas.length > 0 ? `⚠️ Cần cải thiện: ${weakAreas.join(', ')}` : ''}

📚 **Kế hoạch học tuần này:**
${weakAreas.includes('Từ vựng') ? '• Thứ 2,4,6: Học 15 từ vựng mới (30 phút)' : '• Thứ 2,4,6: Ôn lại từ vựng đã học (15 phút)'}
${weakAreas.includes('Nghe') ? '• Thứ 3,5: Luyện nghe chuyên sâu (45 phút)' : '• Thứ 3,5: Luyện nghe nâng cao (25 phút)'}
${weakAreas.includes('Làm bài test') ? '• Thứ 7: Làm 2 bài test + review (60 phút)' : '• Thứ 7: Làm 1 bài test thử thách (30 phút)'}
• Chủ nhật: Ôn tập tổng hợp

🎯 **Mục tiêu cụ thể (1 tháng):**
${progress ? `- Đạt ${Math.min(progress.vocabulary.target, progress.vocabulary.learned + 100)} từ vựng` : '- Học 200 từ vựng mới'}
${progress ? `- Hoàn thành ${Math.min(progress.listening.target, progress.listening.hoursCompleted + 10)}h luyện nghe` : '- Luyện nghe 15h'}
${progress ? `- Làm thêm ${Math.max(5 - progress.testsCompleted.completed, 3)} bài test` : '- Hoàn thành 5 bài test'}

💡 **Gợi ý đặc biệt:**
${user.level === 'A1' || user.level === 'A2' ? '🔤 Focus vào grammar cơ bản và từ vựng hàng ngày' :
  user.level === 'B1' || user.level === 'B2' ? '📖 Đọc tin tức tiếng Anh và luyện speaking' :
  '🎓 Luyện academic English và thi chứng chỉ quốc tế'}

Dựa trên dữ liệu thực tế của bạn! 📈`;
  },

  // Helper method: Phân tích kỹ năng từ IELTS result
  getSkillLevel(result: any, skill: string): string {
    if (!result || !result.answers) return 'Chưa có dữ liệu';
    
    const skillAnswers = result.answers.filter((answer: any) => 
      answer.section?.toLowerCase().includes(skill)
    );
    
    if (skillAnswers.length === 0) return 'Chưa có dữ liệu';
    
    const correctAnswers = skillAnswers.filter((answer: any) => answer.isCorrect).length;
    const totalAnswers = skillAnswers.length;
    const percentage = (correctAnswers / totalAnswers) * 100;
    
    if (percentage >= 80) return `Tốt (${percentage.toFixed(0)}%)`;
    if (percentage >= 60) return `Khá (${percentage.toFixed(0)}%)`;
    if (percentage >= 40) return `Trung bình (${percentage.toFixed(0)}%)`;
    return `Yếu (${percentage.toFixed(0)}%)`;
  },

  // Get user enrollments with course details
  async getUserEnrollments(userId: string): Promise<any[]> {
    try {
      const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title description level price')
        .sort({ enrolledAt: -1 });
      
      return enrollments;
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  },

  // Build comprehensive analysis including IELTS and enrollments
  async buildComprehensiveAnalysis(
    user: IUser, 
    progress: IProgress | null, 
    assessments: IAssessment[], 
    ieltsResults: any[], 
    enrollments: any[],
    availableCourses: any[] = [],
    availableIELTSExams: any[] = []
  ): Promise<string> {
    const hasIELTSData = ieltsResults.length > 0;
    const hasEnrollments = enrollments.length > 0;
    const latestIELTS = hasIELTSData ? ieltsResults[0] : null;

    let analysis = `📊 **PHÂN TÍCH HỌC TẬP - ${user.fullName}**\n\n`;

    // IELTS Test Results Section
    if (hasIELTSData) {
      analysis += `🎯 **LỊCH SỬ IELTS TESTS (${ieltsResults.length} bài):**\n`;
      
      ieltsResults.slice(0, 5).forEach((result, index) => {
        const date = new Date(result.completedAt).toLocaleDateString('vi-VN');
        const bandScore = result.score.bandScore || 'N/A';
        const percentage = result.score.percentage || 0;
        
        analysis += `${index + 1}. **${date}** - Band ${bandScore} (${percentage}%)\n`;
        
        // Chi tiết điểm từng kỹ năng nếu có
        if (result.sections) {
          if (result.sections.reading) {
            analysis += `   📖 Reading: ${result.sections.reading.score}/${result.sections.reading.maxScore} (${Math.round(result.sections.reading.score/result.sections.reading.maxScore*100)}%)\n`;
          }
          if (result.sections.listening) {
            analysis += `   🎧 Listening: ${result.sections.listening.score}/${result.sections.listening.maxScore} (${Math.round(result.sections.listening.score/result.sections.listening.maxScore*100)}%)\n`;
          }
        }
        analysis += `\n`;
      });

      // Xu hướng điểm số
      if (ieltsResults.length > 1) {
        const trend = ieltsResults[0].score.percentage > ieltsResults[1].score.percentage ? '📈 Cải thiện' : '📉 Cần nỗ lực hơn';
        analysis += `📈 **Xu hướng:** ${trend}\n\n`;
      }
    } else {
      analysis += `🎯 **IELTS TESTS:** Chưa có dữ liệu test\n`;
      analysis += `💡 Hãy làm bài test IELTS để đánh giá trình độ!\n\n`;
    }

    // Enrollments Section
    if (hasEnrollments) {
      analysis += `📚 **KHÓA HỌC ĐÃ ĐĂNG KÝ (${enrollments.length} khóa):**\n`;
      
      enrollments.forEach((enrollment, index) => {
        const course = enrollment.courseId;
        const enrollDate = new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN');
        const completion = enrollment.progress?.completionPercentage || 0;
        const status = enrollment.status;
        
        analysis += `${index + 1}. **${course.title}**\n`;
        analysis += `   📅 Đăng ký: ${enrollDate}\n`;
        analysis += `   📊 Tiến độ: ${completion}% (${status})\n`;
        analysis += `   🎓 Level: ${course.level}\n\n`;
      });
    } else {
      analysis += `📚 **KHÓA HỌC ĐÃ ĐĂNG KÝ:** 0 khóa\n`;
      analysis += `💡 Chưa đăng ký khóa học nào!\n\n`;
    }

    // Smart Recommendations based on available data
    analysis += `� **GỢI Ý CẢI THIỆN:**\n`;
    
    // Recommendations based on IELTS results
    if (hasIELTSData && latestIELTS) {
      const bandScore = parseFloat(latestIELTS.score.bandScore) || 0;
      const percentage = latestIELTS.score.percentage || 0;
      
      if (percentage >= 80) {
        analysis += `🎯 **Trình độ cao** - Duy trì và nâng cao:\n`;
        analysis += `   • Luyện thêm các đề IELTS Reading và Listening nâng cao\n`;
        analysis += `   • Đăng ký khóa học chuyên sâu cho level C1-C2\n`;
      } else if (percentage >= 60) {
        analysis += `� **Trình độ trung bình** - Cần cải thiện:\n`;
        analysis += `   • Luyện tập thêm IELTS Reading và Listening\n`;
        analysis += `   • Đăng ký khóa học B1-B2 để củng cố nền tảng\n`;
      } else {
        analysis += `🔤 **Cần nâng cao cơ bản** - Xây dựng nền tảng:\n`;
        analysis += `   • Bắt đầu với khóa học A1-A2\n`;
        analysis += `   • Luyện từ vựng và ngữ pháp cơ bản\n`;
        analysis += `   • Làm quen với format IELTS Reading và Listening\n`;
      }
    } else {
      analysis += `🎯 **Chưa có dữ liệu đánh giá** - Bắt đầu ngay:\n`;
      analysis += `   • Làm bài test IELTS để đánh giá trình độ hiện tại\n`;
      analysis += `   • Đăng ký khóa học phù hợp với level\n`;
    }

    // Course enrollment recommendations
    if (!hasEnrollments && availableCourses.length > 0) {
      analysis += `\n📖 **KHÓA HỌC CÓ SẴN (${availableCourses.length} khóa):**\n`;
      
      // Hiển thị 3 khóa học đầu tiên
      const coursesToShow = availableCourses.slice(0, 3);

      if (coursesToShow.length > 0) {
        coursesToShow.forEach((course, index) => {
          analysis += `${index + 1}. **${course.title || 'Khóa học'}**\n`;
          analysis += `   🎓 Level: ${course.level || 'B1'}\n`;
          analysis += `   💰 Giá: ${course.price ? course.price.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}\n`;
          if (course.description) {
            analysis += `   📝 ${course.description.substring(0, 80)}...\n`;
          }
          analysis += `\n`;
        });
      } else {
        analysis += `   • Khóa học tiếng Anh cơ bản\n`;
        analysis += `   • Khóa học luyện thi IELTS\n`;
        analysis += `   • Khóa học giao tiếp thực tế\n`;
      }
    }

    // IELTS practice recommendations
    if (availableIELTSExams.length > 0) {
      analysis += `\n🎧 **ĐỀ THI IELTS CÓ SẴN (${availableIELTSExams.length} đề):**\n`;
      
      // Lọc đề thi phù hợp với level
      const readingExams = availableIELTSExams.filter(exam => 
        exam.type === 'reading' || exam.title.toLowerCase().includes('reading')
      ).slice(0, 2);
      
      const listeningExams = availableIELTSExams.filter(exam => 
        exam.type === 'listening' || exam.title.toLowerCase().includes('listening')
      ).slice(0, 2);

      if (readingExams.length > 0) {
        analysis += `📖 **Reading Tests:**\n`;
        readingExams.forEach((exam, index) => {
          analysis += `   ${index + 1}. ${exam.title}\n`;
          if (exam.difficulty) {
            analysis += `      📊 Độ khó: ${exam.difficulty}\n`;
          }
        });
        analysis += `\n`;
      }

      if (listeningExams.length > 0) {
        analysis += `🎧 **Listening Tests:**\n`;
        listeningExams.forEach((exam, index) => {
          analysis += `   ${index + 1}. ${exam.title}\n`;
          if (exam.difficulty) {
            analysis += `      📊 Độ khó: ${exam.difficulty}\n`;
          }
        });
        analysis += `\n`;
      }

      if (readingExams.length === 0 && listeningExams.length === 0) {
        analysis += `   • Làm thêm đề thi IELTS Reading có sẵn\n`;
        analysis += `   • Luyện IELTS Listening với đề thi thực tế\n`;
        analysis += `   • Thực hành đều đặn để cải thiện band score\n`;
      }
    } else {
      analysis += `\n🎧 **LUYỆN TẬP IELTS:**\n`;
      analysis += `   • Làm thêm đề thi IELTS Reading có sẵn\n`;
      analysis += `   • Luyện IELTS Listening với đề thi thực tế\n`;
      analysis += `   • Thực hành đều đặn để cải thiện band score\n`;
    }

    analysis += `\n✨ **Dữ liệu thực tế từ hệ thống - cập nhật theo thời gian thực!**`;

    return analysis;
  }
};
