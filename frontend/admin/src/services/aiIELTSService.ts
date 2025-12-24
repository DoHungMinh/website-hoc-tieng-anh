const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface AIIELTSReadingConfig {
  title: string;
  difficulty: string;
  duration: number;
  numPassages: number;
  questionsPerPassage: number;
  topics: string[];
  targetBand: string;
  description?: string;
}

export interface AIIELTSQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false-notgiven';
  question: string;
  passage_reference?: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  band_score_range: string;
}

export interface AIIELTSPassage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  topic: string;
  difficulty: string;
  academic_level: string;
  source_type: 'academic' | 'general' | 'scientific';
  questions: AIIELTSQuestion[];
}

export interface AIGeneratedIELTSReading {
  title: string;
  description: string;
  type: 'reading';
  difficulty: string;
  duration: number;
  total_questions: number;
  target_band: string;
  instructions: string[];
  passages: AIIELTSPassage[];
  scoring_criteria: {
    band_5: { min_correct: number; max_correct: number };
    band_6: { min_correct: number; max_correct: number };
    band_7: { min_correct: number; max_correct: number };
    band_8: { min_correct: number; max_correct: number };
    band_9: { min_correct: number; max_correct: number };
  };
  time_allocation: {
    per_passage: number;
    total_reading: number;
    total_answering: number;
  };
  tips: string[];
}

class AIIELTSService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generate IELTS Reading test using AI
  async generateIELTSReading(config: AIIELTSReadingConfig): Promise<AIGeneratedIELTSReading> {
    try {
      console.log('Sending IELTS Reading generation request:', config);
      
      const response = await fetch(`${API_BASE_URL}/ai/generate-ielts-reading`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to generate IELTS Reading test`);
      }

      const result = await response.json();
      if (!result.success || !result.exam) {
        throw new Error('Invalid response from AI service');
      }
      
      return result.exam;
    } catch (error) {
      console.error('AI IELTS Service Error:', error);
      throw error;
    }
  }

  // Get topic suggestions for IELTS Reading
  async getIELTSTopicSuggestions(difficulty: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/ielts-topic-suggestions?difficulty=${difficulty}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get topic suggestions');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Invalid response from topic suggestions service');
      }
      
      return result.suggestions;
    } catch (error) {
      console.error('Error getting topic suggestions:', error);
      // Return fallback suggestions
      return [
        'Technology and Innovation',
        'Environment and Climate Change',
        'Education and Learning',
        'Health and Medicine',
        'Business and Economics',
        'Science and Research',
        'History and Culture',
        'Social Issues',
        'Art and Literature',
        'Travel and Tourism'
      ];
    }
  }

  // Validate generated IELTS content
  async validateIELTSContent(exam: AIGeneratedIELTSReading): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/validate-ielts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ exam })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.valid;
    } catch (error) {
      console.error('Error validating IELTS content:', error);
      return false;
    }
  }

  // Save generated IELTS Reading test
  async saveIELTSReading(exam: AIGeneratedIELTSReading): Promise<{ success: boolean; examId?: string; message?: string }> {
    try {
      // Transform AI exam format to backend format
      const examData = {
        title: exam.title,
        type: 'reading',
        difficulty: exam.difficulty,
        duration: exam.duration,
        description: exam.description,
        totalQuestions: exam.total_questions,
        passages: exam.passages.map((passage) => ({
          id: passage.id,
          title: passage.title,
          content: passage.content,
          questions: passage.questions.map((q) => {
            return {
              id: q.id,
              type: q.type,
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correct_answer,
              explanation: q.explanation || ''
            };
          })
        })),
        status: 'draft'
      };

      console.log('Saving exam data to backend:', examData);

      const response = await fetch(`${API_BASE_URL}/ielts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(examData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        console.error('Backend response error:', error);
        throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to save IELTS Reading test`);
      }

      const result = await response.json();
      console.log('Exam saved successfully:', result);
      
      return {
        success: true,
        examId: result.data?._id,
        message: 'IELTS Reading test saved successfully'
      };
    } catch (error) {
      console.error('Error saving IELTS Reading test:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const aiIELTSService = new AIIELTSService();
