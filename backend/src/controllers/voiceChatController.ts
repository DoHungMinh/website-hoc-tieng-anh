import { Request, Response } from 'express';
import { voiceChatService } from '../services/voiceChatService';
import { whisperService } from '../services/whisperService';
import { ttsService } from '../services/ttsService';
import { User } from '../models/User';
import { Progress } from '../models/Progress';
import { Assessment } from '../models/Assessment';
import IELTSTestResult from '../models/IELTSTestResult';
import fs from 'fs';
import path from 'path';

/**
 * Voice Chat Controller
 * Xử lý các requests liên quan đến voice chat
 */
export const voiceChatController = {
  
  /**
   * POST /api/voice/chat
   * Main endpoint cho voice chat - xử lý toàn bộ flow STT → AI → TTS
   */
  async processVoiceChat(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required for voice chat',
        });
      }

      // Check if audio file uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required',
        });
      }

      const audioFilePath = req.file.path;
      const voicePreference = (req.body.voice || 'alloy') as any;

      console.log('🎙️ Voice chat request from user:', userId);
      console.log('📁 Audio file:', audioFilePath);
      console.log('🔊 Voice preference:', voicePreference);

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Get learning data for context
      const progress = await Progress.findOne({ userId });
      const recentAssessments = await Assessment.find({
        userId,
        status: 'completed',
      })
        .sort({ completedAt: -1 })
        .limit(5);

      const ieltsResults = await IELTSTestResult.find({ userId })
        .sort({ completedAt: -1 })
        .limit(10);

      const learningData = {
        user,
        progress: progress || ({} as any),
        recentAssessments,
        stats: {
          ieltsCount: ieltsResults.length,
          averageScore:
            ieltsResults.length > 0
              ? ieltsResults.reduce((sum, r) => sum + (r.score.bandScore || 0), 0) /
                ieltsResults.length
              : 0,
        },
      };

      // Get conversation history from body (if any)
      let conversationHistory: Array<{ role: string; content: string }> = [];
      
      if (req.body.history) {
        try {
          // Parse if it's a JSON string
          conversationHistory = typeof req.body.history === 'string' 
            ? JSON.parse(req.body.history) 
            : req.body.history;
          
          // Validate it's an array
          if (!Array.isArray(conversationHistory)) {
            console.warn('⚠️ History is not an array, resetting to empty');
            conversationHistory = [];
          }
          
          console.log('📜 Conversation history loaded:', conversationHistory.length, 'messages');
        } catch (error) {
          console.error('❌ Failed to parse conversation history:', error);
          conversationHistory = [];
        }
      }

      // Process voice chat
      const result = await voiceChatService.processVoiceChat(
        audioFilePath,
        user,
        learningData,
        conversationHistory,
        voicePreference
      );

      if (!result.success) {
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            error: result.error || 'Voice chat processing failed',
          });
        }
        return;
      }

      // Read audio file và convert to base64 để gửi về frontend
      const audioBuffer = fs.readFileSync(result.audioPath!);
      const audioBase64 = audioBuffer.toString('base64');

      // Delete audio file sau khi đã convert
      await ttsService.deleteAudioFile(result.audioPath!);

      // Only send response if headers haven't been sent (timeout protection)
      if (!res.headersSent) {
        return res.json({
          success: true,
          transcript: result.transcript,
          response: result.responseText,
          audioData: audioBase64,
          sessionId: 'voice-' + Date.now(), // Generate session ID
          processingTime: result.processingTimeMs,
          estimatedCost: 0.001, // Approximate cost per request
        });
      }
      
      console.warn('⚠️ Response already sent (likely timeout), skipping response');
      return;
      
    } catch (error) {
      console.error('❌ Voice chat error:', error);
      
      // Log chi tiết để debug
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Only send error response if headers haven't been sent
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Voice chat failed',
        });
      }
      return;
    }
  },

  /**
   * POST /api/voice/transcribe
   * Chỉ transcribe audio thành text (không dùng AI)
   */
  async transcribeOnly(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required',
        });
      }

      const audioFilePath = req.file.path;
      console.log('🎤 Transcription request for:', audioFilePath);

      // Transcribe
      const transcript = await whisperService.transcribeWithRetry(
        audioFilePath,
        'en',
        2
      );

      return res.json({
        success: true,
        data: {
          transcript,
          length: transcript.length,
        },
      });

    } catch (error) {
      console.error('❌ Transcription error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      });
    }
  },

  /**
   * POST /api/voice/speak
   * Chỉ convert text thành speech (không dùng STT/AI)
   */
  async speakText(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { text, voice, speed } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
        });
      }

      console.log('🔊 TTS request:', text.substring(0, 50) + '...');

      // Convert to speech
      const audioPath = await ttsService.textToSpeechWithRetry(
        text,
        voice || 'alloy',
        speed || 1.0,
        2
      );

      // Read và convert to base64
      const audioBuffer = fs.readFileSync(audioPath);
      const audioBase64 = audioBuffer.toString('base64');

      // Cleanup
      await ttsService.deleteAudioFile(audioPath);

      return res.json({
        success: true,
        data: {
          audioBase64,
          textLength: text.length,
        },
      });

    } catch (error) {
      console.error('❌ TTS error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'TTS failed',
      });
    }
  },

  /**
   * GET /api/voice/voices
   * Lấy danh sách voices available
   */
  async getAvailableVoices(req: Request, res: Response) {
    try {
      const voices = ttsService.getAvailableVoices();

      return res.json({
        success: true,
        data: {
          voices,
          count: voices.length,
        },
      });

    } catch (error) {
      console.error('❌ Get voices error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get available voices',
      });
    }
  },

  /**
   * GET /api/voice/test
   * Test endpoint để check voice chat service hoạt động
   */
  async testVoiceService(req: Request, res: Response) {
    try {
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

      return res.json({
        success: true,
        data: {
          status: 'Voice chat service is running',
          openAIConfigured: hasOpenAIKey,
          services: {
            whisper: 'Ready',
            tts: 'Ready',
            voiceChat: 'Ready',
          },
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Service test failed',
      });
    }
  },
};
