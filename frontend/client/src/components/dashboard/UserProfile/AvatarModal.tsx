import React, { useRef } from 'react';
import { X, User, Camera, Trash2 } from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  avatar?: string;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  avatar,
  isUploading,
  onClose,
  onUpload,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Ảnh đại diện</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="text-center mb-6">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 shadow-lg">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Chấp nhận JPG, PNG. Tối đa 5MB
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Camera className="h-5 w-5" />
            <span>{avatar ? 'Đổi ảnh đại diện' : 'Thêm ảnh đại diện'}</span>
          </button>

          {avatar && (
            <button
              onClick={onDelete}
              disabled={isUploading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              <span>Xóa ảnh đại diện</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Hủy
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarModal;
