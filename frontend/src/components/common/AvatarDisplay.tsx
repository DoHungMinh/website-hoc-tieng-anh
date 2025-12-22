import React from 'react';
import { User } from 'lucide-react';

interface AvatarDisplayProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  src,
  name,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3';
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-5 w-5';
      case 'lg':
        return 'h-6 w-6';
      case 'xl':
        return 'h-8 w-8';
      default:
        return 'h-5 w-5';
    }
  };

  const getStatusIndicatorSize = () => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-2.5 h-2.5';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-3.5 h-3.5';
      case 'xl':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${getSizeClasses()} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback nếu ảnh lỗi
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-green-400 to-lime-500 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">${getInitials(name)}</span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          // Fallback với initials hoặc icon
          name ? (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-lime-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getInitials(name)}
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-lime-500 flex items-center justify-center">
              <User className={`${getIconSize()} text-white`} />
            </div>
          )
        )}
      </div>

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${getStatusIndicatorSize()} rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};

export default AvatarDisplay;