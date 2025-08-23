import { useState } from 'react';
import { PlayCircle, CheckCircle, Star, Clock, ArrowRight, Trophy, Target } from 'lucide-react';
import IELTSCenter from './ielts/IELTSCenter';

const Practice = () => {
  const [showIELTS, setShowIELTS] = useState(false);

  if (showIELTS) {
    return <IELTSCenter />;
  }
  const practiceItems = [
    {
      title: 'IELTS Practice Center',
      level: 'All Levels',
      duration: 'Flexible',
      completed: 0,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      isIELTS: true,
      description: 'Luyện thi IELTS Reading & Listening với bộ đề thực tế và AI hỗ trợ'
    },
    {
      title: 'Bài tập từ vựng cơ bản',
      level: 'Beginner',
      duration: '15 phút',
      completed: 85,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Luyện nghe tin tức BBC',
      level: 'Intermediate',
      duration: '25 phút',
      completed: 60,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Luyện nghe BBC News',
      level: 'Advanced',
      duration: '30 phút',
      completed: 45,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
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
              className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
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

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
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

                {!item.isIELTS && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ hoàn thành</span>
                      <span className="font-medium text-green-700">{item.completed}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-lime-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.completed}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => item.isIELTS ? setShowIELTS(true) : null}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
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