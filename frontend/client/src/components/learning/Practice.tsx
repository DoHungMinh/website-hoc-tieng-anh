import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, Star, Clock } from 'lucide-react';
import RecentTestHistory from '../ielts/RecentTestHistory';
import YouTubePlayer from '../YouTubePlayer';

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
  youtubePlaylistId?: string;
}

const Practice: React.FC<PracticeProps> = ({ onNavigate }) => {
  const navigate = useNavigate(); // Hook for navigation

  const [youtubePlayer, setYoutubePlayer] = useState<{
    isOpen: boolean;
    playlistId: string;
    title: string;
  }>({
    isOpen: false,
    playlistId: '',
    title: ''
  });

  const practiceItems: PracticeItem[] = [
    {
      title: 'VIDEO LISTENING EXERCISE',
      level: 'All Levels',
      duration: 'Flexible',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      isIELTS: true,
      description: 'Luyện nghe tiếng Anh qua video YouTube với bài tập điền từ vào chỗ trống - Miễn phí & hiệu quả'
    },
    {
      title: 'Luyện thi IELTS (Reading & Listening)',
      level: 'Real Test',
      duration: '60 phút',
      rating: 5.0,
      image: 'https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=400',
      isIELTS: true,
      description: 'Kho đề thi IELTS Reading & Listening chính thức có chấm điểm và giải thích chi tiết'
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
      youtubePlaylistId: 'PLcetZ6gSk9692J5Mq2pY4siPVbMCu4v6c'
    },
    {
      title: 'Luyện nghe BBC News',
      level: 'Advanced',
      duration: '30 phút',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Thách thức bản thân với tin tức BBC nâng cao, phát triển kỹ năng nghe chuyên sâu',
      youtubePlaylistId: 'PLS3XGZxi7cBUS3bvpmcjIeqSAiwTceDmj'
    }
  ];

  return (
    <section id="practice" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display tracking-tight">
            Luyện tập hàng ngày
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tham gia các bài luyện tập đa dạng và thú vị để cải thiện kỹ năng tiếng Anh của bạn mỗi ngày
          </p>
        </div>

        {/* Main Content Grid - 2 columns */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left column - Practice Items */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {practiceItems.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full ${item.isIELTS ? 'ring-1 ring-black relative' : ''
                    }`}
                >
                  {item.isIELTS && (
                    <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.level === 'All Levels' || item.level === 'Real Test' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-900 text-white'
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
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {item.rating}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (item.title === 'VIDEO LISTENING EXERCISE') {
                          navigate('/practice/video-listening');
                        } else if (item.title === 'Luyện thi IELTS (Reading & Listening)') {
                          navigate('/practice/ielts-test');
                        } else if (item.isIELTS) {
                          // Default fallback
                          navigate('/practice/ielts-test');
                        } else if (item.courseType === 'vocabulary') {
                          onNavigate?.('courses');
                        } else if (item.youtubePlaylistId) {
                          setYoutubePlayer({
                            isOpen: true,
                            playlistId: item.youtubePlaylistId,
                            title: item.title
                          });
                        } else if (item.youtubeUrl) {
                          window.open(item.youtubeUrl, '_blank');
                        }
                      }}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 mt-auto border-2 ${item.isIELTS
                        ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 shadow-md hover:shadow-xl'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                      {item.title === 'VIDEO LISTENING EXERCISE' ? 'Vào Video Listening' : item.isIELTS ? 'Làm bài thi ngay' : 'Tiếp tục học'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - IELTS Test History */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <RecentTestHistory
                onViewAll={() => navigate('/practice/ielts-test')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Player Modal */}
      <YouTubePlayer
        playlistId={youtubePlayer.playlistId}
        isOpen={youtubePlayer.isOpen}
        onClose={() => setYoutubePlayer({ isOpen: false, playlistId: '', title: '' })}
        title={youtubePlayer.title}
      />
    </section>
  );
};

export default Practice;