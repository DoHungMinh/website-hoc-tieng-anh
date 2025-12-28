import { useState } from 'react';
import { Play, Clock, Target, ArrowLeft, CheckCircle, Volume2 } from 'lucide-react';
import VideoExercisePlayer from './VideoExercisePlayer';

interface VideoExercise {
  _id: string;
  youtubeId: string;
  title: string;
  topics: string[];
  blankCount: number;
  thumbnailUrl: string;
  duration: string;
}

interface VideoListeningLibraryProps {
  onBack: () => void;
}

const VideoListeningLibrary: React.FC<VideoListeningLibraryProps> = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoExercise | null>(null);

  // Demo data - sẽ thay bằng API call sau
  const videoExercises: VideoExercise[] = [
    {
      _id: '1',
      youtubeId: 'l0Z8A4u3CtI',
      title: 'The Wind and the Sun - Fable Story',
      topics: ['Story', 'Beginner'],
      blankCount: 9,
      thumbnailUrl: 'https://img.youtube.com/vi/l0Z8A4u3CtI/maxresdefault.jpg',
      duration: '3:18'
    },
    {
      _id: '2',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Business English - Job Interview Tips',
      topics: ['Business', 'Career'],
      blankCount: 20,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '8:15'
    },
    {
      _id: '3',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Travel English - Booking A Hotel Room',
      topics: ['Travel', 'Tourism'],
      blankCount: 12,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '4:45'
    },
    {
      _id: '4',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'English Grammar - Present Perfect Tense',
      topics: ['Grammar', 'Education'],
      blankCount: 18,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '6:20'
    },
    {
      _id: '5',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Advanced Discussion - Climate Change',
      topics: ['Environment', 'Science'],
      blankCount: 25,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '10:30'
    },
    {
      _id: '6',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Beginner Basics - Introducing Yourself',
      topics: ['Basics', 'Social'],
      blankCount: 10,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '3:30'
    }
  ];

  if (selectedVideo) {
    return <VideoExercisePlayer video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">


          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Volume2 className="h-10 w-10 text-indigo-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display tracking-tight">
                VIDEO LISTENING EXERCISE
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Luyện nghe tiếng Anh qua video YouTube với bài tập điền từ vào chỗ trống - Miễn phí & hiệu quả
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 rounded-full p-3">
                <Play className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số video</p>
                <p className="text-2xl font-bold text-gray-900">{videoExercises.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 rounded-full p-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng bài tập</p>
                <p className="text-2xl font-bold text-gray-900">
                  {videoExercises.reduce((sum, v) => sum + v.blankCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn toàn miễn phí</p>
                <p className="text-2xl font-bold text-emerald-600">100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoExercises.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Play Button Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white/30 backdrop-blur-md rounded-full p-4 group-hover:bg-white/40 transition-all duration-300 group-hover:scale-110">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="h-3 w-3 text-white" />
                  <span className="text-xs text-white font-medium">{video.duration}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {video.title}
                </h3>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.topics.slice(0, 2).map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Blank Count */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{video.blankCount} câu hỏi</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Play className="h-5 w-5" />
                  Bắt đầu luyện tập
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no videos) */}
        {videoExercises.length === 0 && (
          <div className="text-center py-16">
            <Volume2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có bài tập nào
            </h3>
            <p className="text-gray-500">
              Hệ thống đang cập nhật thêm video mới
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoListeningLibrary;
