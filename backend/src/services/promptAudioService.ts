import PromptAudio from '../models/PromptAudio';
import { TTSService } from './ttsService';
import { CloudinaryService } from './cloudinaryService';
import fs from 'fs';

/**
 * Prompt Audio Service
 * Quản lý audio cho 16 prompts (cache-first strategy)
 */
export class PromptAudioService {
  private ttsService: TTSService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.ttsService = new TTSService();
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Get or generate prompt audio
   * @param promptIndex - Index của prompt (0-15)
   * @param promptText - Nội dung prompt
   * @returns Audio URL from Cloudinary
   */
  async getOrGeneratePromptAudio(
    promptIndex: number,
    promptText: string
  ): Promise<{
    audioUrl: string;
    duration: number;
    cached: boolean;
  }> {
    try {
      console.log(`🎵 Getting audio for prompt ${promptIndex}...`);

      // 1. Check cache in database
      const cached = await PromptAudio.findOne({ promptIndex });
      
      if (cached) {
        console.log('✅ Found cached prompt audio');
        return {
          audioUrl: cached.audioUrl,
          duration: cached.duration,
          cached: true,
        };
      }

      console.log('⚙️ Generating new prompt audio...');

      // 2. Generate audio via TTS
      const localPath = await this.ttsService.textToSpeech(
        promptText,
        'alloy',
        1.0
      );

      // 3. Upload to Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadAudio(
        localPath,
        {
          folder: 'prompts-audio',
          publicId: `prompt-${promptIndex}`,
        }
      );

      // 4. Save to database
      const promptAudio = await PromptAudio.create({
        promptIndex,
        promptText,
        audioUrl: cloudinaryResult.secureUrl,
        audioPublicId: cloudinaryResult.publicId,
        duration: cloudinaryResult.duration,
        voice: 'alloy',
        format: 'mp3',
        generatedAt: new Date(),
      });

      // 5. Clean up temp file
      try {
        await fs.promises.unlink(localPath);
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp file:', cleanupError);
      }

      console.log('✅ Prompt audio generated and cached');

      return {
        audioUrl: promptAudio.audioUrl,
        duration: promptAudio.duration,
        cached: false,
      };

    } catch (error: any) {
      console.error('❌ Failed to get/generate prompt audio:', error.message);
      throw error;
    }
  }

  /**
   * Get all cached prompts
   */
  async getAllCachedPrompts(): Promise<Array<{
    promptIndex: number;
    audioUrl: string;
    duration: number;
  }>> {
    try {
      const prompts = await PromptAudio.find()
        .select('promptIndex audioUrl duration')
        .sort({ promptIndex: 1 });

      return prompts.map(p => ({
        promptIndex: p.promptIndex,
        audioUrl: p.audioUrl,
        duration: p.duration,
      }));

    } catch (error: any) {
      console.error('❌ Failed to get cached prompts:', error.message);
      throw error;
    }
  }

  /**
   * Regenerate specific prompt audio
   */
  async regeneratePromptAudio(promptIndex: number, promptText: string): Promise<void> {
    try {
      console.log(`🔄 Regenerating audio for prompt ${promptIndex}...`);

      // Delete old entry
      await PromptAudio.deleteOne({ promptIndex });

      // Generate new one
      await this.getOrGeneratePromptAudio(promptIndex, promptText);

      console.log('✅ Prompt audio regenerated');

    } catch (error: any) {
      console.error('❌ Failed to regenerate prompt audio:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const promptAudioService = new PromptAudioService();
