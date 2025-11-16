import { whisperService } from './whisperService';
import { ttsService } from './ttsService';
import { AIService } from './aiService';
import { IUser } from '../models/User';
import { IProgress } from '../models/Progress';

/**
 * Voice Chat Service - Orchestrate toàn bộ luồng voice chat
 * STT → AI Processing → TTS
 */
export class VoiceChatService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Process complete voice chat flow
   * @param audioFilePath - Đường dẫn file audio input
   * @param user - User data
   * @param learningData - Learning context
   * @param conversationHistory - Chat history
   * @param voicePreference - Voice preference
   * @returns Object chứa transcript, response text, và audio file path
   */
  async processVoiceChat(
    audioFilePath: string,
    user: IUser,
    learningData: {
      user: IUser;
      progress: IProgress;
      recentAssessments: any[];
      stats: any;
    },
    conversationHistory: Array<{ role: string; content: string }> = [],
    voicePreference: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'
  ) {
    const startTime = Date.now();
    
    try {
      console.log('🎙️ Starting voice chat processing for user:', user.email);

      // STEP 1: Speech to Text (STT)
      console.log('📝 Step 1/3: Transcribing audio...');
      
      // Auto-detect language or use 'undefined' to let Whisper detect
      const transcript = await whisperService.transcribeWithRetry(audioFilePath, undefined as any, 2);
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcription returned empty result');
      }

      console.log('✅ Transcript:', transcript);

      // STEP 2: AI Processing
      console.log('🤖 Step 2/3: Generating AI response...');
      const aiResponse = await this.aiService.generateChatResponse(
        transcript,
        learningData,
        conversationHistory
      );

      console.log('✅ AI Response:', aiResponse.substring(0, 100) + '...');

      // STEP 3: Text to Speech (TTS)
      console.log('🔊 Step 3/3: Converting to speech...');
      const audioResponsePath = await ttsService.textToSpeechWithRetry(
        aiResponse,
        voicePreference,
        1.0, // Normal speed
        2 // Max retries
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ Voice chat completed in ${processingTime}ms`);

      return {
        success: true,
        transcript: transcript,
        responseText: aiResponse,
        audioPath: audioResponsePath,
        processingTimeMs: processingTime,
        metadata: {
          transcriptLength: transcript.length,
          responseLength: aiResponse.length,
          voice: voicePreference,
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Voice chat processing failed:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: processingTime,
      };
    }
  }

  /**
   * Quick voice response (không dùng AI, dùng pre-defined responses)
   * Dùng khi AI API fail hoặc user hết quota
   */
  async processQuickVoiceResponse(
    audioFilePath: string,
    voicePreference: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'
  ) {
    try {
      // Transcribe
      const transcript = await whisperService.transcribeWithRetry(audioFilePath, 'en', 2);

      // Simple rule-based response
      let response = this.generateRuleBasedResponse(transcript);

      // TTS
      const audioPath = await ttsService.textToSpeechWithRetry(response, voicePreference, 1.0, 2);

      return {
        success: true,
        transcript,
        responseText: response,
        audioPath,
        isQuickResponse: true,
      };

    } catch (error) {
      console.error('❌ Quick voice response failed:', error);
      throw error;
    }
  }

  /**
   * Rule-based response (fallback khi AI không available)
   */
  private generateRuleBasedResponse(message: string): string {
    const lower = message.toLowerCase();

    // Greetings
    if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
      return "Hello! How can I help you with your English learning today?";
    }

    // Help requests
    if (lower.includes('help') || lower.includes('assist')) {
      return "I'm here to help you practice English conversation. You can ask me about grammar, vocabulary, or just practice speaking!";
    }

    // Goodbye
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you')) {
      return "Goodbye! Keep practicing and you'll improve quickly. See you soon!";
    }

    // Practice request
    if (lower.includes('practice') || lower.includes('learn')) {
      return "Great! Let's practice together. Try speaking about any topic you like, and I'll help you improve your English.";
    }

    // Default response
    return "I understand. Could you please elaborate a bit more so I can help you better with your English learning?";
  }

  /**
   * Validate voice chat request
   */
  validateVoiceChatRequest(
    audioFilePath: string,
    user: IUser,
    maxDurationSeconds: number = 60
  ): { valid: boolean; error?: string } {
    // Check audio file
    if (!whisperService.validateAudioFile(audioFilePath, 25)) {
      return { valid: false, error: 'Invalid audio file format or size' };
    }

    // Check user quota (nếu có implement)
    // if (user voiceMinutesUsed > limit) {
    //   return { valid: false, error: 'Voice chat quota exceeded' };
    // }

    return { valid: true };
  }

  /**
   * Calculate cost của voice chat session
   */
  calculateSessionCost(transcriptDuration: number, responseLength: number): {
    sttCost: number;
    ttsCost: number;
    totalCost: number;
  } {
    const sttCost = whisperService.estimateCost(transcriptDuration);
    const ttsCost = ttsService.estimateCost(responseLength);
    
    return {
      sttCost,
      ttsCost,
      totalCost: sttCost + ttsCost,
    };
  }
}

export const voiceChatService = new VoiceChatService();
