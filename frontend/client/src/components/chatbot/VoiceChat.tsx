import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle, Play, Pause } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { VoiceVisualizer } from './VoiceVisualizer';
import { voiceChatAPI } from '@/services/voiceChatAPI';
import type { VoiceOption } from '@/services/voiceChatAPI';

interface VoiceChatProps {
  onTranscriptReceived?: (text: string) => void;
  onResponseReceived?: (text: string) => void;
  conversationHistory?: Array<{ role: string; content: string }>;
  className?: string;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  onTranscriptReceived,
  onResponseReceived,
  conversationHistory = [],
  className = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('nova');
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const recorder = useAudioRecorder();
  const player = useAudioPlayer();

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await voiceChatAPI.getAvailableVoices();
        setAvailableVoices(voices);
      } catch (err) {
        console.error('Failed to load voices:', err);
      }
    };
    loadVoices();
  }, []);

  // Handle recording start
  const handleStartRecording = async () => {
    console.log('🎤 Starting recording...');
    setError(null);
    setTranscript('');
    setAiResponse('');
    recorder.controls.clearRecording();

    try {
      await recorder.controls.startRecording();
      console.log('✅ Recording started successfully');
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError(
        'Microphone access denied or unavailable. Please:\n' +
        '1. Allow microphone permission in browser\n' +
        '2. Check if your microphone is working\n' +
        '3. Close other apps using the microphone'
      );
    }
  };

  // Handle recording stop and send to backend
  const handleStopRecording = async () => {
    console.log('🛑 Stopping recording...');

    try {
      // Check minimum duration
      if (recorder.state.recordingTime < 1) {
        setError('Please record for at least 1 second');
        recorder.controls.clearRecording();
        return;
      }

      // Wait for recorder to stop and return blob
      const audioBlob = await recorder.controls.stopRecording();

      if (audioBlob && audioBlob.size > 0) {
        console.log('📦 Audio blob ready, size:', audioBlob.size, 'bytes');

        // Check minimum blob size
        if (audioBlob.size < 1000) {
          setError('Recording too short or failed. Please speak for at least 1-2 seconds.');
          return;
        }

        await processVoiceMessage(audioBlob);
      } else {
        console.error('❌ No audio blob available or empty blob');
        setError('Failed to capture audio. Please try again and speak longer.');
      }
    } catch (err) {
      console.error('❌ Error stopping recording:', err);
      setError('Failed to stop recording. Please try again.');
    }
  };

  // Process voice message (full flow: STT → AI → TTS)
  const processVoiceMessage = async (audioBlob: Blob) => {
    console.log('🚀 Processing voice message...');
    console.log('📊 Audio blob details:', {
      size: audioBlob.size,
      type: audioBlob.type,
      sizeKB: (audioBlob.size / 1024).toFixed(2) + ' KB'
    });

    setIsProcessing(true);
    setError(null);

    try {
      console.log('📤 Sending to API:', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        voice: selectedVoice,
        historyLength: conversationHistory.length
      });

      const result = await voiceChatAPI.sendVoiceMessage(
        audioBlob,
        selectedVoice,
        conversationHistory
      );

      console.log('✅ API Response:', {
        transcript: result.transcript,
        responseLength: result.response.length,
        hasAudio: !!result.audioData
      });

      // Set transcript - ALWAYS show it!
      setTranscript(result.transcript);
      onTranscriptReceived?.(result.transcript);

      // Log what Whisper heard
      console.log('🎤 Whisper transcribed:', result.transcript);

      // Set AI response text
      setAiResponse(result.response);
      onResponseReceived?.(result.response);

      // Set cost
      setEstimatedCost(result.estimatedCost);

      // Play audio response
      if (result.audioData) {
        console.log('🔊 Playing audio response...');
        const audioBlob = base64ToBlob(result.audioData, 'audio/mpeg');
        player.controls.loadAudio(audioBlob);

        // Auto-play after a short delay
        setTimeout(() => {
          player.controls.play();
        }, 500);
      } else {
        console.warn('⚠️ No audio data in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process voice message';
      console.error('❌ Voice chat error:', err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert base64 to Blob
  const base64ToBlob = (base64: string, type: string): Blob => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`voice-chat-container ${className}`}>
      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Volume2 className="inline w-4 h-4 mr-1" />
          AI Voice
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={recorder.state.isRecording || isProcessing}
        >
          {availableVoices.map((voice) => (
            <option key={voice} value={voice}>
              {voice.charAt(0).toUpperCase() + voice.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        {/* Visualizer */}
        <div className="w-full flex justify-center">
          {recorder.state.isRecording || player.state.isPlaying ? (
            <VoiceVisualizer
              isActive={recorder.state.isRecording || player.state.isPlaying}
              color={recorder.state.isRecording ? '#000000' : '#333333'}
            />
          ) : (
            <div className="h-[60px]" /> // Placeholder
          )}
        </div>

        {/* Recording Time */}
        {recorder.state.isRecording && (
          <div className="flex flex-col items-center gap-1">
            <div className="text-lg font-mono text-gray-700">
              {formatTime(recorder.state.recordingTime)}
            </div>
            {recorder.state.recordingTime < 1 && (
              <div className="text-xs text-orange-500 font-medium animate-pulse">
                Keep speaking... (min 1 sec)
              </div>
            )}
            {recorder.state.recordingTime >= 1 && (
              <div className="text-xs text-black font-medium">
                ✓ Ready to send
              </div>
            )}
          </div>
        )}

        {/* Main Control Button */}
        <button
          onClick={recorder.state.isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200 shadow-lg
            ${recorder.state.isRecording
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-black hover:bg-gray-800'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : recorder.state.isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Status Text */}
        <div className="text-center text-sm text-gray-600">
          {isProcessing ? (
            'Processing your message...'
          ) : recorder.state.isRecording ? (
            'Recording... Click to stop'
          ) : (
            'Click to start recording'
          )}
        </div>
      </div>

      {/* Player Controls */}
      {player.state.duration > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI Response</span>
            <span className="text-xs text-gray-500">
              {formatTime(Math.floor(player.state.currentTime))} / {formatTime(Math.floor(player.state.duration))}
            </span>
          </div>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={player.state.duration}
            value={player.state.currentTime}
            onChange={(e) => player.controls.seek(Number(e.target.value))}
            className="w-full mb-2"
          />

          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <button
              onClick={player.state.isPlaying ? player.controls.pause : player.controls.play}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              {player.state.isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className={`mt-4 p-3 border rounded-lg ${transcript.toLowerCase().trim() === 'you' || transcript.toLowerCase().trim() === 'you...'
            ? 'bg-orange-50 border-orange-300'
            : 'bg-gray-50 border-gray-200'
          }`}>
          <p className={`text-xs font-semibold mb-1 ${transcript.toLowerCase().trim() === 'you' || transcript.toLowerCase().trim() === 'you...'
              ? 'text-orange-800'
              : 'text-gray-800'
            }`}>
            {transcript.toLowerCase().trim() === 'you' || transcript.toLowerCase().trim() === 'you...'
              ? '⚠️ Audio quality issue - Whisper only heard:'
              : 'You said:'
            }
          </p>
          <p className="text-sm text-gray-800">{transcript}</p>
          {(transcript.toLowerCase().trim() === 'you' || transcript.toLowerCase().trim() === 'you...') && (
            <p className="text-xs text-orange-600 mt-2">
              💡 Tip: Speak clearly and louder, close to microphone. Check mic permissions.
            </p>
          )}
        </div>
      )}

      {/* AI Response Display */}
      {aiResponse && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-800 mb-1">AI Response:</p>
          <p className="text-sm text-gray-800">{aiResponse}</p>
        </div>
      )}

      {/* Cost Display */}
      {estimatedCost > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Estimated cost: ${estimatedCost.toFixed(4)}
        </div>
      )}

      {/* Error Display */}
      {(error || recorder.state.error || player.state.error) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-xs text-red-600">
              {error || recorder.state.error || player.state.error}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!recorder.state.isRecording && !transcript && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-2">💡 How to use:</p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Choose your preferred AI voice</li>
            <li>Click the microphone to start recording</li>
            <li>Speak your question or message</li>
            <li>Click again to stop and process</li>
            <li>Listen to the AI's response</li>
          </ol>
        </div>
      )}
    </div>
  );
};
