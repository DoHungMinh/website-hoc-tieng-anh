/**
 * Utility functions to calculate user level based on IELTS band score
 */

export type UserLevel = 'Beginner' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Convert IELTS band score to CEFR level
 * Based on IELTS-CEFR mapping guidelines
 */
export function bandScoreToLevel(bandScore: number): UserLevel {
  if (bandScore >= 8.0) {
    return 'C2'; // Proficient User
  } else if (bandScore >= 7.0) {
    return 'C1'; // Advanced User
  } else if (bandScore >= 6.0) {
    return 'B2'; // Upper Intermediate
  } else if (bandScore >= 5.0) {
    return 'B1'; // Intermediate
  } else if (bandScore >= 4.0) {
    return 'A2'; // Elementary
  } else if (bandScore >= 3.0) {
    return 'A1'; // Pre-intermediate
  } else {
    return 'Beginner'; // Below A1
  }
}

/**
 * Get the highest level achieved by user from their test results
 */
export function calculateUserLevel(testResults: Array<{ bandScore?: number }>): UserLevel {
  const validBandScores = testResults
    .map(result => result.bandScore)
    .filter((score): score is number => score !== undefined && score > 0);
  
  if (validBandScores.length === 0) {
    return 'Beginner'; // Default level if no valid test results
  }
  
  const highestBandScore = Math.max(...validBandScores);
  return bandScoreToLevel(highestBandScore);
}

/**
 * Get level display name in Vietnamese
 */
export function getLevelDisplayName(level: UserLevel): string {
  const levelNames: Record<UserLevel, string> = {
    'Beginner': 'Người mới bắt đầu',
    'A1': 'Sơ cấp (A1)',
    'A2': 'Tiền trung cấp (A2)', 
    'B1': 'Trung cấp (B1)',
    'B2': 'Trung cấp cao (B2)',
    'C1': 'Nâng cao (C1)',
    'C2': 'Thành thạo (C2)'
  };
  
  return levelNames[level] || 'Không xác định';
}

/**
 * Get level description
 */
export function getLevelDescription(level: UserLevel): string {
  const descriptions: Record<UserLevel, string> = {
    'Beginner': 'Bạn đang bắt đầu hành trình học tiếng Anh',
    'A1': 'Bạn có thể hiểu và sử dụng các cụm từ quen thuộc hàng ngày',
    'A2': 'Bạn có thể giao tiếp về những chủ đề đơn giản và quen thuộc',
    'B1': 'Bạn có thể xử lý hầu hết các tình huống khi đi du lịch',
    'B2': 'Bạn có thể hiểu ý chính của văn bản phức tạp',
    'C1': 'Bạn có thể sử dụng ngôn ngữ một cách linh hoạt và hiệu quả',
    'C2': 'Bạn có thể hiểu hầu như mọi thứ nghe được và đọc được'
  };
  
  return descriptions[level] || 'Không có mô tả';
}