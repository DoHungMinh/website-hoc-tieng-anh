import { Request, Response } from 'express';
import { pronunciationScoringService } from '../services/pronunciationScoringService';
import { promptAudioService } from '../services/promptAudioService';
import { wordAudioService } from '../services/wordAudioService';
import fs from 'fs';

/**
 * Pronunciation Controller
 * Xử lý các requests liên quan đến pronunciation practice
 */
export const pronunciationController = {
  
  /**
   * POST /api/pronunciation/score
   * Score user's pronunciation recording
   */
  async scoreRecording(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Check if audio file uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required',
        });
      }

      const { promptIndex, promptText } = req.body;

      if (promptIndex === undefined || !promptText) {
        return res.status(400).json({
          success: false,
          error: 'promptIndex and promptText are required',
        });
      }

      const audioFilePath = req.file.path;

      console.log('🎯 Pronunciation scoring request');
      console.log('👤 User:', userId);
      console.log('📝 Prompt Index:', promptIndex);
      console.log('🎤 Audio file:', audioFilePath);

      // Score the recording
      const result = await pronunciationScoringService.scoreUserRecording(
        userId,
        parseInt(promptIndex),
        promptText,
        audioFilePath
      );

      // Clean up temp file
      try {
        if (fs.existsSync(audioFilePath)) {
          fs.unlinkSync(audioFilePath);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp file:', cleanupError);
      }

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error: any) {
      console.error('❌ Pronunciation scoring error:', error);
      
      // Clean up temp file on error
      try {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp file:', cleanupError);
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to score pronunciation',
      });
    }
  },

  /**
   * GET /api/pronunciation/prompt-audio/:promptIndex
   * Get or generate audio for a specific prompt
   */
  async getPromptAudio(req: Request, res: Response) {
    try {
      const { promptIndex } = req.params;
      const { promptText } = req.query;

      if (!promptText) {
        return res.status(400).json({
          success: false,
          error: 'promptText query parameter is required',
        });
      }

      console.log(`🎵 Request for prompt audio: ${promptIndex}`);

      const result = await promptAudioService.getOrGeneratePromptAudio(
        parseInt(promptIndex),
        promptText as string
      );

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error: any) {
      console.error('❌ Get prompt audio error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get prompt audio',
      });
    }
  },

  /**
   * GET /api/pronunciation/word-audio/:word
   * Get or generate audio for a specific word
   */
  async getWordAudio(req: Request, res: Response) {
    try {
      const { word } = req.params;

      if (!word) {
        return res.status(400).json({
          success: false,
          error: 'Word parameter is required',
        });
      }

      console.log(`🔤 Request for word audio: "${word}"`);

      const result = await wordAudioService.getOrGenerateWordAudio(word);

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error: any) {
      console.error('❌ Get word audio error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get word audio',
      });
    }
  },

  /**
   * GET /api/pronunciation/history
   * Get user's practice history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const limit = parseInt(req.query.limit as string) || 10;

      console.log(`📚 Request for practice history: User ${userId}`);

      const history = await pronunciationScoringService.getUserPracticeHistory(
        userId,
        limit
      );

      return res.status(200).json({
        success: true,
        data: history,
      });

    } catch (error: any) {
      console.error('❌ Get history error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get practice history',
      });
    }
  },

  /**
   * GET /api/pronunciation/latest-session/:promptIndex
   * Get latest practice session for specific prompt
   */
  async getLatestSession(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { promptIndex } = req.params;
      const parsedPromptIndex = parseInt(promptIndex);

      if (isNaN(parsedPromptIndex) || parsedPromptIndex < 0 || parsedPromptIndex > 15) {
        return res.status(400).json({
          success: false,
          error: 'Invalid promptIndex. Must be between 0 and 15',
        });
      }

      console.log(`🔍 Request for latest session: User ${userId}, Prompt ${parsedPromptIndex}`);

      const session = await pronunciationScoringService.getLatestSession(
        userId,
        parsedPromptIndex
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'No history found for this prompt',
        });
      }

      return res.status(200).json({
        success: true,
        data: session,
      });

    } catch (error: any) {
      console.error('❌ Get latest session error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get latest session',
      });
    }
  },

  /**
   * GET /api/pronunciation/session/:sessionId
   * Get session detail by ID
   */
  async getSessionDetail(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      console.log(`🔍 Request for session detail: ${sessionId}`);

      const session = await pronunciationScoringService.getSessionDetail(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: session,
      });

    } catch (error: any) {
      console.error('❌ Get session detail error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get session detail',
      });
    }
  },

  /**
   * GET /api/pronunciation/stats
   * Get user statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      console.log(`📊 Request for user stats: ${userId}`);

      const stats = await pronunciationScoringService.getUserStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });

    } catch (error: any) {
      console.error('❌ Get stats error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user stats',
      });
    }
  },

  /**
   * GET /api/pronunciation/cached-prompts
   * Get all cached prompt audio
   */
  async getCachedPrompts(req: Request, res: Response) {
    try {
      console.log('📚 Request for cached prompts');

      const prompts = await promptAudioService.getAllCachedPrompts();

      return res.status(200).json({
        success: true,
        data: prompts,
      });

    } catch (error: any) {
      console.error('❌ Get cached prompts error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get cached prompts',
      });
    }
  },

  /**
   * GET /api/pronunciation/popular-words
   * Get most used words
   */
  async getPopularWords(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      console.log(`🔤 Request for popular words (limit: ${limit})`);

      const words = await wordAudioService.getMostUsedWords(limit);

      return res.status(200).json({
        success: true,
        data: words,
      });

    } catch (error: any) {
      console.error('❌ Get popular words error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get popular words',
      });
    }
  },
};

export default pronunciationController;
