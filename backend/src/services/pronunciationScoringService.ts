import UserPracticeSession, { IWordScore } from '../models/UserPracticeSession';
import FreeSpeakingSession from '../models/FreeSpeakingSession';
import { speechaceService } from './speechaceService';
import { CloudinaryService } from './cloudinaryService';
import { WhisperService } from './whisperService';
import OpenAI from 'openai';
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
 * Free Speaking Result Interface
 */
export interface FreeSpeakingResult {
  sessionId: string;
  transcript: string;
  scores: {
    overall: number;
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
  };
  wordScores: Array<{
    word: string;
    score: number;
    startTime: number;
    endTime: number;
    pauseAfter?: boolean;
    phoneScores: Array<{
      phone: string;
      soundMostLike: string;
      score: number;
    }>;
  }>;
  metrics: {
    badPauses: number;
    accuracy: number;
  };
  userAudioUrl: string;
}

/**
 * Pronunciation Scoring Service
 * Service chính xử lý chấm điểm phát âm
 */
export class PronunciationScoringService {
  private cloudinaryService: CloudinaryService;
  private whisperService: WhisperService;
  private openai: OpenAI;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
    this.whisperService = new WhisperService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
   * ═══════════════════════════════════════════════════════════════════
   * FREE SPEAKING - Score recording với IELTS criteria
   * ═══════════════════════════════════════════════════════════════════
   */
  async scoreFreeSpeaking(
    userId: string,
    topicId: string,
    topicTitle: string,
    questions: string[],
    audioFilePath: string
  ): Promise<FreeSpeakingResult> {
    try {
      console.log('🎤 Starting Free Speaking scoring...');
      console.log('👤 User ID:', userId);
      console.log('📝 Topic:', topicTitle);

      // ═══════════════════════════════════════════════════════════════
      // STEP 1: Upload to Cloudinary
      // ═══════════════════════════════════════════════════════════════
      console.log('☁️ Uploading audio to Cloudinary...');
      const cloudinaryResult = await this.cloudinaryService.uploadAudio(
        audioFilePath,
        {
          folder: 'free-speaking-recordings',
          publicId: `user-${userId}-topic-${topicId}-${Date.now()}`,
        }
      );
      console.log('✅ Audio uploaded:', cloudinaryResult.secureUrl);

      // ═══════════════════════════════════════════════════════════════
      // STEP 2: Download MP3 for Speechace
      // ═══════════════════════════════════════════════════════════════
      console.log('📥 Downloading MP3 from Cloudinary for Speechace...');
      const mp3Path = await this.downloadAudioFromCloudinary(
        cloudinaryResult.secureUrl,
        userId,
        topicId
      );

      // ═══════════════════════════════════════════════════════════════
      // STEP 3: Score with Speechace v9 Open-ended Speech API
      // This API provides:
      // - Automatic transcription (no need for Whisper)
      // - Full IELTS scores: pronunciation, fluency, vocab, grammar, coherence
      // - Word-level analysis with timing
      // ═══════════════════════════════════════════════════════════════
      console.log('🎯 Scoring with Speechace v9 Open-ended Speech API...');
      const speechaceResult = await speechaceService.scoreOpenEndedSpeech(
        mp3Path,
        userId,
        true  // include IELTS feedback
      );

      // Extract data from v9 API response
      const transcript = speechaceResult.speech_score.transcript;
      const ieltsScores = speechaceResult.speech_score.ielts_score;

      console.log('📊 Speechace v9 IELTS Scores:');
      console.log('  - Overall:', ieltsScores.overall);
      console.log('  - Pronunciation:', ieltsScores.pronunciation);
      console.log('  - Fluency:', ieltsScores.fluency);
      console.log('  - Vocabulary:', ieltsScores.vocab);
      console.log('  - Grammar:', ieltsScores.grammar);
      console.log('  - Coherence:', ieltsScores.coherence);
      console.log('📝 Transcript:', transcript);

      // ═══════════════════════════════════════════════════════════════
      // STEP 4: Parse word scores & Extract timing
      // ═══════════════════════════════════════════════════════════════
      const wordScores = speechaceService.parseWordScores(
        speechaceResult.speech_score.word_score_list
      );

      // ═══════════════════════════════════════════════════════════════
      // STEP 5: Detect pauses from timing gaps
      // ═══════════════════════════════════════════════════════════════
      const pauseInfo = this.detectPausesFromExtent(wordScores);
      console.log('⏸️ Bad pauses detected:', pauseInfo.badPauses);

      // ═══════════════════════════════════════════════════════════════
      // STEP 6: Prepare final IELTS scores
      // Use scores directly from Speechace v9 API (already in IELTS 0-9 scale)
      // Note: We use 4 main criteria for overall score (matching IELTS Speaking)
      // ═══════════════════════════════════════════════════════════════
      const finalScores = {
        pronunciation: this.round(ieltsScores.pronunciation),
        fluency: this.round(ieltsScores.fluency),
        vocabulary: this.round(ieltsScores.vocab),
        grammar: this.round(ieltsScores.grammar),
        overall: 0,
      };

      // Calculate overall as average of 4 main criteria
      // (Coherence is bonus metric, not included in overall for IELTS Speaking)
      finalScores.overall = this.round(
        (finalScores.pronunciation + finalScores.fluency +
          finalScores.vocabulary + finalScores.grammar) / 4
      );

      console.log('📊 Final IELTS Scores:', finalScores);

      // ═══════════════════════════════════════════════════════════════
      // STEP 7: Calculate metrics
      // ═══════════════════════════════════════════════════════════════
      const metrics = {
        badPauses: pauseInfo.badPauses,
        accuracy: this.calculateAccuracy(wordScores),
      };

      console.log('📈 Metrics:', metrics);

      // ═══════════════════════════════════════════════════════════════
      // STEP 8: Save to Database
      // ═══════════════════════════════════════════════════════════════
      console.log('💾 Saving Free Speaking session to database...');
      const session = await FreeSpeakingSession.create({
        userId,
        topicId,
        topicTitle,
        questions,
        userAudioUrl: cloudinaryResult.secureUrl,
        userAudioPublicId: cloudinaryResult.publicId,
        transcript,
        scores: finalScores,
        wordScores,
        metrics,
        recordingDuration: cloudinaryResult.duration,
        completedAt: new Date(),
      });

      console.log('✅ Free Speaking session saved:', session._id);

      // ═══════════════════════════════════════════════════════════════
      // STEP 9: Cleanup temp files
      // ═══════════════════════════════════════════════════════════════
      try {
        if (fs.existsSync(mp3Path)) {
          fs.unlinkSync(mp3Path);
        }
        if (fs.existsSync(audioFilePath)) {
          fs.unlinkSync(audioFilePath);
        }
        console.log('🗑️ Cleaned up temp files');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temp files:', cleanupError);
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 10: Return result
      // ═══════════════════════════════════════════════════════════════
      return {
        sessionId: session._id,
        transcript,
        scores: finalScores,
        wordScores,
        metrics,
        userAudioUrl: cloudinaryResult.secureUrl,
      };

    } catch (error) {
      console.error('❌ Free Speaking scoring failed:', error);
      throw error;
    }
  }

  /**
   * Get latest Free Speaking session for a topic
   */
  async getLatestFreeSpeakingSession(
    userId: string,
    topicId: string
  ): Promise<FreeSpeakingResult | null> {
    try {
      const session = await FreeSpeakingSession
        .findOne({ userId, topicId })
        .sort({ completedAt: -1 })
        .limit(1);

      if (!session) {
        return null;
      }

      return {
        sessionId: session._id,
        transcript: session.transcript,
        scores: session.scores,
        wordScores: session.wordScores,
        metrics: session.metrics,
        userAudioUrl: session.userAudioUrl,
      };

    } catch (error) {
      console.error('❌ Failed to get latest Free Speaking session:', error);
      throw error;
    }
  }

  /**
   * Get Free Speaking history for user
   */
  async getFreeSpeakingHistory(userId: string, limit: number = 20) {
    try {
      const sessions = await FreeSpeakingSession
        .find({ userId })
        .select('topicId topicTitle scores.overall completedAt')
        .sort({ completedAt: -1 })
        .limit(limit);

      return sessions;

    } catch (error) {
      console.error('❌ Failed to get Free Speaking history:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * HELPER METHODS for Free Speaking
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Score Vocabulary & Grammar với GPT-4
   */
  private async scoreWithGPT4(
    topicTitle: string,
    questions: string[],
    transcript: string
  ): Promise<{ vocabulary: number; grammar: number }> {
    try {
      const prompt = `You are an IELTS Speaking examiner. Evaluate this response:

**Topic:** ${topicTitle}

**Questions:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**User's Answer:**
"${transcript}"

Rate the following on IELTS scale (0-9):

1. **Vocabulary** (Lexical Resource):
   - Range (variety of words)
   - Accuracy (correct usage)
   - Appropriacy (suitable for topic)

2. **Grammar** (Grammatical Range and Accuracy):
   - Range (variety of structures)
   - Accuracy (correct usage)
   - Complexity (simple vs complex sentences)

Return ONLY valid JSON:
{
  "vocabulary": 7.5,
  "grammar": 6.0,
  "vocabulary_feedback": "Good range but some repetition",
  "grammar_feedback": "Mostly simple sentences, few errors"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',  // gpt-4o supports json_object response format
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        vocabulary: this.round(result.vocabulary || 6.0),
        grammar: this.round(result.grammar || 6.0),
      };

    } catch (error) {
      console.error('❌ GPT-4 scoring failed:', error);
      // Fallback to default scores
      return {
        vocabulary: 6.0,
        grammar: 6.0,
      };
    }
  }

  /**
   * Detect pauses từ word timing gaps
   * Gap > 500ms = pause
   */
  private detectPausesFromExtent(
    wordScores: IWordScore[]
  ): { badPauses: number; pausePositions: number[] } {
    let pauseCount = 0;
    const pausePositions: number[] = [];
    const PAUSE_THRESHOLD_MS = 500; // 500ms

    for (let i = 0; i < wordScores.length - 1; i++) {
      const currentWord = wordScores[i];
      const nextWord = wordScores[i + 1];

      if (!currentWord.endTime || !nextWord.startTime) {
        continue;
      }

      const gapMs = (nextWord.startTime - currentWord.endTime) * 1000;

      if (gapMs > PAUSE_THRESHOLD_MS) {
        pauseCount++;
        pausePositions.push(i);
        // Mark pause on current word
        (wordScores[i] as any).pauseAfter = true;

        console.log(`⏸️ Pause after "${currentWord.word}" (${gapMs.toFixed(0)}ms)`);
      }
    }

    return { badPauses: pauseCount, pausePositions };
  }

  /**
   * Convert Speechace (0-100) → IELTS (0-9)
   */
  private toIELTS(score: number | undefined): number {
    if (!score) return 0;
    const ielts = (score / 100) * 9;
    return this.round(ielts);
  }

  /**
   * Round to nearest 0.5 (IELTS format)
   */
  private round(num: number): number {
    return Math.round(num * 2) / 2;
  }

  /**
   * Calculate accuracy (% of words >= 70 score)
   */
  private calculateAccuracy(wordScores: IWordScore[]): number {
    if (wordScores.length === 0) return 0;
    const correct = wordScores.filter(w => w.score >= 70).length;
    return Math.round((correct / wordScores.length) * 100);
  }

  /**
   * Download audio file from Cloudinary for Speechace API
   * Speechace requires MP3/WAV format, Cloudinary auto-converts to MP3
   */
  private async downloadAudioFromCloudinary(
    audioUrl: string,
    userId: string,
    identifier: string | number
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

      const fileName = `cloudinary-mp3-${userId}-${identifier}-${Date.now()}.mp3`;
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
