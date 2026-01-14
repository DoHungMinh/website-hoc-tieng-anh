import UserPracticeSession, { IWordScore } from '../models/UserPracticeSession';
import { speechaceService } from './speechaceService';
import { CloudinaryService } from './cloudinaryService';
import { WhisperService } from './whisperService';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Scoring Result Interface
 */
export interface ScoringResult {
  transcript: string;
  overallScore: number;
  fluencyScore?: number;
  pronunciationScore?: number;
  wordScores: IWordScore[];
  sessionId: string;
  userAudioUrl: string;
  recordingDuration: number;
  completedAt?: Date;
}

/**
 * Pronunciation Scoring Service
 * Service chính xử lý chấm điểm phát âm
 */
export class PronunciationScoringService {
  private cloudinaryService: CloudinaryService;
  private whisperService: WhisperService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
    this.whisperService = new WhisperService();
  }

  /**
   * Score user's pronunciation recording
   * @param userId - User ID
   * @param promptIndex - Prompt index (0-15)
   * @param promptText - Reference text
   * @param audioFilePath - Local path to audio file
   * @returns Scoring result
   */
  async scoreUserRecording(
    userId: string,
    promptIndex: number,
    promptText: string,
    audioFilePath: string
  ): Promise<ScoringResult> {
    try {
      console.log('🎯 Starting pronunciation scoring...');
      console.log('👤 User ID:', userId);
      console.log('📝 Prompt:', promptText);

      // 1. Upload user audio to Cloudinary first (for permanent storage)
      console.log('☁️ Uploading user audio to Cloudinary...');
      const cloudinaryResult = await this.cloudinaryService.uploadAudio(
        audioFilePath,
        {
          folder: 'user-recordings',
          publicId: `user-${userId}-prompt-${promptIndex}-${Date.now()}`,
          userId,
          sessionId: `session-${Date.now()}`,
        }
      );
      console.log('✅ User audio uploaded:', cloudinaryResult.secureUrl);

      // 2. Download MP3 from Cloudinary for Speechace (Speechace requires MP3/WAV)
      console.log('📥 Downloading MP3 from Cloudinary for Speechace...');
      const mp3Path = await this.downloadAudioFromCloudinary(
        cloudinaryResult.secureUrl,
        userId,
        promptIndex
      );
      console.log('✅ MP3 downloaded:', mp3Path);

      // 3. Call Speechace API for pronunciation scoring using MP3 file
      console.log('🎯 Calling Speechace API...');
      const speechaceResult = await speechaceService.scoreAudio(
        mp3Path,
        promptText,
        userId
      );

      // 4. Call Whisper API for transcription (using original file)
      console.log('📝 Calling Whisper API for transcription...');
      let transcript = '';
      try {
        transcript = await this.whisperService.transcribeAudio(audioFilePath, 'en');
        console.log('✅ Transcript:', transcript);
      } catch (transcriptError: unknown) {
        const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
        console.warn('⚠️ Whisper transcription failed:', errorMessage);
        transcript = promptText; // Fallback to original text
      }

      // 4. Parse word scores
      const wordScores = speechaceService.parseWordScores(
        speechaceResult.text_score.word_score_list  // Fixed: API returns 'word_score_list' not 'words_score_list'
      );

      // 5. Save session to database
      console.log('💾 Saving practice session to database...');
      const session = await UserPracticeSession.create({
        userId,
        promptIndex,
        userAudioUrl: cloudinaryResult.secureUrl,
        userAudioPublicId: cloudinaryResult.publicId,
        transcript,
        overallScore: speechaceResult.text_score.quality_score,
        fluencyScore: speechaceResult.text_score.fluency_score,
        pronunciationScore: speechaceResult.text_score.pronunciation_score,
        wordScores,
        recordingDuration: cloudinaryResult.duration,
        completedAt: new Date(),
      });

      console.log('✅ Pronunciation scoring completed successfully');
      console.log('📊 Overall Score:', speechaceResult.text_score.quality_score);

      // 6. Clean up temporary files
      try {
        if (fs.existsSync(mp3Path)) {
          fs.unlinkSync(mp3Path);
          console.log('🗑️ Cleaned up downloaded MP3:', mp3Path);
        }
      } catch (cleanupError: unknown) {
        const errorMessage = cleanupError instanceof Error ? cleanupError.message : 'Unknown error';
        console.warn('⚠️ Failed to cleanup MP3 file:', errorMessage);
      }

      return {
        transcript,
        overallScore: speechaceResult.text_score.quality_score,
        fluencyScore: speechaceResult.text_score.fluency_score,
        pronunciationScore: speechaceResult.text_score.pronunciation_score,
        wordScores,
        sessionId: session._id,
        userAudioUrl: cloudinaryResult.secureUrl,
        recordingDuration: cloudinaryResult.duration,
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Pronunciation scoring failed:', errorMessage);
      throw error;
    }
  }

  /**
   * Get user's practice history
   */
  async getUserPracticeHistory(
    userId: string,
    limit: number = 10
  ): Promise<Array<{
    sessionId: string;
    promptIndex: number;
    overallScore: number;
    completedAt: Date;
    transcript: string;
  }>> {
    try {
      const sessions = await UserPracticeSession.find({ userId })
        .select('_id promptIndex overallScore completedAt transcript')
        .sort({ completedAt: -1 })
        .limit(limit);

      return sessions.map(s => ({
        sessionId: s._id,
        promptIndex: s.promptIndex,
        overallScore: s.overallScore,
        completedAt: s.completedAt,
        transcript: s.transcript,
      }));

    } catch (error: any) {
      console.error('❌ Failed to get practice history:', error.message);
      throw error;
    }
  }

  /**
   * Get latest session for specific prompt
   */
  async getLatestSession(
    userId: string,
    promptIndex: number
  ): Promise<ScoringResult | null> {
    try {
      console.log(`🔍 Fetching latest session for user ${userId}, prompt ${promptIndex}`);
      
      const session = await UserPracticeSession
        .findOne({ userId, promptIndex })
        .sort({ completedAt: -1 })
        .limit(1);

      if (!session) {
        console.log('ℹ️ No history found for this prompt');
        return null;
      }

      console.log(`✅ Found session from ${session.completedAt}`);

      return {
        transcript: session.transcript,
        overallScore: session.overallScore,
        fluencyScore: session.fluencyScore,
        pronunciationScore: session.pronunciationScore,
        wordScores: session.wordScores,
        sessionId: session._id,
        userAudioUrl: session.userAudioUrl,
        recordingDuration: session.recordingDuration,
        completedAt: session.completedAt,
      };

    } catch (error: any) {
      console.error('❌ Failed to get latest session:', error.message);
      throw error;
    }
  }

  /**
   * Get session detail by ID
   */
  async getSessionDetail(sessionId: string): Promise<ScoringResult | null> {
    try {
      const session = await UserPracticeSession.findById(sessionId);
      
      if (!session) {
        return null;
      }

      return {
        transcript: session.transcript,
        overallScore: session.overallScore,
        fluencyScore: session.fluencyScore,
        pronunciationScore: session.pronunciationScore,
        wordScores: session.wordScores,
        sessionId: session._id,
        userAudioUrl: session.userAudioUrl,
        recordingDuration: session.recordingDuration,
        completedAt: session.completedAt,
      };

    } catch (error: any) {
      console.error('❌ Failed to get session detail:', error.message);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completedPrompts: number[];
  }> {
    try {
      const sessions = await UserPracticeSession.find({ userId });

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          completedPrompts: [],
        };
      }

      const scores = sessions.map(s => s.overallScore);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const completedPrompts = [...new Set(sessions.map(s => s.promptIndex))];

      return {
        totalSessions: sessions.length,
        averageScore: Math.round(averageScore),
        highestScore,
        lowestScore,
        completedPrompts,
      };

    } catch (error: any) {
      console.error('❌ Failed to get user stats:', error.message);
      throw error;
    }
  }

  /**
   * Download audio file from Cloudinary for Speechace API
   * Speechace requires MP3/WAV format, Cloudinary auto-converts to MP3
   */
  private async downloadAudioFromCloudinary(
    audioUrl: string,
    userId: string,
    promptIndex: number
  ): Promise<string> {
    try {
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const tempDir = path.join(__dirname, '../../temp/audio');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `cloudinary-mp3-${userId}-${promptIndex}-${Date.now()}.mp3`;
      const filePath = path.join(tempDir, fileName);

      fs.writeFileSync(filePath, Buffer.from(response.data));
      
      console.log('✅ Downloaded MP3 from Cloudinary:', filePath);
      return filePath;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to download audio from Cloudinary:', errorMessage);
      throw new Error(`Failed to download MP3: ${errorMessage}`);
    }
  }
}

// Export singleton instance
export const pronunciationScoringService = new PronunciationScoringService();
