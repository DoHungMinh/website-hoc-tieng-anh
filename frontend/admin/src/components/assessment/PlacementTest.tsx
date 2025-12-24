import React, { useState } from 'react';
import { Play, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';

const PlacementTest = () => {
  const [isStarted, setIsStarted] = useState(false);

  const testInfo = {
    duration: 30,
    totalQuestions: 40,
    skills: [
      { name: 'Ngữ pháp', questions: 10, icon: '📝' },
      { name: 'Từ vựng', questions: 10, icon: '📚' },
      { name: 'Đọc hiểu', questions: 10, icon: '📖' },
      { name: 'Nghe hiểu', questions: 10, icon: '🎧' }
    ]
  };

  const benefits = [
    'Đánh giá chính xác trình độ hiện tại',
    'Xác định điểm mạnh và điểm yếu',
    'Nhận lộ trình học cá nhân hóa',
    'Tiết kiệm thời gian với nội dung phù hợp'
  ];

  const handleStartTest = () => {
    setIsStarted(true);
    // Logic to start the assessment will be implemented here
  };

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bài test đánh giá trình độ
            </h1>
            <div className="bg-white rounded-xl p-4 inline-flex items-center gap-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-medium">29:45</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Câu hỏi:</span>
                <span className="font-medium">1/40</span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Ngữ pháp
                </span>
                <span className="text-gray-500">Câu 1/10</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose the correct answer to complete the sentence:
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                I _______ to the store yesterday to buy some groceries.
              </p>
            </div>

            <div className="space-y-3">
              {['go', 'went', 'going', 'will go'].map((option, index) => (
                <button
                  key={index}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:border-green-500 focus:bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                Câu trước
              </button>
              <button className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2">
                Câu tiếp theo
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ bài test</span>
              <span>2.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-lime-500 h-2 rounded-full transition-all duration-500" style={{ width: '2.5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
            Bài test đánh giá trình độ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hoàn thành bài test 30 phút để chúng tôi đánh giá chính xác trình độ và đề xuất lộ trình học phù hợp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Test Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin bài test</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-green-600" />
                <span className="text-lg">Thời gian: {testInfo.duration} phút</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-lg">Tổng số câu: {testInfo.totalQuestions} câu hỏi</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cấu trúc bài test:</h3>
            <div className="space-y-3">
              {testInfo.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{skill.icon}</span>
                    <span className="font-medium">{skill.name}</span>
                  </div>
                  <span className="text-green-700 font-medium">{skill.questions} câu</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lợi ích của bài test</h2>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-100 to-lime-100 rounded-xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">💡 Lưu ý quan trọng</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Hãy chọn câu trả lời tốt nhất cho mỗi câu hỏi</li>
                <li>• Bạn không thể quay lại câu hỏi đã làm</li>
                <li>• Đảm bảo kết nối internet ổn định</li>
                <li>• Làm bài trong môi trường yên tĩnh</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
          >
            <Play className="h-6 w-6" />
            Bắt đầu làm bài test
          </button>
          <p className="text-gray-500 mt-4">
            Sau khi bắt đầu, bạn sẽ có đúng 30 phút để hoàn thành bài test
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
