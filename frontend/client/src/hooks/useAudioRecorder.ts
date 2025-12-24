import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

export interface UseAudioRecorderReturn {
  state: AudioRecorderState;
  controls: AudioRecorderControls;
}

// Chrome MediaRecorder works best with WebM
// MP4 with Opus codec is not standard and causes playback issues
const SUPPORTED_MIME_TYPES = [
  'audio/webm',          // Best compatibility with Chrome + Whisper
  'audio/webm;codecs=opus', // Opus is good for speech
  'audio/ogg;codecs=opus',
  'audio/wav',
];

function getSupportedMimeType(): string {
  console.log('🔍 Checking supported MIME types...');
  for (const mimeType of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log('✅ Selected MIME type:', mimeType);
      return mimeType;
    } else {
      console.log('❌ Not supported:', mimeType);
    }
  }
  console.warn('⚠️ No ideal MIME type found, using fallback: audio/webm');
  return 'audio/webm'; // Fallback
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission with MAXIMUM quality settings for speech
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,     // Remove echo
          noiseSuppression: true,     // Remove background noise
          autoGainControl: true,      // Auto adjust volume
          sampleRate: 48000,          // High quality sample rate
          sampleSize: 16,             // 16-bit depth
          channelCount: 1,            // Mono for speech (smaller file, better for STT)
        } 
      });

      const mimeType = getSupportedMimeType();
      console.log('🎙️ useAudioRecorder: Selected mimeType:', mimeType);
      
      // CRITICAL: Higher bitrate for better speech recognition
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000,
      });
      
      // ⭐ DEBUG: Check if mic is actually capturing audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Check audio level periodically
      const checkAudioLevel = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > 5) {  // Threshold > 5 means sound detected
          console.log('🎤 Audio level detected:', average.toFixed(2));
        } else {
          console.warn('⚠️ No audio detected! Mic might not be working or muted.');
        }
      }, 1000); // Check every second

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      
      // Store checker to clear later
      (mediaRecorder as unknown as { audioLevelChecker?: NodeJS.Timeout }).audioLevelChecker = checkAudioLevel;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('🎙️ useAudioRecorder: Data chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        } else {
          console.warn('⚠️ useAudioRecorder: Empty data chunk received');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🎙️ useAudioRecorder: MediaRecorder stopped, chunks:', audioChunksRef.current.length);
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('🎙️ useAudioRecorder: Final blob created, size:', blob.size, 'bytes');
        
        // Warning if blob is suspiciously small for speech
        if (blob.size < 10000) { // Less than 10KB
          console.warn('⚠️ Audio blob is very small! Microphone might not be working properly or volume too low.');
        }
        
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        // Clear audio level checker
        const checker = (mediaRecorder as unknown as { audioLevelChecker?: NodeJS.Timeout }).audioLevelChecker;
        if (checker) {
          clearInterval(checker);
        }
      };

      mediaRecorder.start(100); // Request data every 100ms for better capture
      console.log('🎙️ useAudioRecorder: MediaRecorder started, mimeType:', mimeType);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
        setRecordingTime(Math.floor(elapsed / 1000));
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        console.log('🎙️ useAudioRecorder: Stopping MediaRecorder...');
        
        // Set up one-time listener for stop event
        const handleStop = () => {
          console.log('🎙️ useAudioRecorder: Stop event fired');
          console.log('🎙️ useAudioRecorder: Chunks collected:', audioChunksRef.current.length);
          
          // Small delay to ensure all data is flushed
          setTimeout(() => {
            const finalBlob = audioChunksRef.current.length > 0 
              ? new Blob(audioChunksRef.current, { type: getSupportedMimeType() })
              : null;
            
            if (finalBlob) {
              console.log('🎙️ useAudioRecorder: Final blob created, size:', finalBlob.size, 'bytes');
            }
            
            resolve(finalBlob);
          }, 100); // 100ms delay to ensure data is flushed
        };

        mediaRecorderRef.current.addEventListener('stop', handleStop, { once: true });
        
        // Request final data before stopping
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
          console.log('🎙️ useAudioRecorder: Requested final data chunk');
        }
        
        // Stop after small delay to ensure requestData is processed
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }, 50);
        
        setIsRecording(false);
        setIsPaused(false);
      } else {
        console.log('🎙️ useAudioRecorder: Not recording, nothing to stop');
        resolve(null);
      }
    });
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, [isRecording, isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current;
    }
  }, [isRecording, isPaused]);

  // Clear recording
  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setError(null);
    audioChunksRef.current = [];
  }, [audioUrl]);

  return {
    state: {
      isRecording,
      isPaused,
      recordingTime,
      audioBlob,
      audioUrl,
      error,
    },
    controls: {
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      clearRecording,
    },
  };
}
