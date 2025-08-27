import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Progress, IProgress } from '../models/Progress';
import { Assessment, IAssessment } from '../models/Assessment';
// import { ICourse } from '../models/Course'; // Optional - không cần thiết cho chatbot cơ bản

export const realDataChatbotController = {
  // Chat với dữ liệu thật từ MongoDB
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;
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

      // Phân tích câu hỏi và trả lời dựa trên dữ liệu thật
      let response = '';
      
      // Kiểm tra từ khóa trong câu hỏi
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('tiến độ') || lowerMessage.includes('progress')) {
        response = await this.generateProgressBasedResponse(user);
      } else if (lowerMessage.includes('kết quả') || lowerMessage.includes('điểm') || lowerMessage.includes('test')) {
        response = await this.generateTestBasedResponse(user);
      } else if (lowerMessage.includes('học') || lowerMessage.includes('khóa học') || lowerMessage.includes('course')) {
        response = await this.generateCourseBasedResponse(user);
      } else if (lowerMessage.includes('gợi ý') || lowerMessage.includes('nên học')) {
        response = await this.generatePersonalizedRecommendations(user);
      } else {
        // Response chung dựa trên level của user
        response = `Chào ${user.fullName}! 👋 
        
Tôi thấy bạn đang ở level ${user.level}. Về câu hỏi "${message}", tôi có thể giúp bạn:

📊 **Phân tích tiến độ học tập** dựa trên dữ liệu thực tế
🎯 **Đánh giá kết quả bài test** và đưa ra feedback chi tiết  
📚 **Gợi ý lộ trình học** phù hợp với level hiện tại
🎓 **Theo dõi khóa học** đã tham gia

Bạn muốn tôi phân tích điều gì cụ thể? Hãy hỏi về "tiến độ học tập", "kết quả bài test", hoặc "gợi ý học tập" nhé!`;
      }

      return res.json({
        success: true,
        response,
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

  // Phân tích tiến độ với dữ liệu thật
  async generateProgressAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

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

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy thông tin người dùng' 
        });
      }

      // Kiểm tra xem user có dữ liệu học tập không
      if (!progress && assessments.length === 0) {
        return res.json({
          success: true,
          analysis: `📊 **CHƯA CÓ DỮ LIỆU HỌC TẬP**

Xin chào ${user.fullName}! 👋

Tôi thấy bạn chưa có dữ liệu học tập để phân tích. Để AI Assistant có thể đưa ra phân tích chính xác, bạn cần:

🎯 **Làm ít nhất 1 bài test/đánh giá**
📚 **Tham gia ít nhất 1 khóa học** 
📈 **Hoàn thành một số bài học**

Sau khi có dữ liệu học tập, tôi sẽ có thể:
✅ Phân tích điểm mạnh/yếu cụ thể
✅ Đưa ra gợi ý cải thiện  
✅ Theo dõi tiến độ qua thời gian
✅ Đề xuất lộ trình học phù hợp

Hãy bắt đầu với một bài test đánh giá trình độ nhé! 🚀`,
          hasData: false,
          type: 'no_data'
        });
      }

      // Tạo phân tích dựa trên dữ liệu thật
      const analysis = await this.buildRealProgressAnalysis(user, progress, assessments);

      return res.json({
        success: true,
        analysis,
        hasData: true,
        type: 'real_progress_analysis'
      });

    } catch (error) {
      console.error('Error in generateProgressAnalysis:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi phân tích tiến độ' 
      });
    }
  },

  // Gợi ý học tập với dữ liệu thật
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

      // Tạo gợi ý dựa trên dữ liệu thật
      const recommendations = await this.buildPersonalizedRecommendations(user, progress, recentAssessments);

      return res.json({
        success: true,
        recommendations,
        hasData: true,
        type: 'personalized_recommendations'
      });

    } catch (error) {
      console.error('Error in generateLearningRecommendations:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi khi tạo gợi ý học tập' 
      });
    }
  },

  // Helper method: Tạo response dựa trên tiến độ
  async generateProgressBasedResponse(user: IUser): Promise<string> {
    const progress = await Progress.findOne({ userId: user._id });
    
    if (!progress) {
      return `${user.fullName}, tôi thấy bạn chưa có dữ liệu tiến độ học tập. Hãy bắt đầu với một khóa học hoặc bài test để tôi có thể theo dõi và phân tích tiến độ của bạn nhé! 📊`;
    }

    return `📈 **TIẾN ĐỘ CỦA ${user.fullName.toUpperCase()}**

🎯 Level hiện tại: ${user.level}
📚 Từ vựng đã học: ${progress.vocabulary.learned}/${progress.vocabulary.target}
🎧 Thời gian nghe: ${progress.listening.hoursCompleted}h/${progress.listening.target}h  
📝 Bài test hoàn thành: ${progress.testsCompleted.completed}/${progress.testsCompleted.target}
🔥 Streak hiện tại: ${progress.studyStreak.current} ngày
⏱️ Tổng thời gian học: ${progress.totalStudyTime} giờ

${progress.studyStreak.current >= 7 ? '🎉 Tuyệt vời! Bạn đã duy trì học tập ổn định!' : '💪 Hãy cố gắng học đều đặn để tăng streak nhé!'}`;
  },

  // Helper method: Tạo response dựa trên kết quả test
  async generateTestBasedResponse(user: IUser): Promise<string> {
    const recentTests = await Assessment.find({ 
      userId: user._id, 
      status: 'completed' 
    }).sort({ completedAt: -1 }).limit(3);

    if (recentTests.length === 0) {
      return `${user.fullName}, tôi thấy bạn chưa hoàn thành bài test nào. Hãy thử làm một bài test đánh giá để tôi có thể phân tích kết quả và đưa ra feedback chi tiết nhé! 🎯`;
    }

    const latestTest = recentTests[0];
    const score = latestTest.results?.percentage || 0;

    return `📊 **KẾT QUẢ BÀI TEST GẦN NHẤT**

🎯 Điểm số: ${score}%
📅 Ngày làm: ${latestTest.completedAt?.toLocaleDateString('vi-VN')}
📝 Loại test: ${latestTest.type}

${score >= 80 ? '🎉 Excellent! Kết quả rất tốt!' : 
  score >= 60 ? '👍 Good! Bạn đang tiến bộ!' : 
  '💪 Keep trying! Hãy luyện tập thêm nhé!'}

📈 So với ${recentTests.length > 1 ? `bài trước: ${score > (recentTests[1].results?.percentage || 0) ? '📈 Cải thiện' : '📉 Cần cố gắng thêm'}` : 'lần đầu làm test'}`;
  },

  // Helper method: Tạo response dựa trên khóa học
  async generateCourseBasedResponse(user: IUser): Promise<string> {
    // Note: Assuming you have course enrollment data
    return `📚 **THÔNG TIN KHÓA HỌC**

Xin chào ${user.fullName}! 

Dựa trên level ${user.level} của bạn, tôi gợi ý:

🎯 **Mục tiêu học tập:** ${user.learningGoals.join(', ') || 'Chưa thiết lập'}

📖 **Khóa học phù hợp:**
- Grammar for ${user.level} level
- Vocabulary Builder ${user.level}
- Listening Skills ${user.level}

Bạn có muốn tôi gợi ý lộ trình học cụ thể không? 🚀`;
  },

  // Helper method: Tạo gợi ý cá nhân hóa
  async generatePersonalizedRecommendations(user: IUser): Promise<string> {
    const progress = await Progress.findOne({ userId: user._id });
    
    if (!progress) {
      return `🎯 **GỢI Ý CHO ${user.fullName}**

Level ${user.level} - Bước đầu:
1. 📝 Làm placement test để đánh giá chính xác
2. 📚 Bắt đầu với khóa học cơ bản
3. 🎧 Luyện nghe 15 phút/ngày
4. 📖 Học 10 từ vựng mới mỗi ngày

Mục tiêu: ${user.learningGoals.join(', ') || 'Thiết lập mục tiêu học tập'}`;
    }

    return `🎯 **GỢI Ý CÁ NHÂN CHO ${user.fullName}**

Dựa trên phân tích dữ liệu của bạn:

📈 **Ưu tiên cải thiện:**
${progress.vocabulary.learned < progress.vocabulary.target * 0.5 ? '• 📚 Từ vựng (hiện tại chỉ ' + Math.round((progress.vocabulary.learned/progress.vocabulary.target)*100) + '%)' : ''}
${progress.listening.hoursCompleted < progress.listening.target * 0.5 ? '• 🎧 Kỹ năng nghe' : ''}
${progress.testsCompleted.completed < progress.testsCompleted.target * 0.5 ? '• 📝 Làm thêm bài test' : ''}

🎯 **Lộ trình tuần tới:**
- Thứ 2,4,6: Học từ vựng (20 phút)
- Thứ 3,5,7: Luyện nghe (25 phút)  
- Chủ nhật: Làm 1 bài test tổng hợp

Streak hiện tại: ${progress.studyStreak.current} ngày 🔥`;
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
  }
};
