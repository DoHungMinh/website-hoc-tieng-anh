import WordAudio from '../models/WordAudio';
import { TTSService } from './ttsService';
import { CloudinaryService } from './cloudinaryService';
import fs from 'fs';

/**
 * Word Audio Service
 * Quản lý audio từng từ (on-demand with cache)
 */
export class WordAudioService {
  private ttsService: TTSService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.ttsService = new TTSService();
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Get or generate word audio
   * @param word - Từ cần generate audio
   * @returns Audio URL from Cloudinary
   */
  async getOrGenerateWordAudio(
    word: string
  ): Promise<{
    audioUrl: string;
    duration: number;
    cached: boolean;
  }> {
    try {
      const normalizedWord = word.toLowerCase().trim();
      console.log(`🔤 Getting audio for word: "${normalizedWord}"`);

      // 1. Check cache in database
      const cached = await WordAudio.findOne({ word: normalizedWord });
      
      if (cached) {
        console.log('✅ Found cached word audio');
        
        // Increment usage counter
        await WordAudio.updateOne(
          { word: normalizedWord },
          { $inc: { timesUsed: 1 } }
        );

        return {
          audioUrl: cached.audioUrl,
          duration: cached.duration,
          cached: true,
        };
      }

      console.log('⚙️ Generating new word audio...');

      // 2. Generate audio via TTS
      const localPath = await this.ttsService.textToSpeech(
        normalizedWord,
        'alloy',
        0.9 // Slightly slower for pronunciation clarity
      );

      // 3. Upload to Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadAudio(
        localPath,
        {
          folder: 'words-audio',
          publicId: `word-${normalizedWord}`,
        }
      );

      // 4. Save to database
      const wordAudio = await WordAudio.create({
        word: normalizedWord,
        audioUrl: cloudinaryResult.secureUrl,
        audioPublicId: cloudinaryResult.publicId,
        duration: cloudinaryResult.duration,
        voice: 'alloy',
        format: 'mp3',
        generatedAt: new Date(),
        timesUsed: 1,
      });

      // 5. Clean up temp file
      try {
        await fs.promises.unlink(localPath);
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp file:', cleanupError);
      }

      console.log('✅ Word audio generated and cached');

      return {
        audioUrl: wordAudio.audioUrl,
        duration: wordAudio.duration,
        cached: false,
      };

    } catch (error: any) {
      console.error('❌ Failed to get/generate word audio:', error.message);
      throw error;
    }
  }

  /**
   * Get most used words
   */
  async getMostUsedWords(limit: number = 50): Promise<Array<{
    word: string;
    timesUsed: number;
    audioUrl: string;
  }>> {
    try {
      const words = await WordAudio.find()
        .select('word timesUsed audioUrl')
        .sort({ timesUsed: -1 })
        .limit(limit);

      return words.map(w => ({
        word: w.word,
        timesUsed: w.timesUsed,
        audioUrl: w.audioUrl,
      }));

    } catch (error: any) {
      console.error('❌ Failed to get most used words:', error.message);
      throw error;
    }
  }

  /**
   * Get total cached words count
   */
  async getCachedWordsCount(): Promise<number> {
    try {
      return await WordAudio.countDocuments();
    } catch (error: any) {
      console.error('❌ Failed to get cached words count:', error.message);
      return 0;
    }
  }
}

// Export singleton instance
export const wordAudioService = new WordAudioService();
