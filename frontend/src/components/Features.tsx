import React from 'react';
import { Book, Headphones, Mic, PenTool, Target, Brain, Clock, Trophy } from 'lucide-react';

interface FeaturesProps {
  onNavigate?: (page: string) => void;
}

const Features: React.FC<FeaturesProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Book,
      title: 'Từ vựng thông minh',
      description: 'Học từ vựng với phương pháp ghi nhớ khoa học, bao gồm cả khóa học thành ngữ đặc biệt',
      color: 'from-green-500 to-lime-500',
      clickable: true,
      action: () => onNavigate?.('courses')
    },
    {
      icon: PenTool,
      title: 'Ngữ pháp tương tác',
      description: 'Bài tập ngữ pháp đa dạng với giải thích chi tiết và ví dụ sinh động',
      color: 'from-green-600 to-green-400',
      clickable: true,
      action: () => onNavigate?.('courses')
    },
    {
      icon: Headphones,
      title: 'Luyện nghe chuyên sâu',
      description: 'Hàng nghìn audio với nhiều giọng điệu và tốc độ khác nhau',
      color: 'from-lime-500 to-green-500',
      clickable: false
    },
    {
      icon: Mic,
      title: 'Luyện phát âm AI',
      description: 'Công nghệ AI đánh giá và sửa phát âm theo thời gian thực',
      color: 'from-green-700 to-lime-600',
      clickable: false
    },
    {
      icon: Target,
      title: 'Luyện thi IELTS/TOEIC',
      description: 'Đề thi mô phỏng chính thức với chấm điểm tự động chi tiết',
      color: 'from-green-500 to-green-600',
      clickable: false
    },
    {
      icon: Brain,
      title: 'AI Chatbot thông minh',
      description: 'Trò chuyện với AI để luyện giao tiếp và giải đáp thắc mắc 24/7',
      color: 'from-lime-600 to-green-500',
      clickable: false
    },
    {
      icon: Clock,
      title: 'Học theo lộ trình',
      description: 'Lộ trình học cá nhân hóa phù hợp với trình độ và mục tiêu',
      color: 'from-green-600 to-lime-500',
      clickable: false
    },
    {
      icon: Trophy,
      title: 'Theo dõi tiến độ',
      description: 'Thống kê chi tiết về quá trình học tập và thành tích đạt được',
      color: 'from-green-700 to-green-500',
      clickable: false
    }
  ];

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những công cụ học tập hiện đại và hiệu quả nhất để nâng cao trình độ tiếng Anh của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                feature.clickable ? 'cursor-pointer' : ''
              }`}
              onClick={feature.action}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;