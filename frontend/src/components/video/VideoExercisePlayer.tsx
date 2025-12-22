import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Volume2, RotateCcw } from 'lucide-react';
import { parseSRT } from '@/utils/srtParser';
import { windAndSunSRT } from '../../data/srtData';

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoExercise {
  _id: string;
  youtubeId: string;
  title: string;
  topics: string[];
  blankCount: number;
  thumbnailUrl: string;
  duration: string;
}

interface SubtitleBlock {
  index: number;
  startTime: number;
  endTime: number;
  originalText: string;
  displayText: string;
  hasBlank: boolean;
  answer?: string;
}

interface VideoExercisePlayerProps {
  video: VideoExercise;
  onBack: () => void;
}

const VideoExercisePlayer: React.FC<VideoExercisePlayerProps> = ({ video, onBack }) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: number]: 'correct' | 'wrong' }>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const timeCheckInterval = useRef<any>(null);
  const canAutoPauseRef = useRef(true);

  // Parse SRT data - Load real subtitle cho video "The Wind and the Sun"
  const subtitles = video.youtubeId === 'l0Z8A4u3CtI' 
    ? parseSRT(windAndSunSRT)
    : []; // Các video khác sẽ cần load SRT riêng

  const blanksOnly = subtitles.filter(s => s.hasBlank);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API ready callback
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timeCheckInterval.current) {
        clearInterval(timeCheckInterval.current);
      }
    };
  }, []);

  // Initialize YouTube Player
  const initializePlayer = () => {
    if (!window.YT) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: video.youtubeId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: (event: any) => {
          setPlayerReady(true);
          // Tự động play video khi ready
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          // Track playing state
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPaused(false);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPaused(true);
          }
        }
      }
    });

    // Update current time every 100ms
    timeCheckInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime((prevTime) => {
          // Check if need to auto-pause at blank
          // Dùng callback để có state mới nhất
          setCurrentBlankIndex((prevBlankIndex) => {
            if (prevBlankIndex < blanksOnly.length && canAutoPauseRef.current) {
              const currentBlank = blanksOnly[prevBlankIndex];
              
              // Chỉ pause nếu:
              // 1. Time đã đến endTime
              // 2. Time trong window 1 giây sau endTime
              // 3. Video đang chạy
              const nearEndTime = time >= currentBlank.endTime && time < currentBlank.endTime + 1;
              const isPlaying = playerRef.current.getPlayerState && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
              
              if (nearEndTime && isPlaying) {
                // Auto pause
                if (playerRef.current.pauseVideo) {
                  playerRef.current.pauseVideo();
                  setIsPaused(true);
                  // Tắt auto-pause cho đến khi user check answer
                  canAutoPauseRef.current = false;
                }
              }
            }
            return prevBlankIndex;
          });
          return time;
        });
      }
    }, 100);
  };

  // Auto-scroll transcript theo video timing
  useEffect(() => {
    const activeElement = document.getElementById(`subtitle-${activeSubtitleIndex}`);
    if (activeElement && transcriptRef.current) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSubtitleIndex]);

  // Update active subtitle based on current time
  useEffect(() => {
    const activeIndex = subtitles.findIndex(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    if (activeIndex !== -1) {
      setActiveSubtitleIndex(activeIndex);
    }
  }, [currentTime, subtitles]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleCheck = (subtitle: SubtitleBlock) => {
    const userAnswer = answers[subtitle.index]?.toLowerCase().trim() || '';
    const correctAnswer = subtitle.answer?.toLowerCase().trim() || '';
    const isCorrect = userAnswer === correctAnswer;
    
    setFeedback({ ...feedback, [subtitle.index]: isCorrect ? 'correct' : 'wrong' });
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Move to next blank NGAY (trước khi resume)
    const nextBlankIndex = currentBlankIndex + 1;
    
    // Auto-resume video sau 2 giây
    setTimeout(() => {
      if (playerRef.current && playerRef.current.playVideo) {
        // Bật lại auto-pause cho blank tiếp theo
        canAutoPauseRef.current = true;
        
        // Update index trước khi play
        if (nextBlankIndex < blanksOnly.length) {
          setCurrentBlankIndex(nextBlankIndex);
          playerRef.current.playVideo();
          setIsPaused(false);
        } else {
          // All blanks completed
          setCompleted(true);
        }
      }
    }, 2000);
  };

  const handleReplay = () => {
    if (playerRef.current && playerRef.current.seekTo && activeSubtitleIndex >= 0) {
      const subtitle = subtitles[activeSubtitleIndex];
      playerRef.current.seekTo(subtitle.startTime, true);
      playerRef.current.playVideo();
      
      // Auto pause at end of sentence
      setTimeout(() => {
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      }, (subtitle.endTime - subtitle.startTime) * 1000);
    }
  };

  const calculateProgress = () => {
    if (blanksOnly.length === 0) return 0;
    const answeredBlanks = blanksOnly.filter(s => feedback[s.index] === 'correct').length;
    return (answeredBlanks / blanksOnly.length) * 100;
  };

  if (completed) {
    const completedBlanks = blanksOnly.filter(s => feedback[s.index] === 'correct').length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="bg-gradient-to-r from-green-500 to-lime-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hoàn thành xuất sắc!
          </h2>
          
          <div className="bg-gradient-to-r from-green-100 to-lime-100 rounded-2xl p-6 mb-6">
            <p className="text-6xl font-bold text-green-700 mb-2">
              {Math.round((completedBlanks / blanksOnly.length) * 100)}%
            </p>
            <p className="text-gray-600">
              Đúng {completedBlanks}/{blanksOnly.length} câu
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setAnswers({});
                setFeedback({});
                setScore(0);
                setCompleted(false);
                setCurrentTime(0);
                setCurrentBlankIndex(0);
                canAutoPauseRef.current = true;
                if (playerRef.current && playerRef.current.seekTo) {
                  playerRef.current.seekTo(0);
                }
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw className="h-5 w-5" />
              Làm lại
            </button>
            
            <button
              onClick={onBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-medium transition-all duration-300"
            >
              Về thư viện
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại</span>
            </button>

            <div className="flex-1 mx-8">
              <h2 className="text-lg font-bold text-gray-900 truncate">{video.title}</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiến độ</p>
                <p className="text-lg font-bold text-green-600">{Math.round(calculateProgress())}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Điểm</p>
                <p className="text-lg font-bold text-green-600">{score}/{blanksOnly.length}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-lime-500 h-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Layout - Video 75% Left + Transcript 25% Right (Like YouTube Livestream) */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Video Container - 75% Width */}
        <div className="w-3/4 bg-gray-900 p-4">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl relative group">
            <div id="youtube-player" className="w-full h-full"></div>
            
            {/* Overlay to block user interaction */}
            <div className="absolute inset-0 z-10 cursor-not-allowed group-hover:bg-black/5 transition-colors">
              {/* Tooltip */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Video được điều khiển tự động
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Panel - 25% Width (Like Livestream Chat) */}
        <div className="w-1/4 bg-white border-l border-gray-200 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-lime-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-green-600" />
                Transcript
              </h3>
              <button
                onClick={handleReplay}
                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 text-xs"
              >
                <Volume2 className="h-3 w-3" />
                Replay
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Câu {currentBlankIndex + 1}/{blanksOnly.length}
            </p>
          </div>

          {/* Scrollable Transcript */}
          <div 
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-4 space-y-3" 
          >
            {subtitles.map((subtitle) => (
              <div
                key={subtitle.index}
                id={`subtitle-${subtitle.index}`}
                className={`p-3 rounded-lg transition-all duration-300 text-sm ${
                  activeSubtitleIndex === subtitle.index
                    ? 'bg-green-50 border-l-4 border-green-500 shadow-sm'
                    : 'bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="space-y-2">
                  {/* Timing */}
                  <div className="text-xs font-mono text-gray-500">
                    {subtitle.startTime.toFixed(1)}s
                  </div>

                  {/* Content */}
                  {subtitle.hasBlank ? (
                    <div className="space-y-2">
                      {/* Display text with inline input */}
                      <div className="text-gray-900 text-sm leading-relaxed">
                        {subtitle.displayText.split('_____').map((part, idx, arr) => (
                          <span key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <input
                                type="text"
                                value={answers[subtitle.index] || ''}
                                onChange={(e) => handleAnswerChange(subtitle.index, e.target.value)}
                                disabled={feedback[subtitle.index] !== undefined}
                                placeholder="..."
                                className={`inline-block mx-1 px-2 py-1 border-2 rounded text-center font-medium transition-all duration-300 text-xs ${
                                  feedback[subtitle.index] === 'correct'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : feedback[subtitle.index] === 'wrong'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-green-300 focus:border-green-600 focus:outline-none'
                                }`}
                                style={{ width: '100px' }}
                              />
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Feedback */}
                      {feedback[subtitle.index] === 'correct' && (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="font-medium">Chính xác!</span>
                        </div>
                      )}

                      {feedback[subtitle.index] === 'wrong' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-red-600 text-xs">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="font-medium">Chưa đúng</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Đáp án: <span className="font-bold text-green-600">{subtitle.answer}</span>
                          </p>
                        </div>
                      )}

                      {/* Check button */}
                      {feedback[subtitle.index] === undefined && isPaused && currentBlankIndex === blanksOnly.findIndex(b => b.index === subtitle.index) && (
                        <button
                          onClick={() => handleCheck(subtitle)}
                          disabled={!answers[subtitle.index]?.trim()}
                          className={`w-full px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1.5 text-xs ${
                            answers[subtitle.index]?.trim()
                              ? 'bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white shadow-md'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Kiểm tra
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {subtitle.displayText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoExercisePlayer;
