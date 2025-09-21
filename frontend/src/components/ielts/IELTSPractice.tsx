import { useState } from 'react';
import { 
  BookOpen, 
  Headphones, 
  Clock, 
  Star, 
  Play, 
  ChevronRight,
  Trophy,
  Target,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import IELTSReadingTest from './IELTSReadingTest';
import IELTSListeningTest from './IELTSListeningTest';
import IELTSTestHistory from './IELTSTestHistory';

interface ReadingTest {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  duration: string;
  passages: number;
  questions: number;
  completed: boolean;
  rating: number;
  attempts: number;
  image: string;
}

interface ListeningTest {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  duration: string;
  sections: number;
  questions: number;
  completed: boolean;
  rating: number;
  attempts: number;
  image: string;
}

const IELTSPractice = () => {
  const [activeTab, setActiveTab] = useState<'reading' | 'listening' | 'history'>('reading');
  const [showReadingTest, setShowReadingTest] = useState(false);
  const [showListeningTest, setShowListeningTest] = useState(false);

  if (showReadingTest) {
    return <IELTSReadingTest />;
  }

  if (showListeningTest) {
    return <IELTSListeningTest />;
  }

  const readingTests: ReadingTest[] = [
    {
      id: 1,
      title: 'Academic Reading Test 1',
      topic: 'Environmental Science',
      difficulty: 'Band 6.0-7.0',
      duration: '60 phút',
      passages: 3,
      questions: 40,
      completed: false,
      rating: 4.8,
      attempts: 1247,
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'General Training Reading Test 1',
      topic: 'Workplace & Society',
      difficulty: 'Band 5.5-6.5',
      duration: '60 phút',
      passages: 3,
      questions: 40,
      completed: true,
      rating: 4.6,
      attempts: 892,
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Academic Reading Test 2',
      topic: 'Technology & Innovation',
      difficulty: 'Band 7.0-8.0',
      duration: '60 phút',
      passages: 3,
      questions: 40,
      completed: false,
      rating: 4.9,
      attempts: 743,
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const listeningTests: ListeningTest[] = [
    {
      id: 1,
      title: 'IELTS Listening Test 1',
      topic: 'University Life',
      difficulty: 'Band 6.0-7.0',
      duration: '40 phút',
      sections: 4,
      questions: 40,
      completed: false,
      rating: 4.7,
      attempts: 1156,
      image: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'IELTS Listening Test 2',
      topic: 'Daily Conversations',
      difficulty: 'Band 5.5-6.5',
      duration: '40 phút',
      sections: 4,
      questions: 40,
      completed: true,
      rating: 4.5,
      attempts: 967,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'IELTS Listening Test 3',
      topic: 'Academic Lectures',
      difficulty: 'Band 7.0-8.5',
      duration: '40 phút',
      sections: 4,
      questions: 40,
      completed: false,
      rating: 4.8,
      attempts: 634,
      image: 'https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getBandColor = (difficulty: string) => {
    if (difficulty.includes('5.5-6.5')) return 'bg-green-500';
    if (difficulty.includes('6.0-7.0')) return 'bg-lime-500';
    if (difficulty.includes('7.0-8.0') || difficulty.includes('7.0-8.5')) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const currentTests = activeTab === 'reading' ? readingTests : listeningTests;

  // Render tab lịch sử
  if (activeTab === 'history') {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
              IELTS Practice Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Luyện tập với bộ đề IELTS chính thức. Nâng cao kỹ năng Reading và Listening của bạn với các bài test thực tế.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              <button
                onClick={() => setActiveTab('reading')}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 text-gray-600 hover:text-green-600 hover:bg-green-50"
              >
                <BookOpen className="h-5 w-5" />
                IELTS Reading
              </button>
              <button
                onClick={() => setActiveTab('listening')}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 text-gray-600 hover:text-green-600 hover:bg-green-50"
              >
                <Headphones className="h-5 w-5" />
                IELTS Listening
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-600 to-lime-600 text-white shadow-lg"
              >
                <BarChart3 className="h-5 w-5" />
                Lịch sử
              </button>
            </div>
          </div>

          {/* History Content */}
          <IELTSTestHistory />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
            IELTS Practice Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Luyện tập với bộ đề IELTS chính thức. Nâng cao kỹ năng Reading và Listening của bạn với các bài test thực tế.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'reading'
                  ? 'bg-gradient-to-r from-green-600 to-lime-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              IELTS Reading
            </button>
            <button
              onClick={() => setActiveTab('listening')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'listening'
                  ? 'bg-gradient-to-r from-green-600 to-lime-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Headphones className="h-5 w-5" />
              IELTS Listening
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-green-600 to-lime-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Lịch sử
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-100 to-lime-100 p-3 rounded-xl">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">150+</p>
                <p className="text-gray-600">Bài test thực tế</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-lime-100 to-green-100 p-3 rounded-xl">
                <Target className="h-8 w-8 text-lime-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Band 9.0</p>
                <p className="text-gray-600">Mục tiêu đạt được</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-100 to-lime-100 p-3 rounded-xl">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">50K+</p>
                <p className="text-gray-600">Học viên tin tưởng</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-lime-100 to-green-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-lime-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">7 ngày</p>
                <p className="text-gray-600">Cập nhật mới</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {currentTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
            >
              {/* Image Header */}
              <div className="relative">
                <img
                  src={test.image}
                  alt={test.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Play Button */}
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>

                {/* Difficulty Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getBandColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>

                {/* Completed Badge */}
                {test.completed && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 rounded-full p-1">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                  {test.title}
                </h3>
                
                <p className="text-gray-600 mb-4">{test.topic}</p>

                {/* Test Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {test.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {activeTab === 'reading' ? (
                      <>
                        <BookOpen className="h-4 w-4" />
                        {(test as ReadingTest).passages} passages
                      </>
                    ) : (
                      <>
                        <Headphones className="h-4 w-4" />
                        {(test as ListeningTest).sections} sections
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    {test.questions} questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {test.rating}
                  </div>
                </div>

                {/* Attempts */}
                <div className="flex items-center justify-between mb-6 text-sm">
                  <span className="text-gray-600">{test.attempts.toLocaleString()} lượt làm bài</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phổ biến</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => {
                    if (activeTab === 'reading') {
                      setShowReadingTest(true);
                    } else {
                      setShowListeningTest(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {test.completed ? 'Làm lại' : 'Bắt đầu test'}
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl">
            Tải thêm bài test
          </button>
        </div>
      </div>
    </section>
  );
};

export default IELTSPractice;
