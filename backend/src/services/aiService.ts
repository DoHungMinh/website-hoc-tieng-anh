import OpenAI from 'openai';
import { IUser } from '../models/User';
import { IProgress } from '../models/Progress';
import { IAssessment } from '../models/Assessment';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // System prompt for English learning assistant
  private getSystemPrompt(): string {
    return `Bạn là AI Assistant chuyên về học tiếng Anh của EnglishPro. Nhiệm vụ của bạn:

1. PHÂN TÍCH DỮ LIỆU HỌC TẬP:
   - Đánh giá tiến độ học tập dựa trên dữ liệu cụ thể
   - Nhận diện điểm mạnh và điểm yếu
   - So sánh với mục tiêu học tập

2. ĐÁNH GIÁ SAU BÀI HỌC/THI:
   - Phân tích kết quả chi tiết
   - Đưa ra feedback cụ thể và xây dựng
   - Gợi ý cải thiện

3. LỜI KHUYÊN LỘ TRÌNH:
   - Đề xuất bài học tiếp theo phù hợp
   - Tối ưu hóa thời gian học tập
   - Điều chỉnh độ khó dựa trên performance

4. ĐỘNG VIÊN VÀ HỖ TRỢ:
   - Khuyến khích và tạo động lực
   - Trả lời câu hỏi về tiếng Anh
   - Hướng dẫn phương pháp học hiệu quả

PHONG CÁCH GIAO TIẾP:
- Thân thiện, tích cực và khuyến khích
- Sử dụng tiếng Việt chính, tiếng Anh khi cần thiết
- Cụ thể, có dẫn chứng từ dữ liệu thực tế
- Không quá dài, dễ hiểu

LUÔN ƯU TIÊN:
- Cá nhân hóa dựa trên level và mục tiêu
- Dựa trên dữ liệu thực tế, không đoán mò
- Đưa ra lời khuyên actionable`;
  }

  // Analyze user learning data
  async analyzeUserProgress(learningData: {
    user: IUser;
    progress: IProgress;
    recentAssessments: IAssessment[];
    stats: any;
  }): Promise<string> {
    const { user, progress, recentAssessments } = learningData;
    const context = this.buildProgressContext(user, progress, recentAssessments);
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { 
        role: 'user', 
        content: `Hãy phân tích tiến độ học tập của tôi và đưa ra đánh giá tổng quan:\n\n${context}` 
      }
    ];

    return this.generateResponse(messages);
  }

  // Post-assessment feedback
  async generateAssessmentFeedback(assessmentData: {
    user: IUser;
    assessment: IAssessment;
    progress: IProgress;
    comparison: any;
  }): Promise<string> {
    const { user, assessment, progress } = assessmentData;
    const context = this.buildAssessmentContext(user, assessment, progress);
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { 
        role: 'user', 
        content: `Tôi vừa hoàn thành một bài kiểm tra. Hãy đánh giá kết quả và đưa ra feedback:\n\n${context}` 
      }
    ];

    return this.generateResponse(messages);
  }

  // Learning path recommendations
  async generateLearningRecommendations(recommendationData: {
    user: IUser;
    progress: IProgress;
    learningPath: any;
    nextActivities: any[];
  }): Promise<string> {
    const { user, progress } = recommendationData;
    const userGoals = user.learningGoals || [];
    const context = this.buildRecommendationContext(user, progress, userGoals);
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { 
        role: 'user', 
        content: `Dựa trên tiến độ hiện tại, hãy đề xuất lộ trình học tập phù hợp cho tôi:\n\n${context}` 
      }
    ];

    return this.generateResponse(messages);
  }

  // General chat response
  async generateChatResponse(
    userMessage: string,
    learningData: {
      user: IUser;
      progress: IProgress;
      recentAssessments: IAssessment[];
      stats: any;
    },
    conversationHistory: { role: string; content: string }[]
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() }
    ];

    // Add user context
    const userContext = {
      level: learningData.user.level,
      goals: learningData.user.learningGoals || [],
      recentActivity: 'learning'
    };

    if (userContext) {
      messages.push({
        role: 'system',
        content: `Thông tin học viên: Level ${userContext.level}, Mục tiêu: ${userContext.goals.join(', ')}${
          userContext.recentActivity ? `, Hoạt động gần đây: ${userContext.recentActivity}` : ''
        }`
      });
    }

    // Add conversation history (limit to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return this.generateResponse(messages);
  }

  // Generate response using OpenAI
  private async generateResponse(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || 'Xin lỗi, tôi không thể tạo phản hồi lúc này.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Không thể kết nối đến AI service');
    }
  }

  // Build progress analysis context
  private buildProgressContext(
    user: IUser,
    progress: IProgress,
    assessments: IAssessment[]
  ): string {
    const recentTests = assessments.slice(-3);
    
    return `
**THÔNG TIN HỌC VIÊN:**
- Tên: ${user.fullName}
- Level hiện tại: ${user.level}
- Mục tiêu học tập: ${user.learningGoals.join(', ') || 'Chưa đặt mục tiêu'}
- Tổng giờ học: ${user.totalStudyHours} giờ
- Streak hiện tại: ${user.streakCount} ngày

**TIẾN ĐỘ HỌC TẬP:**
- Từ vựng đã học: ${progress.vocabulary.learned}/${progress.vocabulary.target}
- Giờ nghe: ${progress.listening.hoursCompleted}/${progress.listening.target}
- Bài kiểm tra hoàn thành: ${progress.testsCompleted.completed}/${progress.testsCompleted.target}
- Streak học tập: ${progress.studyStreak.current}/${progress.studyStreak.target} ngày

**KẾT QUẢ KIỂM TRA GẦN ĐÂY:**
${recentTests.map(test => `
- ${test.type}: ${test.results?.percentage}% (${test.results?.totalScore}/${test.results?.maxScore})
  Điểm mạnh: ${test.results?.strengths.join(', ') || 'Chưa xác định'}
  Điểm yếu: ${test.results?.weaknesses.join(', ') || 'Chưa xác định'}
`).join('\n')}

**ACHIEVEMENT:**
${progress.achievements.slice(-3).map(ach => `- ${ach.title}: ${ach.description}`).join('\n')}
`;
  }

  // Build assessment feedback context
  private buildAssessmentContext(
    user: IUser,
    assessment: IAssessment,
    progress: IProgress
  ): string {
    return `
**THÔNG TIN BÀI KIỂM TRA:**
- Loại: ${assessment.type}
- Trạng thái: ${assessment.status}
- Thời gian làm bài: ${assessment.timeLimit} phút

**KẾT QUẢ CHI TIẾT:**
${assessment.results ? `
- Điểm tổng: ${assessment.results.totalScore}/${assessment.results.maxScore} (${assessment.results.percentage}%)
- Level đánh giá: ${assessment.results.level}

**PHÂN TÍCH KỸ NĂNG:**
- Grammar: ${assessment.results.skillBreakdown.grammar.percentage}%
- Vocabulary: ${assessment.results.skillBreakdown.vocabulary.percentage}%
- Reading: ${assessment.results.skillBreakdown.reading.percentage}%
- Listening: ${assessment.results.skillBreakdown.listening.percentage}%

**ĐIỂM MẠNH:**
${assessment.results.strengths.map(s => `- ${s}`).join('\n')}

**ĐIỂM YẾU:**
${assessment.results.weaknesses.map(w => `- ${w}`).join('\n')}
` : 'Chưa có kết quả'}

**BỐI CẢNH HỌC VIÊN:**
- Level hiện tại: ${user.level}
- Mục tiêu: ${user.learningGoals.join(', ')}
- Tổng bài kiểm tra đã làm: ${progress.testsCompleted.completed}
`;
  }

  // Build recommendation context
  private buildRecommendationContext(
    user: IUser,
    progress: IProgress,
    goals: string[]
  ): string {
    return `
**PROFILE HỌC VIÊN:**
- Level: ${user.level}
- Tổng giờ học: ${user.totalStudyHours}
- Streak: ${user.streakCount} ngày

**MỤC TIÊU:**
${goals.map(goal => `- ${goal}`).join('\n')}

**TIẾN ĐỘ HIỆN TẠI:**
- Từ vựng: ${progress.vocabulary.learned}/${progress.vocabulary.target} (${Math.round(progress.vocabulary.learned/progress.vocabulary.target*100)}%)
- Listening: ${progress.listening.hoursCompleted}/${progress.listening.target} giờ (${Math.round(progress.listening.hoursCompleted/progress.listening.target*100)}%)
- Tests: ${progress.testsCompleted.completed}/${progress.testsCompleted.target} (${Math.round(progress.testsCompleted.completed/progress.testsCompleted.target*100)}%)

**HOẠT ĐỘNG GẦN ĐÂY:**
- Từ vựng học gần đây: ${progress.vocabulary.recentWords.slice(-5).map(w => w.word).join(', ')}
- Bài kiểm tra gần đây: ${progress.testsCompleted.recentTests.slice(-3).map(t => `${t.testName} (${t.percentage}%)`).join(', ')}

**THÀNH TỰU:**
${progress.achievements.slice(-3).map(ach => `- ${ach.title} (${ach.category})`).join('\n')}
`;
  }
}
