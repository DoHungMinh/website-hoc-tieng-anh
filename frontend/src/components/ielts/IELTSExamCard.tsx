import { Clock, FileText, Volume2, Users, Target, Play } from 'lucide-react';

interface IELTSExamCardProps {
  exam: {
    _id: string;
    title: string;
    type: 'reading' | 'listening';
    difficulty: string;
    duration: number;
    totalQuestions: number;
    description: string;
  };
  onStartExam: (examId: string, type: 'reading' | 'listening') => void;
}

const IELTSExamCard: React.FC<IELTSExamCardProps> = ({ exam, onStartExam }) => {
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('4.0') || difficulty.includes('5.0')) {
      return 'bg-green-100 text-green-800';
    }
    if (difficulty.includes('6.0') || difficulty.includes('7.0')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getTypeIcon = () => {
    return exam.type === 'reading' 
      ? <FileText className="h-5 w-5 text-blue-600" />
      : <Volume2 className="h-5 w-5 text-purple-600" />;
  };

  const getTypeColor = () => {
    return exam.type === 'reading'
      ? 'from-blue-500 to-blue-600'
      : 'from-purple-500 to-purple-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTypeColor()} p-6 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="text-sm font-semibold uppercase tracking-wide">
              IELTS {exam.type === 'reading' ? 'Reading' : 'Listening'}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)} text-gray-800`}>
            {exam.difficulty}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white leading-tight">
          {exam.title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {exam.description || `Đề thi ${exam.type === 'reading' ? 'đọc hiểu' : 'nghe hiểu'} IELTS với ${exam.totalQuestions} câu hỏi.`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Thời gian</p>
            <p className="text-sm font-bold text-gray-900">{exam.duration} phút</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Câu hỏi</p>
            <p className="text-sm font-bold text-gray-900">{exam.totalQuestions}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Mức độ</p>
            <p className="text-sm font-bold text-gray-900">
              {exam.difficulty.split(' ')[1] || 'Medium'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onStartExam(exam._id, exam.type)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${getTypeColor()} hover:shadow-lg text-white font-semibold rounded-lg transition-all duration-300 group-hover:scale-[1.02]`}
        >
          <Play className="h-5 w-5" />
          Bắt đầu làm bài
        </button>
      </div>

      {/* Bottom accent */}
      <div className={`h-1 bg-gradient-to-r ${getTypeColor()}`}></div>
    </div>
  );
};

export default IELTSExamCard;
