import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Play } from 'lucide-react';

interface YouTubePlayerProps {
  playlistId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  playlistId, 
  isOpen, 
  onClose, 
  title = "YouTube Playlist" 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Drag & Drop state for minimized view
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default: bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Reset states when component opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setIsMinimized(false);
      setPosition({ x: 16, y: 16 });
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = isFullscreen ? 'hidden' : 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isFullscreen, onClose]);

  // Drag & Drop handlers for minimized view
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isDragging || !isMinimized) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport bounds
      const maxX = window.innerWidth - 320; // 320px is player width
      const maxY = window.innerHeight - 192; // 192px is player height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset, isMinimized]);

  if (!isOpen) return null;

  // Create embed URL with better parameters
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;

  return (
    <>
      {/* Single iframe that persists and moves between modes */}
      <iframe
        key={playlistId} // Only recreate when playlist changes
        src={embedUrl}
        className={`
          ${isFullscreen ? 'fixed inset-0 w-full h-full z-[99999]' : ''}
          ${isMinimized ? 'fixed z-[99999] rounded-lg' : ''}
          ${!isFullscreen && !isMinimized ? 'fixed z-[99999]' : ''}
        `}
        style={{
          ...(isMinimized && {
            width: '320px',
            height: '192px',
            right: `${window.innerWidth - position.x - 320}px`,
            bottom: `${window.innerHeight - position.y - 192}px`,
          }),
          ...(!isFullscreen && !isMinimized && {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(80vw, 800px)',
            height: 'min(60vh, 450px)',
          }),
          pointerEvents: isDragging ? 'none' : 'auto'
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Background overlay for normal mode */}
      {!isFullscreen && !isMinimized && (
        <div className="fixed inset-0 z-[99998] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-lime-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{title}</h3>
                  <p className="text-green-100 text-sm">YouTube Playlist</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="Thu nhỏ (Picture in Picture)"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="Toàn màn hình"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  title="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Video Container placeholder */}
            <div className="relative bg-black">
              <div className="aspect-video">
                {/* iframe is positioned above this area */}
              </div>
            </div>

            {/* Footer with controls */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    💡 Tip: Sử dụng ESC để đóng, click vào video để điều khiển
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Minimize2 className="h-4 w-4" />
                    Picture in Picture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay for fullscreen mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] pointer-events-none">
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors"
              title="Thu nhỏ"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Controls overlay for minimized mode */}
      {isMinimized && (
        <div 
          className={`fixed z-[99999] pointer-events-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            width: '320px',
            height: '192px',
            right: `${window.innerWidth - position.x - 320}px`,
            bottom: `${window.innerHeight - position.y - 192}px`,
          }}
        >
          <div 
            className="absolute inset-0 group pointer-events-auto"
            onMouseDown={handleMouseDown}
          >
            {/* Drag indicator */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/40 to-transparent rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-20">
              <div className="w-8 h-1 bg-white/60 rounded-full"></div>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded transition-colors"
                title="Phóng to"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors"
                title="Đóng"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YouTubePlayer;
