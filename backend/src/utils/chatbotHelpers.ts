// Shared utilities for chatbot controllers
export class ChatbotHelpers {
  
  // Common response patterns
  static generateWelcomeMessage(userName?: string, isAuthenticated: boolean = false): string {
    if (isAuthenticated && userName) {
      return `Xin chào ${userName}! Tôi là AI Assistant của EnglishPro. 
      
🎯 **Tôi có thể phân tích dữ liệu thực tế của bạn:**
• Kết quả IELTS tests đã làm
• Tiến độ học tập chi tiết  
• Khóa học đã đăng ký
• Gợi ý cá nhân hóa

💬 **Hãy hỏi tôi:**
• "trình độ của tôi ở đâu"
• "phân tích kết quả IELTS"
• "gợi ý học tiếng Anh"`;
    }

    return `Xin chào! Tôi là AI Assistant của EnglishPro. 

Hiện tại bạn đang ở **chế độ khách** - tôi có thể trả lời câu hỏi chung và đưa ra gợi ý cơ bản.

🔓 **Để nhận phân tích cá nhân dựa trên dữ liệu học tập thực tế:**
• **Đăng nhập** tài khoản
• **Hoàn thành ít nhất 1 bài test** IELTS
• Tôi sẽ phân tích và đưa ra gợi ý chính xác! 

💬 **Bạn có thể hỏi tôi:**
• "trình độ của tôi ở đâu"
• "gợi ý học tiếng Anh"  
• "kết quả IELTS của tôi"

🚀 **Đăng nhập ngay để trải nghiệm đầy đủ!**`;
  }

  // Check message intent
  static analyzeMessageIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('trình độ') || lowerMessage.includes('level') || lowerMessage.includes('ở đâu') || lowerMessage.includes('bậc nào')) {
      return 'level_analysis';
    } else if (lowerMessage.includes('tiến độ') || lowerMessage.includes('progress') || lowerMessage.includes('học được gì')) {
      return 'progress_analysis';
    } else if (lowerMessage.includes('kết quả') || lowerMessage.includes('điểm') || lowerMessage.includes('test') || lowerMessage.includes('ielts')) {
      return 'test_results';
    } else if (lowerMessage.includes('học') || lowerMessage.includes('khóa học') || lowerMessage.includes('course')) {
      return 'course_recommendations';
    } else if (lowerMessage.includes('gợi ý') || lowerMessage.includes('nên học') || lowerMessage.includes('đề xuất')) {
      return 'learning_recommendations';
    } else if (lowerMessage.includes('yếu') || lowerMessage.includes('cải thiện') || lowerMessage.includes('reading') || lowerMessage.includes('listening')) {
      return 'weakness_analysis';
    }
    
    return 'general';
  }

  // Calculate IELTS statistics
  static calculateIELTSStats(ieltsResults: any[]) {
    if (!ieltsResults || ieltsResults.length === 0) {
      return { hasData: false };
    }

    const readingTests = ieltsResults.filter((r: any) => r.examType === 'reading');
    const listeningTests = ieltsResults.filter((r: any) => r.examType === 'listening');
    
    const readingAvg = readingTests.length > 0 ? 
      readingTests.reduce((sum: number, test: any) => sum + (test.score.bandScore || 0), 0) / readingTests.length : 0;
    const listeningAvg = listeningTests.length > 0 ? 
      listeningTests.reduce((sum: number, test: any) => sum + (test.score.bandScore || 0), 0) / listeningTests.length : 0;

    const latestResult = ieltsResults[0];
    const averageScore = ieltsResults.reduce((sum: number, result: any) => sum + (result.score.bandScore || 0), 0) / ieltsResults.length;

    const trend = ieltsResults.length >= 2 ? 
      ((latestResult.score.bandScore || 0) > (ieltsResults[1].score.bandScore || 0) ? '📈 Đang cải thiện' : 
       (latestResult.score.bandScore || 0) < (ieltsResults[1].score.bandScore || 0) ? '📉 Cần ôn tập thêm' : '➡️ Ổn định') : '📊 Cần thêm data';

    return {
      hasData: true,
      latestResult,
      readingTests,
      listeningTests,
      readingAvg,
      listeningAvg,
      averageScore,
      trend,
      totalTests: ieltsResults.length
    };
  }

  // Get performance feedback based on IELTS Band Score
  static getPerformanceFeedback(bandScore: number): string {
    if (bandScore >= 8.0) return '🎉 Xuất sắc! Kết quả rất ấn tượng!';
    if (bandScore >= 7.0) return '👍 Tốt! Bạn đang trên đúng hướng!';
    if (bandScore >= 6.0) return '💪 Khá! Cần cải thiện thêm một chút!';
    return '🎯 Cần luyện tập nhiều hơn để đạt mục tiêu!';
  }

  // Get skill level description
  static getSkillLevel(result: any, skill: string): string {
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
  }

  // Generate level description based on band score
  static getLevelDescription(bandScore?: number, userLevel?: string): string {
    if (bandScore) {
      if (bandScore >= 7.0) return 'Bạn có trình độ **Good** (C1) - có thể sử dụng tiếng Anh hiệu quả cho học tập và công việc!';
      if (bandScore >= 6.0) return 'Bạn đang ở trình độ **Competent** (B2) - có thể giao tiếp tự tin trong hầu hết tình huống!';
      if (bandScore >= 5.0) return 'Bạn đang ở trình độ **Modest** (B1) - có thể xử lý được các tình huống cơ bản!';
      if (bandScore >= 4.0) return 'Bạn đang ở trình độ **Limited** (A2) - có hiểu biết cơ bản về tiếng Anh!';
      return 'Bạn đang ở trình độ **Beginner** (A1) - cần học từ những kiến thức cơ bản!';
    }

    // Fallback to user level
    switch (userLevel) {
      case 'C2': return 'Bạn có trình độ **Proficiency** - gần như native speaker!';
      case 'C1': return 'Bạn có trình độ **Advanced** - sử dụng tiếng Anh rất tự tin!';
      case 'B2': return 'Bạn đang ở trình độ **Upper-Intermediate** - giao tiếp tốt!';
      case 'B1': return 'Bạn đang ở trình độ **Intermediate** - có thể giao tiếp cơ bản!';
      case 'A2': return 'Bạn đang ở trình độ **Elementary** - đã có nền tảng cơ bản!';
      case 'A1': return 'Bạn đang ở trình độ **Beginner** - bắt đầu hành trình học tiếng Anh!';
      default: return 'Chưa xác định được trình độ chính xác. Hãy làm bài test để đánh giá!';
    }
  }

  // Format date for Vietnamese locale
  static formatVietnameseDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  // Generate study recommendations based on weak areas
  static generateStudyPlan(weakAreas: string[], level: string): string {
    let plan = '📚 **Kế hoạch học tuần này:**\n';
    
    if (weakAreas.includes('Reading') || weakAreas.includes('Từ vựng')) {
      plan += '• Thứ 2,4,6: Đọc hiểu + từ vựng (30 phút)\n';
    }
    if (weakAreas.includes('Listening') || weakAreas.includes('Nghe')) {
      plan += '• Thứ 3,5: Luyện nghe chuyên sâu (30 phút)\n';
    }
    if (weakAreas.includes('Grammar') || level === 'A1' || level === 'A2') {
      plan += '• Mỗi ngày: Ôn ngữ pháp cơ bản (15 phút)\n';
    }
    
    plan += '• Thứ 7: Làm bài test tổng hợp (45 phút)\n';
    plan += '• Chủ nhật: Ôn tập và thư giãn';
    
    return plan;
  }
}
