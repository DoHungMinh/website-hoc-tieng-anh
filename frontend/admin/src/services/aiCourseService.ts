const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface AIGenerationConfig {
  type: 'vocabulary' | 'grammar';
  topic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  contentLength: number;
  price: number;
  duration: string;
  includePronunciation: boolean;
  includeExamples: boolean;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  targetAudience?: string;
}

export interface AIGeneratedCourse {
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  duration: string;
  price: number;
  instructor: string;
  status: 'draft';
  studentsCount: number;
  lessonsCount: number;
  vocabulary?: Array<{
    id: string;
    word: string;
    pronunciation?: string;
    meaning: string;
    example: string;
  }>;
  grammar?: Array<{
    id: string;
    rule: string;
    structure?: string;
    explanation: string;
    example: string;
  }>;
  requirements: string[];
  benefits: string[];
  curriculum: Array<{
    module: string;
    lessons: string[];
  }>;
}

class AICourseService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generate course using AI
  async generateCourse(config: AIGenerationConfig): Promise<AIGeneratedCourse> {
    const response = await fetch(`${API_BASE_URL}/ai/generate-course`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to generate course');
    }

    const result = await response.json();
    if (!result.success || !result.course) {
      throw new Error('Invalid response from AI service');
    }
    
    return result.course;
  }

  // Get topic suggestions
  async getTopicSuggestions(type: 'vocabulary' | 'grammar', level: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/ai/topic-suggestions?type=${type}&level=${level}`, {
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
  }

  // Validate generated course content
  async validateCourseContent(course: AIGeneratedCourse): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/ai/validate-course`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ course })
    });

    if (!response.ok) {
      throw new Error('Failed to validate course content');
    }

    const result = await response.json();
    return result.success;
  }
}

export const aiCourseService = new AICourseService();
