// IELTS Scoring System - Academic Reading & Listening
// Based on official IELTS band score conversion tables

export interface IELTSResult {
  totalQuestions: number;
  correctAnswers: number;
  bandScore: number;
  percentage: number;
  description: string;
}

// IELTS Listening Band Score Conversion (40 questions)
const listeningBandScores: { [key: number]: number } = {
  40: 9.0, 39: 9.0,
  38: 8.5, 37: 8.5,
  36: 8.0, 35: 8.0,
  34: 7.5, 33: 7.5, 32: 7.5,
  31: 7.0, 30: 7.0,
  29: 6.5, 28: 6.5, 27: 6.5, 26: 6.5,
  25: 6.0, 24: 6.0, 23: 6.0,
  22: 5.5, 21: 5.5, 20: 5.5, 19: 5.5, 18: 5.5,
  17: 5.0, 16: 5.0,
  15: 4.5, 14: 4.5, 13: 4.5,
  12: 4.0, 11: 4.0, 10: 4.0,
  9: 3.5, 8: 3.5, 7: 3.5,
  6: 3.0, 5: 3.0, 4: 3.0,
  3: 2.5, 2: 2.5, 1: 2.5,
  0: 0.0
};

// IELTS Academic Reading Band Score Conversion (40 questions)
const academicReadingBandScores: { [key: number]: number } = {
  40: 9.0, 39: 9.0,
  38: 8.5, 37: 8.5,
  36: 8.0, 35: 8.0,
  34: 7.5, 33: 7.5,
  32: 7.0, 31: 7.0, 30: 7.0,
  29: 6.5, 28: 6.5, 27: 6.5,
  26: 6.0, 25: 6.0, 24: 6.0, 23: 6.0,
  22: 5.5, 21: 5.5, 20: 5.5, 19: 5.5,
  18: 5.0, 17: 5.0, 16: 5.0, 15: 5.0,
  14: 4.5, 13: 4.5,
  12: 4.0, 11: 4.0, 10: 4.0,
  9: 3.5, 8: 3.5,
  7: 3.0,
  6: 2.5,
  5: 2.0,
  4: 1.5, 3: 1.5, 2: 1.5, 1: 1.0,
  0: 0.0
};

// Band score descriptions for Reading and Listening skills
const bandDescriptions: { [key: number]: string } = {
  9.0: "Expert user - Hiểu hoàn toàn các văn bản phức tạp và âm thanh tự nhiên",
  8.5: "Very good user - Hiểu rất tốt với khả năng nắm bắt chi tiết và ngữ cảnh",
  8.0: "Very good user - Hiểu rất tốt với khả năng nắm bắt chi tiết và ngữ cảnh", 
  7.5: "Good user - Hiểu tốt các ý chính và chi tiết quan trọng",
  7.0: "Good user - Hiểu tốt các ý chính và chi tiết quan trọng",
  6.5: "Competent user - Hiểu được nội dung chính với một số khó khăn nhỏ",
  6.0: "Competent user - Hiểu được nội dung chính với một số khó khăn nhỏ",
  5.5: "Modest user - Hiểu được ý chính trong các tình huống quen thuộc",
  5.0: "Modest user - Hiểu được ý chính trong các tình huống quen thuộc",
  4.5: "Limited user - Hiểu cơ bản các thông tin đơn giản và rõ ràng",
  4.0: "Limited user - Hiểu cơ bản các thông tin đơn giản và rõ ràng",
  3.5: "Extremely limited user - Hiểu một số từ và cụm từ cơ bản",
  3.0: "Extremely limited user - Hiểu một số từ và cụm từ cơ bản",
  2.5: "Intermittent user - Khó khăn trong việc hiểu nội dung cơ bản",
  2.0: "Intermittent user - Khó khăn trong việc hiểu nội dung cơ bản",
  1.0: "Non-user - Không thể hiểu được nội dung",
  0.0: "Không làm bài thi"
};

/**
 * Calculate IELTS Listening band score
 */
export function calculateListeningScore(correctAnswers: number): IELTSResult {
  const totalQuestions = 40;
  const clampedCorrect = Math.max(0, Math.min(correctAnswers, totalQuestions));
  const bandScore = listeningBandScores[clampedCorrect] || 0.0;
  const percentage = Math.round((clampedCorrect / totalQuestions) * 100);
  
  return {
    totalQuestions,
    correctAnswers: clampedCorrect,
    bandScore,
    percentage,
    description: bandDescriptions[bandScore] || "Invalid score"
  };
}

/**
 * Calculate IELTS Academic Reading band score
 */
export function calculateAcademicReadingScore(correctAnswers: number): IELTSResult {
  const totalQuestions = 40;
  const clampedCorrect = Math.max(0, Math.min(correctAnswers, totalQuestions));
  const bandScore = academicReadingBandScores[clampedCorrect] || 0.0;
  const percentage = Math.round((clampedCorrect / totalQuestions) * 100);
  
  return {
    totalQuestions,
    correctAnswers: clampedCorrect,
    bandScore,
    percentage,
    description: bandDescriptions[bandScore] || "Invalid score"
  };
}

/**
 * Calculate IELTS band score based on test type
 */
export function calculateIELTSScore(testType: 'listening' | 'reading', correctAnswers: number): IELTSResult {
  switch (testType) {
    case 'listening':
      return calculateListeningScore(correctAnswers);
    case 'reading':
      return calculateAcademicReadingScore(correctAnswers);
    default:
      throw new Error(`Unsupported test type: ${testType}`);
  }
}

/**
 * Get band score color for UI display
 */
export function getBandScoreColor(bandScore: number): string {
  if (bandScore >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
  if (bandScore >= 7.5) return 'text-lime-600 bg-lime-50 border-lime-200';
  if (bandScore >= 6.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (bandScore >= 5.5) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

/**
 * Get band score background color for circular display
 */
export function getBandScoreBackground(bandScore: number): string {
  if (bandScore >= 8.5) return 'bg-green-600';
  if (bandScore >= 7.5) return 'bg-lime-600';
  if (bandScore >= 6.5) return 'bg-yellow-600';
  if (bandScore >= 5.5) return 'bg-orange-600';
  return 'bg-red-600';
}

/**
 * Simple score calculation for tests without correct answers
 * This maintains compatibility with existing tests
 */
export function calculateSimpleScore(answeredQuestions: number, totalQuestions: number): {
  percentage: number;
  description: string;
} {
  const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
  let description = '';
  
  if (percentage >= 90) description = 'Xuất sắc';
  else if (percentage >= 80) description = 'Tốt';
  else if (percentage >= 70) description = 'Khá';
  else if (percentage >= 60) description = 'Trung bình';
  else description = 'Cần cố gắng thêm';
  
  return { percentage, description };
}
