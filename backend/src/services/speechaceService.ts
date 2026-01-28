import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Speechace Syllable Score (contains extent/timing info)
 */
export interface SpeechaceSyllableScore {
  extent: [number, number]; // [start_ms, end_ms]
  phone_count: number;
  stress_level: number;
  letters: string;
  quality_score: number;
  stress_score: number;
}

/**
 * Speechace Phone Score Response
 */
export interface SpeechacePhoneScore {
  phone: string;
  sound_most_like: string | null; // Can be null!
  quality_score: number;
  stress_level?: number | null;
  extent?: [number, number]; // [start_ms, end_ms] - optional
}

/**
 * Speechace Word Score Response
 */
export interface SpeechaceWordScore {
  word: string;
  quality_score: number;
  phone_score_list: SpeechacePhoneScore[];
  syllable_score_list: SpeechaceSyllableScore[]; // Contains timing info!
}

/**
 * Speechace API Response (for text/pronunciation scoring - v0.5)
 */
export interface SpeechaceResponse {
  status: string;
  status_message?: string;  // Error message when status !== 'success'
  text_score: {
    quality_score: number;
    fluency_score?: number;
    pronunciation_score?: number;
    word_score_list: SpeechaceWordScore[];  // API returns 'word_score_list' not 'words_score_list'
  };
}

/**
 * Speechace v9 Open-ended Speech API Response
 * For spontaneous speech assessment with full IELTS scoring
 */
export interface SpeechaceOpenEndedResponse {
  status: string;
  status_message?: string;
  quota_remaining?: number;
  speech_score: {
    transcript: string;
    word_score_list: SpeechaceWordScore[];

    // IELTS Scores (0-9 scale)
    ielts_score: {
      pronunciation: number;
      fluency: number;
      grammar: number;
      coherence: number;
      vocab: number;
      overall: number;
    };

    // Detailed metrics (optional)
    grammar?: {
      overall_metrics?: any;
      errors?: any[];
    };
    vocab?: {
      overall_metrics?: any;
    };
    coherence?: {
      overall_metrics?: any;
    };
    fluency?: {
      overall_metrics?: {
        all_pause_count?: number;
        all_pause_duration?: number;
        all_pause_list?: Array<{
          start: number;  // seconds
          end: number;    // seconds
          duration: number; // seconds
        }>;
        articulation?: number; // syllables per minute
        speech_rate?: number;  // syllables per second
        mean_length_run?: number;
        max_length_run?: number;
        word_correct_per_minute?: number;
        syllable_correct_per_minute?: number;
      };
    };

    asr_version?: string;
  };
  version?: string;
}

/**
 * Speechace Service
 * Tích hợp Speechace API để chấm điểm phát âm
 */
export class SpeechaceService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    // Decode URL-encoded API key - Speechace needs actual / characters, not %2F
    const rawKey = process.env.SPEECHACE_API_KEY || '';
    this.apiKey = decodeURIComponent(rawKey);  // Convert %2F to /
    this.apiEndpoint = process.env.SPEECHACE_API_ENDPOINT || 'https://api2.speechace.com';

    if (!this.apiKey) {
      console.warn('⚠️ SPEECHACE_API_KEY not configured');
    } else {
      console.log('✅ Speechace API configured (DECODED key)');
      console.log('🔑 Decoded API Key length:', this.apiKey.length);
      console.log('🔑 Contains "/" chars:', this.apiKey.includes('/'));
      console.log('🌐 API Endpoint:', this.apiEndpoint);
    }
  }

  /**
   * Score audio pronunciation
   * @param audioPath - Local path to audio file
   * @param referenceText - Text that should be spoken
   * @param userId - User ID for tracking
   * @returns Scoring result from Speechace
   */
  async scoreAudio(
    audioPath: string,
    referenceText: string,
    userId: string
  ): Promise<SpeechaceResponse> {
    try {
      console.log('🎯 Starting Speechace pronunciation scoring...');
      console.log('📝 Reference text:', referenceText);
      console.log('🎤 Audio file:', audioPath);
      console.log('🔑 API Key length:', this.apiKey.length);
      console.log('🔑 API Key first 20 chars:', this.apiKey.substring(0, 20) + '...');

      // Validate inputs
      if (!this.apiKey) {
        throw new Error('Speechace API key not configured');
      }

      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // Read audio file as Buffer (instead of stream)
      const audioBuffer = fs.readFileSync(audioPath);
      const fileName = audioPath.split(/[/\\]/).pop() || 'audio.mp3'; // Handle both / and \

      // Prepare form data WITHOUT key (will send via URL)
      const formData = new FormData();
      formData.append('text', referenceText);
      formData.append('user_audio_file', audioBuffer, {
        filename: fileName,
        contentType: 'audio/mpeg'
      });
      formData.append('dialect', 'en-us');
      formData.append('user_id', userId);

      // Debug - Log FormData fields
      console.log('📋 FormData prepared (key in URL):');
      console.log('   - text:', referenceText);
      console.log('   - audio buffer size:', audioBuffer.length, 'bytes');
      console.log('   - filename:', fileName);
      console.log('   - dialect: en-us');
      console.log('   - user_id:', userId);

      // Get headers with boundary
      const formDataHeaders = formData.getHeaders();
      console.log('📋 FormData headers:', formDataHeaders);

      // Call Speechace API with key in URL query parameter
      const url = `${this.apiEndpoint}/api/scoring/text/v0.5/json?key=${encodeURIComponent(this.apiKey)}`;

      console.log('📡 Calling Speechace API:', `${this.apiEndpoint}/api/scoring/text/v0.5/json?key=...`);

      const response = await axios.post<SpeechaceResponse>(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📡 Speechace Response Status:', response.data.status);
      console.log('📡 Full Response:', JSON.stringify(response.data, null, 2));

      if (response.data.status !== 'success') {
        const errorMsg = response.data.status_message || response.data.status || 'Unknown error';
        console.error('❌ Speechace API returned error status:', errorMsg);
        throw new Error(`Speechace API error: ${errorMsg}`);
      }

      console.log('✅ Speechace scoring successful');
      console.log('📊 Overall score:', response.data.text_score.quality_score);
      console.log('📝 Words analyzed:', response.data.text_score.word_score_list.length);

      return response.data;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Speechace scoring failed:', errorMessage);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: any; statusText: string } };
        console.error('❌ API Response Data:', JSON.stringify(axiosError.response.data, null, 2));
        console.error('❌ API Status Text:', axiosError.response.statusText);

        const errorDetail = axiosError.response.data.status_message
          || axiosError.response.data.message
          || axiosError.response.data.error
          || axiosError.response.statusText;

        throw new Error(`Speechace API error: ${errorDetail}`);
      }

      throw error;
    }
  }

  /**
   * Parse Speechace word scores to our format
   * @param wordScores - Raw word scores from Speechace
   * @returns Formatted word scores
   */
  parseWordScores(wordScores: SpeechaceWordScore[]): Array<{
    word: string;
    score: number;
    startTime: number; // seconds
    endTime: number; // seconds
    phoneScores: Array<{
      phone: string;
      soundMostLike: string;
      score: number;
      stressLevel?: number;
    }>;
  }> {
    return wordScores.map(wordScore => {
      // Get timing from syllable_score_list (first syllable start, last syllable end)
      const syllables = wordScore.syllable_score_list;
      const startTime = syllables.length > 0 ? syllables[0].extent[0] / 1000 : 0; // ms to seconds
      const endTime = syllables.length > 0 ? syllables[syllables.length - 1].extent[1] / 1000 : 0;

      return {
        word: wordScore.word,
        score: wordScore.quality_score,
        startTime,
        endTime,
        phoneScores: wordScore.phone_score_list.map(phoneScore => ({
          phone: phoneScore.phone,
          soundMostLike: phoneScore.sound_most_like || phoneScore.phone, // Fallback to phone itself if null
          score: phoneScore.quality_score,
          stressLevel: phoneScore.stress_level || undefined,
        })),
      };
    });
  }

  /**
   * Validate Speechace configuration
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.apiEndpoint;
  }

  /**
   * Score open-ended speech (spontaneous speech) using Speechace v9 API
   * This API provides comprehensive IELTS scoring including:
   * - Pronunciation, Fluency, Grammar, Vocabulary, Coherence
   * - Automatic transcription (no need for Whisper)
   * - Detailed feedback metrics
   * 
   * @param audioPath - Local path to audio file
   * @param userId - User ID for tracking
   * @param includeIeltsFeedback - Include detailed IELTS feedback (default: true)
   * @returns Full speech assessment with IELTS scores
   */
  async scoreOpenEndedSpeech(
    audioPath: string,
    userId: string,
    includeIeltsFeedback: boolean = true
  ): Promise<SpeechaceOpenEndedResponse> {
    try {
      console.log('🎯 Starting Speechace v9 Open-ended Speech scoring...');
      console.log('🎤 Audio file:', audioPath);
      console.log('🔑 API Key length:', this.apiKey.length);

      // Validate inputs
      if (!this.apiKey) {
        throw new Error('Speechace API key not configured');
      }

      if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
      }

      // Read audio file as Buffer
      const audioBuffer = fs.readFileSync(audioPath);
      const fileName = audioPath.split(/[/\\]/).pop() || 'audio.mp3';

      // Prepare form data
      const formData = new FormData();
      formData.append('user_audio_file', audioBuffer, {
        filename: fileName,
        contentType: 'audio/mpeg'
      });
      formData.append('dialect', 'en-us');
      formData.append('user_id', userId);

      // Include IELTS feedback for detailed scoring
      if (includeIeltsFeedback) {
        formData.append('include_ielts_feedback', '1');
      }

      console.log('📋 FormData prepared for v9 API:');
      console.log('   - audio buffer size:', audioBuffer.length, 'bytes');
      console.log('   - filename:', fileName);
      console.log('   - dialect: en-us');
      console.log('   - user_id:', userId);
      console.log('   - include_ielts_feedback:', includeIeltsFeedback ? '1' : '0');

      // Call Speechace v9 Speech API
      const url = `${this.apiEndpoint}/api/scoring/speech/v9/json?key=${encodeURIComponent(this.apiKey)}&dialect=en-us`;

      console.log('📡 Calling Speechace v9 Speech API...');

      const response = await axios.post<SpeechaceOpenEndedResponse>(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 seconds timeout for longer audio
      });

      console.log('📡 Speechace v9 Response Status:', response.data.status);

      if (response.data.status !== 'success') {
        const errorMsg = response.data.status_message || response.data.status || 'Unknown error';
        console.error('❌ Speechace v9 API returned error status:', errorMsg);
        throw new Error(`Speechace v9 API error: ${errorMsg}`);
      }

      // Log scores for debugging
      if (response.data.speech_score?.ielts_score) {
        console.log('✅ Speechace v9 scoring successful');
        console.log('📊 IELTS Scores:');
        console.log('   - Overall:', response.data.speech_score.ielts_score.overall);
        console.log('   - Pronunciation:', response.data.speech_score.ielts_score.pronunciation);
        console.log('   - Fluency:', response.data.speech_score.ielts_score.fluency);
        console.log('   - Vocabulary:', response.data.speech_score.ielts_score.vocab);
        console.log('   - Grammar:', response.data.speech_score.ielts_score.grammar);
        console.log('   - Coherence:', response.data.speech_score.ielts_score.coherence);
        console.log('📝 Transcript:', response.data.speech_score.transcript?.substring(0, 100) + '...');
        console.log('📝 Words analyzed:', response.data.speech_score.word_score_list?.length);
      }

      return response.data;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Speechace v9 scoring failed:', errorMessage);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: any; statusText: string } };
        console.error('❌ API Response Data:', JSON.stringify(axiosError.response.data, null, 2));
        console.error('❌ API Status Text:', axiosError.response.statusText);

        const errorDetail = axiosError.response.data.status_message
          || axiosError.response.data.message
          || axiosError.response.data.error
          || axiosError.response.statusText;

        throw new Error(`Speechace v9 API error: ${errorDetail}`);
      }

      throw error;
    }
  }
}

// Export singleton instance
export const speechaceService = new SpeechaceService();
