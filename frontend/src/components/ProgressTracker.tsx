import React, { useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { Plus, Book, Headphones, FileText, Award, RefreshCw } from 'lucide-react';

const ProgressTracker: React.FC = () => {
  const { 
    progress, 
    loading, 
    error, 
    fetchProgress,
    updateVocabularyProgress,
    updateListeningProgress,
    updateTestProgress 
  } = useProgress();

  const [vocabForm, setVocabForm] = useState({
    word: '',
    meaning: '',
    example: ''
  });

  const [listeningForm, setListeningForm] = useState({
    title: '',
    duration: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    score: ''
  });

  const [testForm, setTestForm] = useState({
    testName: '',
    score: '',
    maxScore: '',
    percentage: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.word || !vocabForm.meaning || !vocabForm.example) return;

    try {
      setSubmitting(true);
      const result = await updateVocabularyProgress(
        vocabForm.word,
        vocabForm.meaning,
        vocabForm.example
      );
      
      if (result.success) {
        alert(`✅ Thêm từ vựng thành công! ${result.newWord ? '(Từ mới)' : '(Ôn tập)'} - Tổng: ${result.vocabularyLearned} từ`);
        setVocabForm({ word: '', meaning: '', example: '' });
      }
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleListeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listeningForm.title || !listeningForm.duration || !listeningForm.score) return;

    try {
      setSubmitting(true);
      const result = await updateListeningProgress(
        listeningForm.title,
        Number(listeningForm.duration),
        listeningForm.difficulty,
        Number(listeningForm.score)
      );
      
      if (result.success) {
        alert(`✅ Hoàn thành session nghe! Điểm: ${result.sessionScore}% - Tổng: ${result.hoursCompleted.toFixed(1)}h`);
        setListeningForm({ title: '', duration: '', difficulty: 'intermediate', score: '' });
      }
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.testName || !testForm.score || !testForm.maxScore) return;

    const percentage = (Number(testForm.score) / Number(testForm.maxScore)) * 100;

    try {
      setSubmitting(true);
      const result = await updateTestProgress(
        testForm.testName,
        Number(testForm.score),
        Number(testForm.maxScore),
        percentage
      );
      
      if (result.success) {
        alert(`✅ Hoàn thành bài test! Điểm: ${result.testScore}% - Tổng: ${result.testsCompleted} bài`);
        setTestForm({ testName: '', score: '', maxScore: '', percentage: '' });
      }
    } catch (err: any) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg">Đang tải dữ liệu tiến độ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={fetchProgress}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Progress Tracker Thật</h1>
        <p className="text-gray-600">Cập nhật tiến độ học tập từ hoạt động thực tế</p>
      </div>

      {/* Current Progress Stats */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Từ vựng</p>
                <p className="text-2xl font-bold text-blue-900">{progress.vocabulary.learned}</p>
              </div>
              <Book className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Nghe (giờ)</p>
                <p className="text-2xl font-bold text-green-900">{progress.listening.hoursCompleted.toFixed(1)}</p>
              </div>
              <Headphones className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Bài test</p>
                <p className="text-2xl font-bold text-purple-900">{progress.testsCompleted.completed}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Streak</p>
                <p className="text-2xl font-bold text-yellow-900">{progress.studyStreak.current}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vocabulary Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Book className="h-6 w-6 text-blue-600 mr-2" />
            Học từ vựng mới
          </h3>
          
          <form onSubmit={handleVocabSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng</label>
              <input
                type="text"
                value={vocabForm.word}
                onChange={(e) => setVocabForm({ ...vocabForm, word: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="achievement"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa</label>
              <input
                type="text"
                value={vocabForm.meaning}
                onChange={(e) => setVocabForm({ ...vocabForm, meaning: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="thành tích, thành tựu"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ví dụ</label>
              <textarea
                value={vocabForm.example}
                onChange={(e) => setVocabForm({ ...vocabForm, example: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="His achievement in English is remarkable."
                rows={3}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Đang lưu...' : 'Thêm từ vựng'}
            </button>
          </form>
        </div>

        {/* Listening Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Headphones className="h-6 w-6 text-green-600 mr-2" />
            Hoàn thành bài nghe
          </h3>
          
          <form onSubmit={handleListeningSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài nghe</label>
              <input
                type="text"
                value={listeningForm.title}
                onChange={(e) => setListeningForm({ ...listeningForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="BBC News Listening"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
              <input
                type="number"
                value={listeningForm.duration}
                onChange={(e) => setListeningForm({ ...listeningForm, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="30"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
              <select
                value={listeningForm.difficulty}
                onChange={(e) => setListeningForm({ ...listeningForm, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số (%)</label>
              <input
                type="number"
                value={listeningForm.score}
                onChange={(e) => setListeningForm({ ...listeningForm, score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="85"
                min="0"
                max="100"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Đang lưu...' : 'Hoàn thành bài nghe'}
            </button>
          </form>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-6 w-6 text-purple-600 mr-2" />
            Hoàn thành bài test
          </h3>
          
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài test</label>
              <input
                type="text"
                value={testForm.testName}
                onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Grammar Test B1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt được</label>
              <input
                type="number"
                value={testForm.score}
                onChange={(e) => setTestForm({ ...testForm, score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="42"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng điểm</label>
              <input
                type="number"
                value={testForm.maxScore}
                onChange={(e) => setTestForm({ ...testForm, maxScore: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="50"
                min="1"
                required
              />
            </div>
            
            {testForm.score && testForm.maxScore && (
              <div className="text-sm text-gray-600">
                Phần trăm: {((Number(testForm.score) / Number(testForm.maxScore)) * 100).toFixed(1)}%
              </div>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Đang lưu...' : 'Hoàn thành bài test'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Achievements */}
      {progress && progress.achievements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-6 w-6 text-yellow-600 mr-2" />
            Thành tích gần đây
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.achievements.slice(-6).map((achievement: any) => (
              <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
