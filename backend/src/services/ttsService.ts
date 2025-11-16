import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

/**
 * Text-to-Speech Service
 * Sử dụng OpenAI TTS API để chuyển văn bản thành giọng nói
 */
export class TTSService {
  private openai: OpenAI;
  private outputDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Tạo thư mục lưu audio output
    this.outputDir = path.join(__dirname, '../../temp/audio');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Convert text to speech
   * @param text - Văn bản cần chuyển thành giọng nói
   * @param voice - Giọng nói (alloy, echo, fable, onyx, nova, shimmer)
   * @param speed - Tốc độ nói (0.25 - 4.0, default: 1.0)
   * @returns Đường dẫn đến file audio
   */
  async textToSpeech(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
    speed: number = 1.0
  ): Promise<string> {
    try {
      console.log('🔊 Starting text-to-speech conversion...');
      console.log('📝 Text length:', text.length, 'characters');

      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for TTS');
      }

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Limit text length (OpenAI TTS có giới hạn 4096 chars)
      const maxLength = 4096;
      if (text.length > maxLength) {
        console.warn(`⚠️ Text too long (${text.length} chars), truncating to ${maxLength}`);
        text = text.substring(0, maxLength);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `tts_${timestamp}.mp3`;
      const outputPath = path.join(this.outputDir, filename);

      // Call OpenAI TTS API
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1', // Hoặc 'tts-1-hd' cho chất lượng cao hơn
        voice: voice,
        input: text,
        speed: speed,
        response_format: 'mp3',
      });

      // Convert response to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Save to file
      await fs.promises.writeFile(outputPath, buffer);

      console.log('✅ TTS successful, saved to:', outputPath);
      console.log('📊 Audio size:', (buffer.length / 1024).toFixed(2), 'KB');

      return outputPath;

    } catch (error) {
      console.error('❌ TTS conversion error:', error);
      
      if (error instanceof Error) {
        throw new Error(`TTS failed: ${error.message}`);
      }
      throw new Error('TTS failed: Unknown error');
    }
  }

  /**
   * TTS với retry mechanism
   */
  async textToSpeechWithRetry(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
    speed: number = 1.0,
    maxRetries: number = 3
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.textToSpeech(text, voice, speed);
      } catch (error) {
        console.warn(`⚠️ TTS attempt ${attempt}/${maxRetries} failed`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('All TTS attempts failed');
  }

  /**
   * Convert text to speech và trả về base64
   * (Dùng cho streaming hoặc không cần lưu file)
   */
  async textToSpeechBase64(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
    speed: number = 1.0
  ): Promise<string> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        speed: speed,
        response_format: 'mp3',
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64 = buffer.toString('base64');
      
      return base64;

    } catch (error) {
      console.error('❌ TTS to base64 error:', error);
      throw error;
    }
  }

  /**
   * Cleanup old audio files (chạy định kỳ)
   */
  async cleanupOldFiles(maxAgeHours: number = 1): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.outputDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.promises.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.promises.unlink(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${deletedCount} old TTS files`);
      }

    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }

  /**
   * Get available voices với mô tả
   */
  getAvailableVoices() {
    return [
      { 
        id: 'alloy', 
        name: 'Alloy', 
        description: 'Neutral, balanced voice',
        gender: 'neutral'
      },
      { 
        id: 'echo', 
        name: 'Echo', 
        description: 'Male, clear voice',
        gender: 'male'
      },
      { 
        id: 'fable', 
        name: 'Fable', 
        description: 'British accent, expressive',
        gender: 'male'
      },
      { 
        id: 'onyx', 
        name: 'Onyx', 
        description: 'Deep male voice',
        gender: 'male'
      },
      { 
        id: 'nova', 
        name: 'Nova', 
        description: 'Female, energetic voice',
        gender: 'female'
      },
      { 
        id: 'shimmer', 
        name: 'Shimmer', 
        description: 'Female, soft voice',
        gender: 'female'
      },
    ];
  }

  /**
   * Estimate cost của TTS
   */
  estimateCost(textLength: number): number {
    // OpenAI TTS: $15.00 per 1M characters
    const cost = (textLength / 1000000) * 15.00;
    return parseFloat(cost.toFixed(6));
  }

  /**
   * Delete specific audio file
   */
  async deleteAudioFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log('🗑️ Deleted audio file:', filePath);
      }
    } catch (error) {
      console.warn('⚠️ Failed to delete audio file:', error);
    }
  }
}

export const ttsService = new TTSService();

// Auto cleanup old files every hour
setInterval(() => {
  ttsService.cleanupOldFiles(1);
}, 60 * 60 * 1000);
