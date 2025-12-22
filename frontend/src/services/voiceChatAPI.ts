import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';

export type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceChatResponse {
  success: boolean;
  transcript: string;
  response: string;
  audioData: string; // Base64 encoded audio
  sessionId: string;
  processingTime: number;
  estimatedCost: number;
  error?: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
  description: string;
  gender: string;
}

class VoiceChatAPI {
  private getAuthHeaders(): HeadersInit {
    // Try both token keys for compatibility
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
    console.log('🔑 Voice Chat API - Token:', token ? 'Found' : 'Not found');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Send audio for voice chat (STT → AI → TTS)
   */
  async sendVoiceMessage(
    audioBlob: Blob,
    voice: string = 'alloy',
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<VoiceChatResponse> {
    try {
      console.log('🌐 Voice Chat API - Sending request to:', `${API_BASE_URL}/voice/chat`);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('voice', voice);
      if (conversationHistory.length > 0) {
        formData.append('history', JSON.stringify(conversationHistory));
      }

      console.log('📋 FormData prepared:', {
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        voice,
        historyLength: conversationHistory.length
      });

      const response = await fetch(`${API_BASE_URL}/voice/chat`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      console.log('📡 Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Voice chat failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Voice chat API error:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio only (no AI response)
   */
  async transcribeAudio(audioBlob: Blob): Promise<{
    success: boolean;
    data?: { transcript: string; length: number };
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Transcription API error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech only
   */
  async textToSpeech(
    text: string,
    voice: string = 'alloy',
    speed: number = 1.0
  ): Promise<{
    success: boolean;
    data?: { audioBase64: string; textLength: number };
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/speak`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice, speed }),
      });

      return await response.json();
    } catch (error) {
      console.error('TTS API error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<VoiceOption[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/voices`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get voices');
      }

      // Return array of voice options from backend response
      return data.voices || ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    } catch (error) {
      console.error('Get voices API error:', error);
      // Fallback to default voices
      return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    }
  }

  /**
   * Test voice service
   */
  async testService(): Promise<{
    success: boolean;
    data?: {
      status: string;
      openAIConfigured: boolean;
      services: {
        whisper: string;
        tts: string;
        voiceChat: string;
      };
      timestamp: string;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/test`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Test service error:', error);
      throw error;
    }
  }
}

export const voiceChatAPI = new VoiceChatAPI();
