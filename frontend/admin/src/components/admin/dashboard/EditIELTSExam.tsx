import { useState } from 'react';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

interface EditIELTSExamProps {
  examData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onSave: (updatedData: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onCancel: () => void;
}

const EditIELTSExam = ({ examData, onSave, onCancel }: EditIELTSExamProps) => {
  const [formData, setFormData] = useState({
    title: examData?.title || '',
    description: examData?.description || '',
    difficulty: examData?.difficulty || 'Band 4.0-5.0',
    duration: examData?.duration || 60,
    status: examData?.status || 'draft'
  });

  const [loading, setLoading] = useState(false);

  const difficultyOptions = [
    'Band 4.0-5.0',
    'Band 5.0-6.0', 
    'Band 6.0-7.0',
    'Band 7.0-8.0',
    'Band 8.0-9.0'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên đề thi');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`/api/ielts/${examData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          duration: formData.duration,
          status: formData.status
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.data);
        alert('Cập nhật đề thi thành công!');
      } else {
        throw new Error('Failed to update exam');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Lỗi khi cập nhật đề thi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại
        </button>
        <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa đề thi</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Chỉnh sửa cơ bản</h3>
            <p className="text-blue-700 text-sm">
              Hiện tại chỉ có thể chỉnh sửa thông tin cơ bản của đề thi. 
              Để chỉnh sửa nội dung câu hỏi, vui lòng tạo đề thi mới.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đề thi *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nhập tên đề thi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {difficultyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian (phút)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nhập mô tả cho đề thi"
          />
        </div>

        <div className="flex items-center gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </form>

      {/* Exam Info Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Thông tin đề thi</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Loại:</span>
            <span className="ml-2 font-medium">{examData?.type === 'reading' ? 'Reading' : 'Listening'}</span>
          </div>
          <div>
            <span className="text-gray-600">Tổng câu hỏi:</span>
            <span className="ml-2 font-medium">{examData?.totalQuestions}</span>
          </div>
          <div>
            <span className="text-gray-600">Ngày tạo:</span>
            <span className="ml-2 font-medium">
              {examData?.createdAt ? new Date(examData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Cập nhật lần cuối:</span>
            <span className="ml-2 font-medium">
              {examData?.updatedAt ? new Date(examData.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditIELTSExam;
