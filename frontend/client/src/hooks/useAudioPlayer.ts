import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  loadAudio: (source: string | Blob) => void;
}

export interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  controls: AudioPlayerControls;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.src) {
      setError('No audio source loaded');
      return;
    }

    audio.play()
      .then(() => {
        setIsPlaying(true);
        setError(null);
        
        // Update current time regularly
        updateIntervalRef.current = setInterval(() => {
          setCurrentTime(audio.currentTime);
        }, 100);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Play error:', err);
      });
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(audio.currentTime);
  }, [duration]);

  // Set volume (0 to 1)
  const setVolume = useCallback((vol: number) => {
    const newVolume = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = newVolume;
    setVolumeState(newVolume);
  }, []);

  // Load audio from URL or Blob
  const loadAudio = useCallback((source: string | Blob) => {
    const audio = audioRef.current;
    
    setIsLoading(true);
    setError(null);

    // Revoke previous object URL if exists
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }

    // Set new source
    if (source instanceof Blob) {
      audio.src = URL.createObjectURL(source);
    } else {
      audio.src = source;
    }

    audio.load();
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }

      // Revoke object URL on cleanup
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, []);

  return {
    state: {
      isPlaying,
      currentTime,
      duration,
      volume,
      isLoading,
      error,
    },
    controls: {
      play,
      pause,
      stop,
      seek,
      setVolume,
      loadAudio,
    },
    audioRef,
  };
}
