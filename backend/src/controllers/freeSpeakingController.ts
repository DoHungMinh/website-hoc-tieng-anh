import { Request, Response } from 'express';
import { pronunciationScoringService } from '../services/pronunciationScoringService';
import * as fs from 'fs';

/**
 * Free Speaking Controller
 * Xử lý các request liên quan đến Free Speaking practice
 */
export const freeSpeakingController = {

  /**
   * POST /api/free-speaking/score
   * Score user's free speaking recording
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required',
        });
      }

      const { topicId, topicTitle, questions } = req.body;

      if (!topicId || !topicTitle || !questions) {
        return res.status(400).json({
          success: false,
          error: 'topicId, topicTitle, and questions are required',
        });
      }

      // Parse questions từ JSON string
      let questionsArray: string[];
      try {
        questionsArray = JSON.parse(questions);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid questions format. Must be JSON array.',
        });
      }

      console.log('🎤 Free Speaking scoring request');
      console.log('👤 User:', userId);
      console.log('📝 Topic:', topicTitle);
      console.log('❓ Questions:', questionsArray);

      // Score recording
      const result = await pronunciationScoringService.scoreFreeSpeaking(
        userId,
        topicId,
        topicTitle,
        questionsArray,
        req.file.path
      );

      return res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('❌ Free speaking scoring failed:', error);

      // Clean up file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup file:', cleanupError);
        }
      }

      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Scoring failed',
      });
    }
  },

  /**
   * GET /api/free-speaking/latest/:topicId
   * Get latest session for specific topic
   */
  async getLatestSession(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const { topicId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      console.log(`🔍 Fetching latest session for user ${userId}, topic ${topicId}`);

      const session = await pronunciationScoringService.getLatestFreeSpeakingSession(
        userId,
        topicId
      );

      if (!session) {
        return res.json({
          success: true,
          data: null,
        });
      }

      return res.json({
        success: true,
        data: session,
      });

    } catch (error) {
      console.error('❌ Failed to get latest session:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch session',
      });
    }
  },

  /**
   * GET /api/free-speaking/history
   * Get user's free speaking history
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

      const limit = parseInt(req.query.limit as string) || 20;

      console.log(`📚 Fetching Free Speaking history for user ${userId}`);

      const sessions = await pronunciationScoringService.getFreeSpeakingHistory(
        userId,
        limit
      );

      return res.json({
        success: true,
        data: sessions,
      });

    } catch (error) {
      console.error('❌ Failed to get history:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      });
    }
  },
};
