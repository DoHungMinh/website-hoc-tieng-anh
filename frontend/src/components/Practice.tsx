import { useState } from 'react';
import { PlayCircle, CheckCircle, Star, Clock } from 'lucide-react';
import IELTSCenter from './ielts/IELTSCenter';

interface PracticeProps {
  onNavigate?: (page: string) => void;
}

interface PracticeItem {
  title: string;
  level: string;
  duration: string;
  rating: number;
  image: string;
  description?: string;
  isIELTS?: boolean;
  courseType?: string;
  youtubeUrl?: string;
}

const Practice: React.FC<PracticeProps> = ({ onNavigate }) => {
  const [showIELTS, setShowIELTS] = useState(false);

  if (showIELTS) {
    return <IELTSCenter />;
  }
  const practiceItems: PracticeItem[] = [
    {
      title: 'IELTS Practice Center',
      level: 'All Levels',
      duration: 'Flexible',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      isIELTS: true,
      description: 'Luyện thi IELTS Reading & Listening với bộ đề thực tế và AI hỗ trợ'
    },
    {
      title: 'Bài tập từ vựng cơ bản',
      level: 'Beginner',
      duration: '15 phút',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      courseType: 'vocabulary',
      description: 'Nắm vững 500+ từ vựng thiết yếu cho cuộc sống hàng ngày với phương pháp ghi nhớ thông minh'
    },
    {
      title: 'Luyện nghe BBC Learning English',
      level: 'Intermediate',
      duration: '25 phút',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Học tiếng Anh qua chương trình BBC Learning English với phương pháp giảng dạy chuyên nghiệp',
      youtubeUrl: 'https://www.youtube.com/playlist?list=PLcetZ6gSk9692J5Mq2pY4siPVbMCu4v6c'
    },
    {
      title: 'Luyện nghe BBC News',
      level: 'Advanced',
      duration: '30 phút',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Thách thức bản thân với tin tức BBC nâng cao, phát triển kỹ năng nghe chuyên sâu'
    }
  ];

  return (
    <section id="practice" className="py-20 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
            Luyện tập hàng ngày
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tham gia các bài luyện tập đa dạng và thú vị để cải thiện kỹ năng tiếng Anh của bạn mỗi ngày
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {practiceItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col h-full ${
                item.isIELTS ? 'ring-2 ring-green-500 relative' : ''
              }`}
            >
              {item.isIELTS && (
                <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-green-500 to-lime-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  HOT
                </div>
              )}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full p-3 hover:bg-white/30 transition-colors duration-300">
                  <PlayCircle className="h-8 w-8 text-white" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.level === 'Beginner' ? 'bg-green-500 text-white' :
                    item.level === 'Intermediate' ? 'bg-lime-500 text-green-900' :
                    item.level === 'Advanced' ? 'bg-orange-500 text-white' :
                    item.level === 'Expert' ? 'bg-red-500 text-white' :
                    'bg-gradient-to-r from-green-500 to-lime-500 text-white'
                  }`}>
                    {item.level}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 flex-1">{item.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {item.rating}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (item.isIELTS) {
                      setShowIELTS(true);
                    } else if (item.courseType === 'vocabulary') {
                      onNavigate?.('courses');
                    } else if (item.youtubeUrl) {
                      window.open(item.youtubeUrl, '_blank');
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 mt-auto ${
                    item.isIELTS 
                      ? 'bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  {item.isIELTS ? 'Vào IELTS Center' : 'Tiếp tục học'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Practice;