import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Progress, IProgress } from '../models/Progress';
import { Assessment, IAssessment } from '../models/Assessment';
import IELTSTestResult from '../models/IELTSTestResult';
import Course, { ICourse } from '../models/Course';
import Enrollment, { IEnrollment } from '../models/Enrollment';
import LevelEnrollment from '../models/LevelEnrollment';
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
              ieltsResults.filter(r => r.score.bandScore).reduce((sum, r) => sum + (r.score.bandScore || 0), 0) / ieltsResults.filter(r => r.score.bandScore).length : 0
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
`📊 **Trình độ hiện tại**: ${user.level}${latestResult.score.bandScore ? ` (Band ${latestResult.score.bandScore})` : ''}` : 
`📊 **Trình độ hiện tại**: ${user.level}`}

Tôi có thể giúp bạn:
• **"trình độ của tôi ở đâu"** - Phân tích level chi tiết
• **"kết quả IELTS"** - Xem điểm số và feedback  
• **"gợi ý học tập"** - Lộ trình phù hợp

${hasIELTSData ? '✅ Đã có dữ liệu IELTS để phân tích chính xác!' : '⚠️ Làm bài test để có phân tích chi tiết hơn!'}` ;
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

      // Lấy thông tin enrollment/khóa học đã đăng ký (Hệ thống cũ)
      const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title description level price')
        .sort({ enrolledAt: -1 });

      // Lấy thông tin Level Enrollment (Hệ thống mới - hộp thẻ level)
      const levelEnrollments = await LevelEnrollment.find({ 
        userId,
        status: 'active'
      }).sort({ enrolledAt: -1 });

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
        levelEnrollmentsCount: levelEnrollments.length,
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
      if (!progress && assessments.length === 0 && ieltsResults.length === 0 && enrollments.length === 0 && levelEnrollments.length === 0) {
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
        analysis = await realDataChatbotController.buildComprehensiveAnalysis(user, progress, assessments, ieltsResults, enrollments, levelEnrollments, availableCourses, availableIELTSExams);
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

  // Gợi ý học tập với dữ liệu IELTS thật (không dùng Progress fake data)
  async generateLearningRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'Cần đăng nhập để nhận gợi ý học tập' 
        });
      }

      // Lấy dữ liệu thật từ database
      const user = await User.findById(userId);
      const assessments = await Assessment.find({ userId, status: 'completed' })
        .sort({ completedAt: -1 });
      const ieltsResults = await IELTSTestResult.find({ userId })
        .sort({ completedAt: -1 });
      const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title description level price')
        .sort({ enrolledAt: -1 });
      const levelEnrollments = await LevelEnrollment.find({ 
        userId,
        status: 'active'
      }).sort({ enrolledAt: -1 });
      const availableCourses = await Course.find({ isActive: true })
        .select('title description level price')
        .limit(5);

      console.log('🎯 RECOMMENDATION DATA:', {
        userId,
        userFound: !!user,
        userName: user?.fullName,
        userLevel: user?.level,
        assessmentsCount: assessments.length,
        ieltsResultsCount: ieltsResults.length,
        enrollmentsCount: enrollments.length,
        levelEnrollmentsCount: levelEnrollments.length,
        availableCoursesCount: availableCourses.length
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy thông tin người dùng' 
        });
      }

      // Kiểm tra dữ liệu thật
      const hasIELTSData = ieltsResults.length > 0;
      const hasEnrollments = enrollments.length > 0 || levelEnrollments.length > 0;

      if (!hasIELTSData && assessments.length === 0 && !hasEnrollments) {
        return res.json({
          success: true,
          recommendations: `🎯 **GỢI Ý HỌC TẬP CƠ BẢN**

Xin chào ${user.fullName}! 

Vì bạn chưa có dữ liệu học tập cụ thể, đây là gợi ý dành cho level ${user.level}:

📚 **Bước đầu tiên:**
1. 🎯 Làm bài test IELTS Reading để đánh giá trình độ
2. 🎧 Làm bài test IELTS Listening để đánh giá khả năng nghe  
3. 📖 Chọn 1 khóa học phù hợp với level ${user.level}

🎯 **Mục tiêu cho người mới:**
- Học 15-20 phút mỗi ngày
- Hoàn thành 1 bài IELTS test mỗi tuần
- Focus vào từ vựng cơ bản và ngữ pháp

Sau khi có ít nhất 3-5 bài test IELTS, tôi sẽ đưa ra lộ trình cá nhân hóa chính xác hơn! 🚀`,
          hasData: false,
          type: 'basic_recommendations'
        });
      }

      // Tạo gợi ý dựa trên dữ liệu IELTS thật
      let recommendations = '';

      try {
        console.log('🔄 Building IELTS-based recommendations...');
        recommendations = await realDataChatbotController.buildIELTSBasedRecommendations(user, ieltsResults, enrollments, levelEnrollments, availableCourses);
        console.log('✅ IELTS-based recommendations completed');

      } catch (error) {
        console.error('❌ Error building recommendations, using fallback:', error);
        recommendations = `📊 **GỢI Ý HỌC TẬP - ${user.fullName}**\n\nXin lỗi, có lỗi trong quá trình tạo gợi ý. Hãy thử lại sau.`;
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
      const ieltsWithBandScore = ieltsResults.filter((r: any) => r.score.bandScore);
      const averageBandScore = ieltsWithBandScore.length > 0 ?
        ieltsWithBandScore.reduce((sum: number, result: any) => sum + result.score.bandScore, 0) / ieltsWithBandScore.length : 0;
      const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading').length;
      const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening').length;
      
      ieltsSection = `
🎯 **TIẾN ĐỘ IELTS:**
• Tổng bài test: ${ieltsResults.length} (Reading: ${readingTests}, Listening: ${listeningTests})
• Band Score trung bình: ${averageBandScore > 0 ? averageBandScore.toFixed(1) : 'N/A'}
• Kết quả mới nhất: Band ${latestResult.score.bandScore || 'N/A'} (${latestResult.examTitle})
• Số câu đúng: ${latestResult.score.correctAnswers}/${latestResult.score.totalQuestions}
• Xu hướng: ${ieltsResults.length >= 2 && ieltsResults[1].score.bandScore && latestResult.score.bandScore ? 
    (latestResult.score.bandScore > ieltsResults[1].score.bandScore ? '📈 Đang cải thiện' : 
     latestResult.score.bandScore < ieltsResults[1].score.bandScore ? '📉 Cần ôn tập thêm' : '➡️ Ổn định') : '📊 Cần thêm data'}`;
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
    
    // Tính điểm trung bình cho từng skill (dùng bandScore)
    const readingWithBandScore = readingTests.filter((t: any) => t.score.bandScore);
    const listeningWithBandScore = listeningTests.filter((t: any) => t.score.bandScore);
    
    const readingAvgBand = readingWithBandScore.length > 0 ? 
      readingWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / readingWithBandScore.length : 0;
    const listeningAvgBand = listeningWithBandScore.length > 0 ? 
      listeningWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / listeningWithBandScore.length : 0;

    // Phân tích xu hướng
    const trend = ieltsResults.length >= 2 && ieltsResults[1].score.bandScore && latestTest.score.bandScore ? 
      (latestTest.score.bandScore > ieltsResults[1].score.bandScore ? '📈 Đang cải thiện' : 
       latestTest.score.bandScore < ieltsResults[1].score.bandScore ? '📉 Cần ôn tập thêm' : '➡️ Ổn định') : '📊 Cần thêm data';

    return `📊 **PHÂN TÍCH KẾT QUẢ IELTS CỦA ${user.fullName.toUpperCase()}**

🎯 **Kết quả mới nhất:**
• Đề thi: ${latestTest.examTitle}
• Loại: ${latestTest.examType === 'reading' ? '📖 Reading' : '🎧 Listening'}
• Band Score: ${latestTest.score.bandScore || 'N/A'}
• Số câu đúng: ${latestTest.score.correctAnswers}/${latestTest.score.totalQuestions}
• Đánh giá: ${latestTest.score.description || 'N/A'}
• Ngày làm: ${new Date(latestTest.completedAt).toLocaleDateString('vi-VN')}

� **Thống kê tổng quan:**
• Tổng bài test: ${ieltsResults.length}
${readingWithBandScore.length > 0 ? `• Reading trung bình: Band ${readingAvgBand.toFixed(1)} (${readingTests.length} bài)` : ''}
${listeningWithBandScore.length > 0 ? `• Listening trung bình: Band ${listeningAvgBand.toFixed(1)} (${listeningTests.length} bài)` : ''}
• Xu hướng: ${trend}

🎯 **Feedback:**
${latestTest.score.bandScore ? 
  (latestTest.score.bandScore >= 8.0 ? '🎉 Xuất sắc! Kết quả rất ấn tượng!' : 
   latestTest.score.bandScore >= 7.0 ? '👍 Tốt! Bạn đang trên đúng hướng!' :
   latestTest.score.bandScore >= 6.0 ? '💪 Khá! Cần cải thiện thêm một chút!' : 
   '🎯 Cần luyện tập nhiều hơn để đạt mục tiêu!') :
  '🎯 Hãy tiếp tục luyện tập!'}

${readingWithBandScore.length > 0 && listeningWithBandScore.length > 0 ? 
  (readingAvgBand > listeningAvgBand ? '📖 Reading mạnh hơn Listening, hãy tập trung cải thiện kỹ năng nghe!' : 
   listeningAvgBand > readingAvgBand ? '🎧 Listening mạnh hơn Reading, hãy luyện đọc hiểu thêm!' : 
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
      
      // Tính band score trung bình cho từng skill
      const readingWithBandScore = readingTests.filter((t: any) => t.score.bandScore);
      const listeningWithBandScore = listeningTests.filter((t: any) => t.score.bandScore);
      
      const readingAvgBand = readingWithBandScore.length > 0 ? 
        readingWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / readingWithBandScore.length : 0;
      const listeningAvgBand = listeningWithBandScore.length > 0 ? 
        listeningWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / listeningWithBandScore.length : 0;

      ieltsAnalysis = `
🎯 **Phân tích từ kết quả IELTS:**
• Reading: ${readingWithBandScore.length > 0 ? `Band ${readingAvgBand.toFixed(1)}` : 'Chưa có'} (${readingTests.length} bài)
• Listening: ${listeningWithBandScore.length > 0 ? `Band ${listeningAvgBand.toFixed(1)}` : 'Chưa có'} (${listeningTests.length} bài)
• Điểm yếu: ${readingAvgBand > 0 && listeningAvgBand > 0 ? (readingAvgBand < listeningAvgBand ? 'Reading' : listeningAvgBand < readingAvgBand ? 'Listening' : 'Cần cải thiện đồng đều') : 'Chưa đủ dữ liệu'}

📚 **Khóa học được ưu tiên dựa trên kết quả:**`;

      // Filter courses based on weak areas
      if (readingAvgBand > 0 && listeningAvgBand > 0 && readingAvgBand < listeningAvgBand && readingAvgBand < 7.0) {
        recommendedCourses = availableCourses.filter((course: any) => 
          course.title.toLowerCase().includes('reading') || 
          course.title.toLowerCase().includes('vocabulary') ||
          course.title.toLowerCase().includes('grammar')
        );
      } else if (readingAvgBand > 0 && listeningAvgBand > 0 && listeningAvgBand < readingAvgBand && listeningAvgBand < 7.0) {
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

💭 **Đánh giá**: ${levelDescription}

${hasIELTSData ? `📋 **Phân tích chi tiết từ ${ieltsResults.length} bài test**:
• Reading: ${this.getSkillLevel(latestResult, 'reading')}
• Listening: ${this.getSkillLevel(latestResult, 'listening')}
• Tổng thể: ${latestResult.score.bandScore ? (latestResult.score.bandScore >= 7.0 ? 'Tốt' : latestResult.score.bandScore >= 5.0 ? 'Trung bình' : 'Cần cải thiện') : 'N/A'}` : ''}

🎯 **Bước tiếp theo**: ${hasIELTSData ? 
  (latestResult.score.bandScore && latestResult.score.bandScore >= 7.0 ? 'Nâng cao kỹ năng chuyên sâu' : 'Tập trung khắc phục điểm yếu') : 
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
      
      // Tính band score trung bình
      const readingWithBandScore = readingTests.filter((t: any) => t.score.bandScore);
      const listeningWithBandScore = listeningTests.filter((t: any) => t.score.bandScore);
      
      const readingAvgBand = readingWithBandScore.length > 0 ? 
        readingWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / readingWithBandScore.length : 0;
      const listeningAvgBand = listeningWithBandScore.length > 0 ? 
        listeningWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / listeningWithBandScore.length : 0;

      const weekPoints = readingAvgBand < listeningAvgBand ? 'Reading' : listeningAvgBand < readingAvgBand ? 'Listening' : 'Cả hai kỹ năng';
      const strongPoints = readingAvgBand > listeningAvgBand ? 'Reading' : listeningAvgBand > readingAvgBand ? 'Listening' : 'Đồng đều';

      ieltsRecommendations = `
🎯 **Dựa trên ${ieltsResults.length} bài IELTS test:**
• Điểm mạnh: ${strongPoints} (Band ${Math.max(readingAvgBand, listeningAvgBand).toFixed(1)})
• Cần cải thiện: ${weekPoints} (Band ${Math.min(readingAvgBand, listeningAvgBand).toFixed(1)})
• Band Score mục tiêu: ${latestResult.score.bandScore ? (latestResult.score.bandScore + 0.5).toFixed(1) : '6.5+'}

📚 **Lộ trình học cá nhân hóa:**
${readingAvgBand < 7.0 ? '• Đọc 2 bài Reading mỗi ngày (30 phút)' : ''}
${listeningAvgBand < 7.0 ? '• Nghe podcast/audiobook 20 phút mỗi ngày' : ''}
${readingAvgBand < 6.0 || listeningAvgBand < 6.0 ? '• Học 15-20 từ vựng mới hàng ngày' : '• Ôn lại từ vựng đã học (10 từ/ngày)'}
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
- **Thứ 2, 4, 6:** ${ieltsResults.some((r: any) => r.examType === 'reading' && r.score.bandScore && r.score.bandScore < 7.0) ? 'Reading Skills' : 'Vocabulary Building'} (25 phút)
⏰ **Lịch học được đề xuất:**
- **Thứ 2, 4, 6:** ${ieltsResults.some((r: any) => r.examType === 'reading' && r.score.bandScore && r.score.bandScore < 7.0) ? 'Reading Skills' : 'Vocabulary Building'} (25 phút)
- **Thứ 3, 5, 7:** ${ieltsResults.some((r: any) => r.examType === 'listening' && r.score.bandScore && r.score.bandScore < 7.0) ? 'Listening Practice' : 'Grammar Review'} (25 phút)  
- **Chủ nhật:** IELTS Full Test + Review (60 phút)

🎯 **Mục tiêu 4 tuần tới:**
${ieltsResults.length > 0 ? `• Cải thiện ${(() => {
      const readingResults = ieltsResults.filter((r: any) => r.examType === 'reading');
      const listeningResults = ieltsResults.filter((r: any) => r.examType === 'listening');
      const readingWithBand = readingResults.filter((r: any) => r.score.bandScore);
      const listeningWithBand = listeningResults.filter((r: any) => r.score.bandScore);
      const readingAvgBand = readingWithBand.length > 0 ? readingWithBand.reduce((sum: number, r: any) => sum + r.score.bandScore, 0) / readingWithBand.length : 0;
      const listeningAvgBand = listeningWithBand.length > 0 ? listeningWithBand.reduce((sum: number, r: any) => sum + r.score.bandScore, 0) / listeningWithBand.length : 0;
      return readingAvgBand < listeningAvgBand ? 'Reading' : 'Listening';
    })()} lên Band 7.5+` : '• Hoàn thành 4 bài IELTS test đầu tiên'}
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
    
    // Tính band score trung bình
    const readingWithBandScore = readingTests.filter((t: any) => t.score.bandScore);
    const listeningWithBandScore = listeningTests.filter((t: any) => t.score.bandScore);
    
    const readingAvgBand = readingWithBandScore.length > 0 ? 
      readingWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / readingWithBandScore.length : 0;
    const listeningAvgBand = listeningWithBandScore.length > 0 ? 
      listeningWithBandScore.reduce((sum: number, test: any) => sum + test.score.bandScore, 0) / listeningWithBandScore.length : 0;

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
      readingAvgBand >= 8.0 && listeningAvgBand >= 8.0 ? '🎉 Excellent! Cả hai kỹ năng đều rất tốt!' :
      readingAvgBand >= 7.0 && listeningAvgBand >= 7.0 ? '👍 Good! Đang trên đúng hướng!' :
      readingAvgBand >= 6.0 && listeningAvgBand >= 6.0 ? '💪 Fair! Cần cải thiện thêm!' :
      '🎯 Needs Improvement! Cần luyện tập nhiều hơn!';

    return `🔍 **PHÂN TÍCH ĐIỂM YẾU CỦA ${user.fullName.toUpperCase()}**

📊 **Đánh giá tổng quan:**
${readingWithBandScore.length > 0 ? `• Reading: Band ${readingAvgBand.toFixed(1)} (${readingTests.length} bài test)` : '• Reading: Chưa có dữ liệu'}
${listeningWithBandScore.length > 0 ? `• Listening: Band ${listeningAvgBand.toFixed(1)} (${listeningTests.length} bài test)` : '• Listening: Chưa có dữ liệu'}
• Kết quả: ${overallAssessment}

🎯 **Điểm yếu chính:**
${readingAvgBand < listeningAvgBand ? 
  `• **Reading (Band ${readingAvgBand.toFixed(1)})**: Cần cải thiện khả năng đọc hiểu
  - Luyện đọc skimming & scanning  
  - Học từ vựng Academic
  - Luyện dạng câu hỏi True/False/Not Given` : 
  readingAvgBand > listeningAvgBand ?
  `• **Listening (Band ${listeningAvgBand.toFixed(1)})**: Cần cải thiện khả năng nghe
  - Luyện nghe với accent khác nhau
  - Cải thiện kỹ năng note-taking
  - Luyện dạng câu hỏi Multiple Choice` :
  `• **Cả hai kỹ năng**: Cần cải thiện đồng đều
  - Tăng cường từ vựng tổng quát
  - Luyện tập đều đặn hàng ngày
  - Focus vào time management`}

${specificWeaknesses}

💡 **Kế hoạch cải thiện (2 tuần tới):**
${readingAvgBand < 7.0 ? '• Đọc 1 passage Academic mỗi ngày (15 phút)' : ''}
${listeningAvgBand < 7.0 ? '• Nghe podcast/TED talks 20 phút mỗi ngày' : ''}
• Ôn lại từ vựng từ các bài test đã làm
• Làm 1 bài full test mỗi tuần để đo tiến bộ
• Review và phân tích tất cả câu sai

🎯 **Mục tiêu:** Cải thiện điểm yếu lên Band 7.5+ trong 1 tháng!`;
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
    const correctRate = correctAnswers / totalAnswers;
    
    // Convert to band score equivalent
    let bandScore = 0;
    if (correctRate >= 0.95) bandScore = 9.0;
    else if (correctRate >= 0.90) bandScore = 8.5;
    else if (correctRate >= 0.85) bandScore = 8.0;
    else if (correctRate >= 0.78) bandScore = 7.5;
    else if (correctRate >= 0.70) bandScore = 7.0;
    else if (correctRate >= 0.60) bandScore = 6.5;
    else if (correctRate >= 0.50) bandScore = 6.0;
    else if (correctRate >= 0.40) bandScore = 5.5;
    else if (correctRate >= 0.30) bandScore = 5.0;
    else bandScore = 4.5;
    
    if (bandScore >= 8.0) return `Tốt (Band ${bandScore.toFixed(1)})`;
    if (bandScore >= 6.5) return `Khá (Band ${bandScore.toFixed(1)})`;
    if (bandScore >= 5.5) return `Trung bình (Band ${bandScore.toFixed(1)})`;
    return `Yếu (Band ${bandScore.toFixed(1)})`;
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
    levelEnrollments: any[],
    availableCourses: any[] = [],
    availableIELTSExams: any[] = []
  ): Promise<string> {
    const hasIELTSData = ieltsResults.length > 0;
    const hasEnrollments = enrollments.length > 0;
    const hasLevelEnrollments = levelEnrollments.length > 0;
    const latestIELTS = hasIELTSData ? ieltsResults[0] : null;

    let analysis = `📊 **PHÂN TÍCH HỌC TẬP - ${user.fullName}**\n\n`;

    // IELTS Test Results Section
    if (hasIELTSData) {
      analysis += `🎯 **LỊCH SỬ IELTS TESTS (${ieltsResults.length} bài):**\n`;
      
      ieltsResults.slice(0, 5).forEach((result, index) => {
        const date = new Date(result.completedAt).toLocaleDateString('vi-VN');
        const bandScore = result.score.bandScore || 'N/A';
        const correctAnswers = result.score.correctAnswers || 0;
        const totalQuestions = result.score.totalQuestions || 40;
        
        analysis += `${index + 1}. **${date}** - Band ${bandScore} (${correctAnswers}/${totalQuestions})\n`;
        
        // Chi tiết điểm từng kỹ năng nếu có
        if (result.sections) {
          if (result.sections.reading) {
            analysis += `   📖 Reading: ${result.sections.reading.score}/${result.sections.reading.maxScore}\n`;
          }
          if (result.sections.listening) {
            analysis += `   🎧 Listening: ${result.sections.listening.score}/${result.sections.listening.maxScore}\n`;
          }
        }
        analysis += `\n`;
      });

      // Xu hướng điểm số
      if (ieltsResults.length > 1) {
        const trend = ieltsResults[0].score.bandScore && ieltsResults[1].score.bandScore && 
          ieltsResults[0].score.bandScore > ieltsResults[1].score.bandScore ? '📈 Cải thiện' : '📉 Cần nỗ lực hơn';
        analysis += `📈 **Xu hướng:** ${trend}\n\n`;
      }
    } else {
      analysis += `🎯 **IELTS TESTS:** Chưa có dữ liệu test\n`;
      analysis += `💡 Hãy làm bài test IELTS để đánh giá trình độ!\n\n`;
    }

    // Enrollments Section - Level Packages (Hệ thống mới)
    if (hasLevelEnrollments) {
      analysis += `🎯 **GÓI LEVEL ĐÃ MUA (${levelEnrollments.length} gói):**\n`;
      
      levelEnrollments.forEach((enrollment, index) => {
        const enrollDate = new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN');
        const paymentDate = enrollment.paymentDate ? new Date(enrollment.paymentDate).toLocaleDateString('vi-VN') : 'N/A';
        const paidAmount = enrollment.paidAmount || 0;
        
        analysis += `${index + 1}. **🎫 Gói Level ${enrollment.level}**\n`;
        analysis += `   📅 Đăng ký: ${enrollDate}\n`;
        if (paidAmount > 0) {
          analysis += `   💰 Đã thanh toán: ${paidAmount.toLocaleString()}đ (${paymentDate})\n`;
        }
        analysis += `   👉 Truy cập: Tất cả khóa học level ${enrollment.level}\n`;
        analysis += `   ✅ Trạng thái: ${enrollment.status === 'active' ? 'Hoạt động' : enrollment.status}\n\n`;
      });
    }

    // Enrollments Section - Single Courses (Hệ thống cũ)
    if (hasEnrollments) {
      analysis += `📚 **KHÓA HỌC RIÊNG LẺ ĐÃ ĐĂNG KÝ (${enrollments.length} khóa):**\n`;
      
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
    } else if (!hasLevelEnrollments && !hasEnrollments) {
      analysis += `📚 **KHÓA HỌC ĐÃ ĐĂNG KÝ:** 0 khóa\n`;
      analysis += `💡 Chưa đăng ký khóa học nào!\n\n`;
    }

    // Smart Recommendations based on available data
    analysis += `💡 **GỢI Ý CẢI THIỆN:**\n`;
    
    // Recommendations based on IELTS results
    if (hasIELTSData && latestIELTS) {
      const bandScore = parseFloat(latestIELTS.score.bandScore) || 0;
      
      if (bandScore >= 8.0) {
        analysis += `🎯 **Trình độ cao** - Duy trì và nâng cao:\n`;
        analysis += `   • Luyện thêm các đề IELTS Reading và Listening nâng cao\n`;
        analysis += `   • Đăng ký khóa học chuyên sâu cho level C1-C2\n`;
      } else if (bandScore >= 6.0) {
        analysis += `📚 **Trình độ trung bình** - Cần cải thiện:\n`;
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

    // SMART PERSONAL RECOMMENDATIONS - Phân tích dữ liệu IELTS thật
    if (hasIELTSData) {
      // Tính band score trung bình từ tất cả các bài test
      const ieltsWithBandScore = ieltsResults.filter(r => r.score.bandScore);
      const totalBandScore = ieltsWithBandScore.reduce((sum, result) => {
        const band = parseFloat(result.score.bandScore) || 0;
        return sum + band;
      }, 0);
      const averageBandScore = ieltsWithBandScore.length > 0 ? 
        (totalBandScore / ieltsWithBandScore.length).toFixed(1) : '0.0';
      
      // Phân tích xu hướng
      let trendAnalysis = '';
      if (ieltsResults.length >= 2 && ieltsResults[0].score.bandScore && ieltsResults[1].score.bandScore) {
        const recent = ieltsResults.slice(0, 2);
        const older = ieltsResults.slice(-2);
        const recentWithBand = recent.filter(r => r.score.bandScore);
        const olderWithBand = older.filter(r => r.score.bandScore);
        
        if (recentWithBand.length > 0 && olderWithBand.length > 0) {
          const recentAvg = recentWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / recentWithBand.length;
          const olderAvg = olderWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / olderWithBand.length;
          
          if (recentAvg > olderAvg + 0.5) {
            trendAnalysis = '📈 **Xu hướng cải thiện rõ rệt!**';
          } else if (recentAvg < olderAvg - 0.5) {
            trendAnalysis = '📉 **Xu hướng giảm, cần tập trung hơn!**';
          } else {
            trendAnalysis = '➡️ **Xu hướng ổn định.**';
          }
        }
      }
      
      const avgBand = parseFloat(averageBandScore);
      
      analysis += `\n🎯 **GỢI Ý CÁ NHÂN DỰA TRÊN ${ieltsResults.length} BÀI TEST IELTS:**\n`;
      analysis += `📊 **Band Score trung bình:** ${averageBandScore}\n`;
      analysis += `📈 **Band Score mới nhất:** ${latestIELTS.score.bandScore || 'N/A'}\n`;
      if (trendAnalysis) {
        analysis += `${trendAnalysis}\n`;
      }
      analysis += `\n`;
      
      // Gợi ý cụ thể dựa trên band score trung bình
      if (avgBand >= 8.0) {
        analysis += `🌟 **TRÌNH ĐỘ CAO (Band ${averageBandScore})** - Chiến lược nâng cao:\n`;
        analysis += `   ✅ **Duy trì thế mạnh:** Tiếp tục luyện đề IELTS Reading & Listening nâng cao\n`;
        analysis += `   📚 **Khóa học nên đăng ký:** Advanced English (C1-C2), IELTS Band 7.5+, hoặc khóa từ vựng Academic\n`;
        analysis += `   💪 **Mục tiêu:** Hướng tới Band 8.5-9.0, focus vào Writing & Speaking\n`;
        analysis += `   🎯 **Luyện tập:** 2-3 đề Reading/Listening khó mỗi tuần, đọc báo tiếng Anh hằng ngày\n`;
      } else if (avgBand >= 6.5) {
        analysis += `📚 **TRÌNH ĐỘ TỐT (Band ${averageBandScore})** - Củng cố và phát triển:\n`;
        analysis += `   ✅ **Điểm mạnh:** Nền tảng ổn, cần nâng cao kỹ thuật làm bài\n`;
        analysis += `   📚 **Khóa học nên đăng ký:** Intermediate-Upper (B2), IELTS Band 6.5, hoặc khóa ngữ pháp nâng cao\n`;
        analysis += `   💪 **Mục tiêu:** Hướng tới Band 7.5, cải thiện từ vựng academic và tốc độ đọc\n`;
        analysis += `   🎯 **Luyện tập:** 1-2 đề Reading/Listening mỗi ngày, học 20-30 từ vựng IELTS/ngày\n`;
      } else if (avgBand >= 5.0) {
        analysis += `⚡ **TRÌNH ĐỘ TRUNG BÌNH (Band ${averageBandScore})** - Cần cải thiện cơ bản:\n`;
        analysis += `   ✅ **Ưu tiên:** Củng cố ngữ pháp và từ vựng cơ bản\n`;
        analysis += `   📚 **Khóa học nên đăng ký:** Pre-Intermediate (B1), Grammar & Vocabulary, hoặc IELTS Foundation\n`;
        analysis += `   💪 **Mục tiêu:** Hướng tới Band 6.5, tăng tốc độ đọc hiểu và nghe hiểu\n`;
        analysis += `   🎯 **Luyện tập:** 1 đề Reading/Listening mỗi ngày, học 15-20 từ vựng cơ bản/ngày\n`;
      } else {
        analysis += `🔥 **CẦN XÂY DỰNG NỀN TẢNG (Band ${averageBandScore})** - Kế hoạch từ cơ bản:\n`;
        analysis += `   ✅ **Ưu tiên cao:** Ngữ pháp cơ bản và từ vựng thiết yếu\n`;
        analysis += `   📚 **Khóa học nên đăng ký:** Elementary (A1-A2), Basic English\n`;
        analysis += `   💪 **Mục tiêu:** Hướng tới Band 5.5, làm quen format IELTS và phương pháp học\n`;
        analysis += `   🎯 **Luyện tập:** 30p Reading/Listening cơ bản mỗi ngày, học 10-15 từ vựng thiết yếu/ngày\n`;
      }
      
      // Phân tích điểm yếu theo từng kỹ năng
      analysis += `\n🔍 **PHÂN TÍCH ĐIỂM YẾU VÀ ĐỀ XUẤT CỤ THỂ:**\n`;
      
      const readingTests = ieltsResults.filter(r => r.examType === 'reading');
      const listeningTests = ieltsResults.filter(r => r.examType === 'listening');
      const readingWithBand = readingTests.filter(r => r.score.bandScore);
      const listeningWithBand = listeningTests.filter(r => r.score.bandScore);
      
      if (readingWithBand.length > 0) {
        const readingAvgBand = (readingWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / readingWithBand.length).toFixed(1);
        analysis += `   📖 **Reading:** Trung bình Band ${readingAvgBand} - `;
        if (parseFloat(readingAvgBand) < avgBand - 1.0) {
          analysis += `⚠️ Điểm yếu! Nên đăng ký khóa Reading Comprehension và luyện đọc hiểu hằng ngày\n`;
        } else if (parseFloat(readingAvgBand) > avgBand + 1.0) {
          analysis += `💪 Điểm mạnh! Hãy duy trì và nâng cao với các bài đọc khó hơn\n`;
        } else {
          analysis += `✅ Cân bằng, tiếp tục luyện đều đặn\n`;
        }
      }
      
      if (listeningWithBand.length > 0) {
        const listeningAvgBand = (listeningWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / listeningWithBand.length).toFixed(1);
        analysis += `   🎧 **Listening:** Trung bình Band ${listeningAvgBand} - `;
        if (parseFloat(listeningAvgBand) < avgBand - 1.0) {
          analysis += `⚠️ Điểm yếu! Nên đăng ký khóa Listening Skills và nghe podcast tiếng Anh hằng ngày\n`;
        } else if (parseFloat(listeningAvgBand) > avgBand + 1.0) {
          analysis += `💪 Điểm mạnh! Thử thách với native speaker content và news\n`;
        } else {
          analysis += `✅ Cân bằng, tiếp tục luyện đều đặn\n`;
        }
      }
      analysis += `\n`;
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
  },

  // Build IELTS-based recommendations (không sử dụng Progress fake data)
  async buildIELTSBasedRecommendations(
    user: IUser, 
    ieltsResults: any[], 
    enrollments: any[],
    levelEnrollments: any[],
    availableCourses: any[] = []
  ): Promise<string> {
    const hasIELTSData = ieltsResults.length > 0;
    const hasEnrollments = enrollments.length > 0;
    const hasLevelEnrollments = levelEnrollments.length > 0;
    const latestIELTS = hasIELTSData ? ieltsResults[0] : null;

    let recommendations = `🎯 **LỘ TRÌNH HỌC TẬP CÁ NHÂN - ${user.fullName}**\n\n`;

    if (hasIELTSData) {
      // Tính band score trung bình từ tất cả các bài test
      const ieltsWithBandScore = ieltsResults.filter(r => r.score.bandScore);
      const totalBandScore = ieltsWithBandScore.reduce((sum, result) => {
        const band = parseFloat(result.score.bandScore) || 0;
        return sum + band;
      }, 0);
      const averageBandScore = ieltsWithBandScore.length > 0 ? 
        (totalBandScore / ieltsWithBandScore.length).toFixed(1) : '0.0';
      
      // Phân tích xu hướng
      let trendAnalysis = '';
      if (ieltsResults.length >= 2 && ieltsResults[0].score.bandScore && ieltsResults[1].score.bandScore) {
        const recent = ieltsResults.slice(0, 2);
        const older = ieltsResults.slice(-2);
        const recentWithBand = recent.filter(r => r.score.bandScore);
        const olderWithBand = older.filter(r => r.score.bandScore);
        
        if (recentWithBand.length > 0 && olderWithBand.length > 0) {
          const recentAvg = recentWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / recentWithBand.length;
          const olderAvg = olderWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / olderWithBand.length;
          
          if (recentAvg > olderAvg + 0.5) {
            trendAnalysis = '📈 **Xu hướng cải thiện rõ rệt!**';
          } else if (recentAvg < olderAvg - 0.5) {
            trendAnalysis = '📉 **Cần tập trung học tập hơn!**';
          } else {
            trendAnalysis = '➡️ **Xu hướng ổn định.**';
          }
        }
      }
      
      const avgBand = parseFloat(averageBandScore);
      
      recommendations += `📊 **ĐÁNH GIÁ HIỆN TẠI (Dựa trên ${ieltsResults.length} bài test IELTS):**\n`;
      recommendations += `   • **Band Score trung bình:** ${averageBandScore}\n`;
      recommendations += `   • **Band Score mới nhất:** ${latestIELTS.score.bandScore || 'N/A'}\n`;
      if (trendAnalysis) {
        recommendations += `   • ${trendAnalysis}\n`;
      }
      recommendations += `\n`;
      
      // Lộ trình cụ thể dựa trên band score trung bình
      if (avgBand >= 8.0) {
        recommendations += `🌟 **LỘ TRÌNH NÂNG CAO (Band ${averageBandScore}):**\n\n`;
        recommendations += `🎯 **Mục tiêu 3 tháng tới:** Band 8.5-9.0\n`;
        recommendations += `📚 **Khóa học ưu tiên:**\n`;
        recommendations += `   1. Advanced English (C1-C2)\n`;
        recommendations += `   2. IELTS Band 8.0+ Writing & Speaking\n`;
        recommendations += `   3. Academic Vocabulary & Complex Grammar\n\n`;
        recommendations += `📅 **Kế hoạch hàng tuần:**\n`;
        recommendations += `   • **Thứ 2-4-6:** 2-3 đề Reading/Listening nâng cao (90p)\n`;
        recommendations += `   • **Thứ 3-5-7:** Writing essays + Speaking practice (60p)\n`;
        recommendations += `   • **Chủ nhật:** Review và mock test (120p)\n\n`;
        recommendations += `📖 **Tài liệu học:**\n`;
        recommendations += `   • Cambridge IELTS 15-17 (advanced level)\n`;
        recommendations += `   • Academic journals và newspapers\n`;
        recommendations += `   • TED Talks với transcript\n`;
      } else if (avgBand >= 6.5) {
        recommendations += `📚 **LỘ TRÌNH PHÁT TRIỂN (Band ${averageBandScore}):**\n\n`;
        recommendations += `🎯 **Mục tiêu 3 tháng tới:** Band 7.5\n`;
        recommendations += `📚 **Khóa học ưu tiên:**\n`;
        recommendations += `   1. Intermediate-Upper (B2)\n`;
        recommendations += `   2. IELTS Band 6.5 Preparation\n`;
        recommendations += `   3. Grammar & Vocabulary Booster\n\n`;
        recommendations += `📅 **Kế hoạch hàng tuần:**\n`;
        recommendations += `   • **Hàng ngày:** 1-2 đề Reading/Listening (60p)\n`;
        recommendations += `   • **3x/tuần:** Writing task practice (45p)\n`;
        recommendations += `   • **2x/tuần:** Speaking với partner/app (30p)\n`;
        recommendations += `   • **Cuối tuần:** Full mock test (3h)\n\n`;
        recommendations += `📈 **Chỉ số theo dõi:**\n`;
        recommendations += `   • Học 20-30 từ vựng IELTS mỗi ngày\n`;
        recommendations += `   • Tăng tốc độ đọc lên 250 wpm\n`;
        recommendations += `   • Hoàn thành 2 bài test mỗi tuần\n`;
      } else if (avgBand >= 5.0) {
        recommendations += `⚡ **LỘ TRÌNH CỤG CỐ (Band ${averageBandScore}):**\n\n`;
        recommendations += `🎯 **Mục tiêu 3 tháng tới:** Band 6.5\n`;
        recommendations += `📚 **Khóa học ưu tiên:**\n`;
        recommendations += `   1. Pre-Intermediate (B1)\n`;
        recommendations += `   2. Grammar Fundamentals\n`;
        recommendations += `   3. Essential Vocabulary 3000 words\n\n`;
        recommendations += `📅 **Kế hoạch hàng tuần:**\n`;
        recommendations += `   • **Hàng ngày:** 1 đề Reading/Listening (45p)\n`;
        recommendations += `   • **Hàng ngày:** Học 15-20 từ vựng mới (20p)\n`;
        recommendations += `   • **3x/tuần:** Grammar exercises (30p)\n`;
        recommendations += `   • **2x/tuần:** Writing paragraphs (30p)\n\n`;
        recommendations += `🎯 **Kỹ thuật cải thiện:**\n`;
        recommendations += `   • Đọc từ từ, hiểu từng câu trước khi next\n`;
        recommendations += `   • Nghe với subtitle trước, sau đó tắt\n`;
        recommendations += `   • Focus vào câu trả lời đúng, phân tích sai lầm\n`;
      } else {
        recommendations += `🔥 **LỘ TRÌNH XÂY DỰNG NỀN TẢNG (Band ${averageBandScore}):**\n\n`;
        recommendations += `🎯 **Mục tiêu 3 tháng tới:** Band 5.5\n`;
        recommendations += `📚 **Khóa học ưu tiên:**\n`;
        recommendations += `   1. Elementary English (A2-B1)\n`;
        recommendations += `   2. Basic Grammar & Sentence Structure\n`;
        recommendations += `   3. High-frequency Vocabulary 1500 words\n\n`;
        recommendations += `📅 **Kế hoạch hàng tuần:**\n`;
        recommendations += `   • **Hàng ngày:** 30p Reading/Listening cơ bản\n`;
        recommendations += `   • **Hàng ngày:** Học 10-15 từ vựng thiết yếu (15p)\n`;
        recommendations += `   • **Hàng ngày:** Grammar drill (15p)\n`;
        recommendations += `   • **3x/tuần:** Simple writing practice (20p)\n\n`;
        recommendations += `📖 **Phương pháp học:**\n`;
        recommendations += `   • Bắt đầu với short articles, children books\n`;
        recommendations += `   • Nghe slow English, ESL podcasts\n`;
        recommendations += `   • Học theo chủ đề: family, food, travel...\n`;
      }

      // Phân tích điểm yếu theo kỹ năng
      recommendations += `\n🔍 **PHÂN TÍCH KỸ NĂNG & ĐỀ XUẤT:**\n`;
      
      const readingTests = ieltsResults.filter(r => r.examType === 'reading');
      const listeningTests = ieltsResults.filter(r => r.examType === 'listening');
      const readingWithBand = readingTests.filter(r => r.score.bandScore);
      const listeningWithBand = listeningTests.filter(r => r.score.bandScore);
      
      if (readingWithBand.length > 0) {
        const readingAvgBand = (readingWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / readingWithBand.length).toFixed(1);
        recommendations += `   📖 **Reading (Band ${readingAvgBand}):**`;
        if (parseFloat(readingAvgBand) < avgBand - 1.0) {
          recommendations += ` ⚠️ **Điểm yếu!**\n`;
          recommendations += `      → Đăng ký khóa "Reading Comprehension"\n`;
          recommendations += `      → Đọc 2 bài short articles mỗi ngày\n`;
          recommendations += `      → Practice skimming & scanning techniques\n`;
        } else if (parseFloat(readingAvgBand) > avgBand + 1.0) {
          recommendations += ` 💪 **Điểm mạnh!**\n`;
          recommendations += `      → Thử thách với advanced texts\n`;
          recommendations += `      → Focus vào academic vocabulary\n`;
        } else {
          recommendations += ` ✅ **Cân bằng**\n`;
          recommendations += `      → Duy trì 1 đề Reading/ngày\n`;
        }
      }
      
      if (listeningWithBand.length > 0) {
        const listeningAvgBand = (listeningWithBand.reduce((sum, r) => sum + r.score.bandScore, 0) / listeningWithBand.length).toFixed(1);
        recommendations += `   🎧 **Listening (Band ${listeningAvgBand}):**`;
        if (parseFloat(listeningAvgBand) < avgBand - 1.0) {
          recommendations += ` ⚠️ **Điểm yếu!**\n`;
          recommendations += `      → Đăng ký khóa "Listening Skills"\n`;
          recommendations += `      → Nghe English podcasts 30p/ngày\n`;
          recommendations += `      → Practice dictation exercises\n`;
        } else if (parseFloat(listeningAvgBand) > avgBand + 1.0) {
          recommendations += ` 💪 **Điểm mạnh!**\n`;
          recommendations += `      → Nghe native content: news, movies\n`;
          recommendations += `      → Focus vào accents: British, American\n`;
        } else {
          recommendations += ` ✅ **Cân bằng**\n`;
          recommendations += `      → Duy trì 1 đề Listening/ngày\n`;
        }
      }
      recommendations += `\n`;
    }

    // Thông tin khóa học
    if (hasEnrollments) {
      recommendations += `📚 **KHÓA HỌC ĐÃ ĐĂNG KÝ (${enrollments.length} khóa):**\n`;
      enrollments.slice(0, 3).forEach((enrollment, index) => {
        const course = enrollment.courseId;
        const completion = enrollment.progress?.completionPercentage || 0;
        
        recommendations += `   ${index + 1}. **${course.title}** - ${completion}% hoàn thành\n`;
        if (completion < 50) {
          recommendations += `      ⚠️ **Ưu tiên:** Hoàn thành khóa này trước khi đăng ký mới\n`;
        } else if (completion >= 80) {
          recommendations += `      ✅ **Gần hoàn thành:** Sẵn sàng cho level cao hơn\n`;
        }
      });
      recommendations += `\n`;
    } else {
      recommendations += `📖 **KHÓA HỌC ĐỀ XUẤT (Chưa đăng ký khóa nào):**\n`;
      if (availableCourses.length > 0) {
        availableCourses.slice(0, 3).forEach((course, index) => {
          recommendations += `   ${index + 1}. **${course.title}**\n`;
          recommendations += `      🎓 Level: ${course.level || 'B1'}\n`;
          recommendations += `      💰 Giá: ${course.price ? course.price.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}\n`;
        });
      } else {
        recommendations += `   • Khóa Grammar & Vocabulary Fundamentals\n`;
        recommendations += `   • Khóa IELTS Preparation\n`;
        recommendations += `   • Khóa English Communication\n`;
      }
      recommendations += `\n`;
    }

    // Lời khuyên cuối
    recommendations += `💪 **LỜI KHUYÊN CUỐI:**\n`;
    recommendations += `   • **Consistency is key:** Học đều đặn tốt hơn học dồn\n`;
    recommendations += `   • **Track progress:** Làm test định kỳ để theo dõi tiến bộ\n`;
    recommendations += `   • **Practice all skills:** Đừng chỉ focus 1 kỹ năng\n`;
    recommendations += `   • **Stay motivated:** Đặt mục tiêu nhỏ và celebrate thành công!\n\n`;
    
    recommendations += `✨ **Lộ trình được xây dựng dựa trên dữ liệu IELTS thực tế của bạn!**`;

    return recommendations;
  }
};

export default realDataChatbotController;
