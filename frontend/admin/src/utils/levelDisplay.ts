export type UserLevel = 'Beginner' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

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

/**
 * Get level color for UI display
 */
export function getLevelColor(level: UserLevel): string {
  const colors: Record<UserLevel, string> = {
    'Beginner': 'text-gray-600',
    'A1': 'text-red-600',
    'A2': 'text-orange-600',
    'B1': 'text-yellow-600',
    'B2': 'text-blue-600',
    'C1': 'text-green-600',
    'C2': 'text-purple-600'
  };
  
  return colors[level] || 'text-gray-600';
}

/**
 * Get level background color for badges
 */
export function getLevelBackgroundColor(level: UserLevel): string {
  const colors: Record<UserLevel, string> = {
    'Beginner': 'bg-gray-100 text-gray-700',
    'A1': 'bg-red-100 text-red-700',
    'A2': 'bg-orange-100 text-orange-700',
    'B1': 'bg-yellow-100 text-yellow-700',
    'B2': 'bg-blue-100 text-blue-700',
    'C1': 'bg-green-100 text-green-700',
    'C2': 'bg-purple-100 text-purple-700'
  };
  
  return colors[level] || 'bg-gray-100 text-gray-700';
}