import OpenAI from 'openai';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Whisper Service - Speech to Text
 * Sử dụng OpenAI Whisper API để chuyển giọng nói thành văn bản
 */
export class WhisperService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  /**
   * Transcribe audio file to text
   * @param audioFilePath - Đường dẫn đến file audio
   * @param language - Ngôn ngữ (mặc định: 'en')
   * @returns Văn bản được transcribe
   */
  async transcribeAudio(audioFilePath: string, language: string = 'en'): Promise<string> {
    try {
      console.log('🎤 Starting audio transcription:', audioFilePath);

      // Kiểm tra file tồn tại
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Check file size
      const stats = fs.statSync(audioFilePath);
      console.log('📊 Audio file size:', (stats.size / 1024).toFixed(2), 'KB');
      
      if (stats.size < 1000) { // Less than 1KB
        console.warn('⚠️ Audio file is very small, may be corrupted or empty');
      }

      // Kiểm tra API key
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OpenAI API key not found');
        throw new Error('OpenAI API key not configured');
      }

      console.log('🔄 Calling Whisper API with language:', language || 'auto-detect');
      
      // Gọi Whisper API - KHÔNG dùng prompt vì có thể gây confusion
      const transcriptionParams: any = {
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json', // Get more details including language detection
        temperature: 0.0, // Maximum accuracy
        // Removed prompt - it was confusing Whisper to return the prompt instead of actual speech
      };
      
      // Only add language if specified (undefined = auto-detect)
      if (language) {
        transcriptionParams.language = language;
      }
      
      const transcription = await this.openai.audio.transcriptions.create(transcriptionParams);

      const transcribedText = transcription.text;
      console.log('✅ Transcription successful:', transcribedText);
      console.log('📝 Full transcript length:', transcribedText.length, 'characters');
      
      // Log detected language if available
      if ('language' in transcription) {
        console.log('🌍 Detected language:', (transcription as any).language);
      }

      // Xóa file tạm sau khi xử lý
      this.cleanupFile(audioFilePath);

      return transcribedText;

    } catch (error) {
      console.error('❌ Whisper transcription error:', error);
      
      // Cleanup file nếu có lỗi
      this.cleanupFile(audioFilePath);

      // Throw error để controller xử lý
      if (error instanceof Error) {
        throw new Error(`Transcription failed: ${error.message}`);
      }
      throw new Error('Transcription failed: Unknown error');
    }
  }

  /**
   * Transcribe với retry mechanism
   */
  async transcribeWithRetry(
    audioFilePath: string, 
    language: string = 'en',
    maxRetries: number = 3
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.transcribeAudio(audioFilePath, language);
      } catch (error) {
        console.warn(`⚠️ Transcription attempt ${attempt}/${maxRetries} failed`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('All transcription attempts failed');
  }

  /**
   * Validate audio file format và size
   */
  validateAudioFile(filePath: string, maxSizeMB: number = 25): boolean {
    try {
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > maxSizeMB) {
        console.error(`❌ File too large: ${fileSizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`);
        return false;
      }

      // Kiểm tra extension
      const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
      const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
      
      if (!validExtensions.includes(ext)) {
        console.error(`❌ Invalid file format: ${ext}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ File validation error:', error);
      return false;
    }
  }

  /**
   * Cleanup temporary files
   */
  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up temp file:', filePath);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup file:', filePath, error);
    }
  }

  /**
   * Estimate cost của transcription
   */
  estimateCost(durationSeconds: number): number {
    // OpenAI Whisper: $0.006 per minute
    const minutes = durationSeconds / 60;
    const cost = minutes * 0.006;
    return parseFloat(cost.toFixed(4));
  }
}

export const whisperService = new WhisperService();
