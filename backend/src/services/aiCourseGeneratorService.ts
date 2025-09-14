import OpenAI from 'openai';

interface VocabularyItem {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example: string;
}

interface GrammarItem {
  id: string;
  rule: string;
  structure?: string;
  explanation: string;
  example: string;
}

interface AIGenerationConfig {
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

interface GeneratedCourse {
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar';
  level: string;
  duration: string;
  price: number;
  instructor: string;
  status: 'draft';
  studentsCount: number;
  lessonsCount: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarItem[];
  requirements: string[];
  benefits: string[];
  curriculum: Array<{
    module: string;
    lessons: string[];
  }>;
}

class AICourseGeneratorService {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI with API key from environment
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async generateCourse(config: AIGenerationConfig): Promise<GeneratedCourse> {
    console.log('🤖 AI Course Generator - Starting generation with config:', config);
    
    try {
      // Check if OpenAI is properly configured
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not found, using fallback mock data');
        return this.generateMockCourse(config);
      }

      if (config.type === 'vocabulary') {
        return await this.generateVocabularyCourse(config);
      } else {
        return await this.generateGrammarCourse(config);
      }
    } catch (error) {
      console.error('❌ Error generating course with AI:', error);
      console.log('🔄 Falling back to mock data generation');
      return this.generateMockCourse(config);
    }
  }

  private async generateVocabularyCourse(config: AIGenerationConfig): Promise<GeneratedCourse> {
    const prompt = this.createVocabularyPrompt(config);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia giảng dạy tiếng Anh, chuyên tạo nội dung học tập chất lượng cao. Hãy tạo khóa học từ vựng theo yêu cầu và trả về JSON hợp lệ."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const courseData = JSON.parse(response);
      return this.formatVocabularyCourse(courseData, config);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }
  }

  private async generateGrammarCourse(config: AIGenerationConfig): Promise<GeneratedCourse> {
    const prompt = this.createGrammarPrompt(config);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia ngữ pháp tiếng Anh, chuyên tạo nội dung học tập có cấu trúc rõ ràng. Hãy tạo khóa học ngữ pháp theo yêu cầu và trả về JSON hợp lệ."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const courseData = JSON.parse(response);
      return this.formatGrammarCourse(courseData, config);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }
  }

  private createVocabularyPrompt(config: AIGenerationConfig): string {
    return `
Tạo một khóa học từ vựng tiếng Anh với các thông tin sau:
- Chủ đề: ${config.topic}
- Cấp độ: ${config.level}
- Số lượng từ vựng: ${config.contentLength}
- Bao gồm phát âm: ${config.includePronunciation ? 'Có' : 'Không'}
- Bao gồm ví dụ: ${config.includeExamples ? 'Có' : 'Không'}
- Độ khó: ${config.difficulty}
${config.targetAudience ? `- Đối tượng: ${config.targetAudience}` : ''}

Trả về JSON với cấu trúc sau:
{
  "title": "Tên khóa học hấp dẫn",
  "description": "Mô tả chi tiết về khóa học",
  "vocabulary": [
    {
      "word": "từ tiếng Anh",
      "pronunciation": "${config.includePronunciation ? '/phiên âm IPA/' : ''}",
      "meaning": "nghĩa tiếng Việt",
      "example": "${config.includeExamples ? 'câu ví dụ tiếng Anh' : ''}"
    }
  ],
  "requirements": ["yêu cầu 1", "yêu cầu 2"],
  "benefits": ["lợi ích 1", "lợi ích 2", "lợi ích 3"],
  "curriculum": [
    {
      "module": "Tên module",
      "lessons": ["Bài 1", "Bài 2"]
    }
  ]
}

Lưu ý:
- Từ vựng phải phù hợp với cấp độ ${config.level}
- Nghĩa tiếng Việt phải chính xác và dễ hiểu
- Ví dụ phải thực tế và có ngữ cảnh rõ ràng
- Tạo đầy đủ ${config.contentLength} từ vựng
`;
  }

  private createGrammarPrompt(config: AIGenerationConfig): string {
    return `
Tạo một khóa học ngữ pháp tiếng Anh với các thông tin sau:
- Chủ đề: ${config.topic}
- Cấp độ: ${config.level}
- Số lượng quy tắc: ${config.contentLength}
- Độ khó: ${config.difficulty}
${config.targetAudience ? `- Đối tượng: ${config.targetAudience}` : ''}

Trả về JSON với cấu trúc sau:
{
  "title": "Tên khóa học hấp dẫn",
  "description": "Mô tả chi tiết về khóa học",
  "grammar": [
    {
      "rule": "Tên quy tắc ngữ pháp",
      "structure": "Cấu trúc công thức",
      "explanation": "Giải thích chi tiết bằng tiếng Việt",
      "example": "Ví dụ minh họa"
    }
  ],
  "requirements": ["yêu cầu 1", "yêu cầu 2"],
  "benefits": ["lợi ích 1", "lợi ích 2", "lợi ích 3"],
  "curriculum": [
    {
      "module": "Tên module",
      "lessons": ["Bài 1", "Bài 2"]
    }
  ]
}

Lưu ý:
- Ngữ pháp phải phù hợp với cấp độ ${config.level}
- Giải thích bằng tiếng Việt dễ hiểu
- Ví dụ phải đa dạng và thực tế
- Tạo đầy đủ ${config.contentLength} quy tắc ngữ pháp
`;
  }

  private formatVocabularyCourse(aiResponse: any, config: AIGenerationConfig): GeneratedCourse {
    return {
      title: aiResponse.title || `Từ vựng ${config.topic} - ${config.level}`,
      description: aiResponse.description || `Khóa học từ vựng về ${config.topic} dành cho trình độ ${config.level}`,
      type: 'vocabulary',
      level: config.level,
      duration: config.duration,
      price: config.price,
      instructor: 'AI Assistant',
      status: 'draft',
      studentsCount: 0,
      lessonsCount: Math.ceil(config.contentLength / 5),
      vocabulary: (aiResponse.vocabulary || []).map((item: any, index: number) => ({
        id: `vocab-${Date.now()}-${index}`,
        word: item.word || '',
        pronunciation: item.pronunciation || '',
        meaning: item.meaning || '',
        example: item.example || ''
      })),
      grammar: [],
      requirements: aiResponse.requirements || [`Trình độ ${config.level} trở lên`],
      benefits: aiResponse.benefits || ['Cải thiện vốn từ vựng', 'Nâng cao khả năng giao tiếp'],
      curriculum: aiResponse.curriculum || []
    };
  }

  private formatGrammarCourse(aiResponse: any, config: AIGenerationConfig): GeneratedCourse {
    return {
      title: aiResponse.title || `Ngữ pháp ${config.topic} - ${config.level}`,
      description: aiResponse.description || `Khóa học ngữ pháp về ${config.topic} dành cho trình độ ${config.level}`,
      type: 'grammar',
      level: config.level,
      duration: config.duration,
      price: config.price,
      instructor: 'AI Assistant',
      status: 'draft',
      studentsCount: 0,
      lessonsCount: Math.ceil(config.contentLength / 3),
      vocabulary: [],
      grammar: (aiResponse.grammar || []).map((item: any, index: number) => ({
        id: `grammar-${Date.now()}-${index}`,
        rule: item.rule || '',
        structure: item.structure || '',
        explanation: item.explanation || '',
        example: item.example || ''
      })),
      requirements: aiResponse.requirements || [`Trình độ ${config.level} trở lên`],
      benefits: aiResponse.benefits || ['Nắm vững ngữ pháp cơ bản', 'Cải thiện kỹ năng viết'],
      curriculum: aiResponse.curriculum || []
    };
  }

  private generateMockCourse(config: AIGenerationConfig): GeneratedCourse {
    console.log('🎭 Generating mock course data for:', config.type, config.topic);
    
    const baseTitle = `${config.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} ${config.topic} - ${config.level}`;
    const baseDescription = `Khóa học ${config.type === 'vocabulary' ? 'từ vựng' : 'ngữ pháp'} về chủ đề ${config.topic} dành cho học viên trình độ ${config.level}`;

    if (config.type === 'vocabulary') {
      const mockVocabulary: VocabularyItem[] = Array.from({ length: Math.min(config.contentLength, 20) }, (_, i) => ({
        id: `vocab-${Date.now()}-${i}`,
        word: `${config.topic.toLowerCase().replace(/\s+/g, '')}-word-${i + 1}`,
        pronunciation: config.includePronunciation ? `/wɜːrd ${i + 1}/` : '',
        meaning: `Nghĩa của từ về ${config.topic} số ${i + 1}`,
        example: config.includeExamples ? `This is an example sentence using ${config.topic} word ${i + 1}.` : ''
      }));

      return {
        title: baseTitle,
        description: baseDescription,
        type: 'vocabulary',
        level: config.level,
        duration: config.duration,
        price: config.price,
        instructor: 'AI Assistant',
        status: 'draft',
        studentsCount: 0,
        lessonsCount: Math.ceil(config.contentLength / 5),
        vocabulary: mockVocabulary,
        grammar: [],
        requirements: [`Trình độ ${config.level} trở lên`, 'Có khả năng đọc hiểu cơ bản'],
        benefits: [
          `Nắm vững ${config.contentLength} từ vựng chủ đề ${config.topic}`,
          'Cải thiện khả năng giao tiếp hàng ngày',
          'Tự tin hơn trong việc sử dụng tiếng Anh'
        ],
        curriculum: [
          {
            module: `Từ vựng cơ bản về ${config.topic}`,
            lessons: ['Giới thiệu từ vựng', 'Thực hành phát âm', 'Ứng dụng trong câu']
          }
        ]
      };
    } else {
      const mockGrammar: GrammarItem[] = Array.from({ length: Math.min(config.contentLength, 15) }, (_, i) => ({
        id: `grammar-${Date.now()}-${i}`,
        rule: `${config.topic} Rule ${i + 1}`,
        structure: `Structure pattern ${i + 1}`,
        explanation: `Giải thích chi tiết quy tắc ngữ pháp ${config.topic} số ${i + 1}`,
        example: config.includeExamples ? `Example sentence demonstrating ${config.topic} rule ${i + 1}.` : ''
      }));

      return {
        title: baseTitle,
        description: baseDescription,
        type: 'grammar',
        level: config.level,
        duration: config.duration,
        price: config.price,
        instructor: 'AI Assistant',
        status: 'draft',
        studentsCount: 0,
        lessonsCount: Math.ceil(config.contentLength / 3),
        vocabulary: [],
        grammar: mockGrammar,
        requirements: [`Trình độ ${config.level} trở lên`, 'Có kiến thức ngữ pháp cơ bản'],
        benefits: [
          `Nắm vững ${config.contentLength} quy tắc ngữ pháp ${config.topic}`,
          'Cải thiện khả năng viết và nói',
          'Sử dụng ngữ pháp chính xác trong giao tiếp'
        ],
        curriculum: [
          {
            module: `Ngữ pháp cơ bản về ${config.topic}`,
            lessons: ['Giới thiệu quy tắc', 'Cấu trúc câu', 'Thực hành ứng dụng']
          }
        ]
      };
    }
  }
}

export const aiCourseGeneratorService = new AICourseGeneratorService();
export type { AIGenerationConfig, GeneratedCourse };
