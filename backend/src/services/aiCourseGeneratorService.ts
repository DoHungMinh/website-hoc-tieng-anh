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
      // Generate realistic grammar content based on topic
      const mockGrammar = this.generateRealisticGrammar(config.topic, config.level, Math.min(config.contentLength, 15));

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
          `Nắm vững ${mockGrammar.length} quy tắc ngữ pháp ${config.topic}`,
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

  private generateRealisticGrammar(topic: string, level: string, count: number): GrammarItem[] {
    const grammarDatabase = {
      'Modal Verbs': [
        {
          rule: 'Can - Khả năng và Xin phép',
          structure: 'Subject + can + base verb',
          explanation: 'Can được dùng để diễn tả khả năng và xin phép. Trong câu khẳng định: S + can + V, trong câu phủ định: S + cannot/can\'t + V, trong câu hỏi: Can + S + V?',
          example: 'I can speak English fluently. Can you help me with this problem?'
        },
        {
          rule: 'Could - Khả năng quá khứ và Yêu cầu lịch sự',
          structure: 'Subject + could + base verb',
          explanation: 'Could là quá khứ của can, dùng để diễn tả khả năng trong quá khứ hoặc đưa ra lời đề nghị lịch sự.',
          example: 'When I was young, I could run very fast. Could you please open the window?'
        },
        {
          rule: 'Should - Lời khuyên và Nghĩa vụ',
          structure: 'Subject + should + base verb',
          explanation: 'Should được dùng để đưa ra lời khuyên hoặc diễn tả nghĩa vụ, điều nên làm.',
          example: 'You should study harder for the exam. We should arrive early for the meeting.'
        },
        {
          rule: 'Must - Bắt buộc mạnh và Chắc chắn',
          structure: 'Subject + must + base verb',
          explanation: 'Must diễn tả sự bắt buộc mạnh mẽ hoặc sự chắc chắn cao về một điều gì đó.',
          example: 'You must wear a helmet when riding a motorcycle. She must be tired after the long journey.'
        },
        {
          rule: 'May - Xin phép và Khả năng',
          structure: 'Subject + may + base verb',
          explanation: 'May được dùng để xin phép một cách lịch sự hoặc diễn tả khả năng có thể xảy ra.',
          example: 'May I come in? It may rain this afternoon.'
        },
        {
          rule: 'Might - Khả năng thấp',
          structure: 'Subject + might + base verb',
          explanation: 'Might diễn tả khả năng thấp hơn may, thường dùng để nói về điều không chắc chắn.',
          example: 'I might go to the party tonight. He might be late because of traffic.'
        },
        {
          rule: 'Will - Tương lai và Quyết định',
          structure: 'Subject + will + base verb',
          explanation: 'Will được dùng để diễn tả tương lai, quyết định tức thời hoặc lời hứa.',
          example: 'I will help you with your homework. It will be sunny tomorrow.'
        },
        {
          rule: 'Would - Điều kiện và Lịch sự',
          structure: 'Subject + would + base verb',
          explanation: 'Would dùng trong câu điều kiện, thói quen quá khứ hoặc yêu cầu lịch sự.',
          example: 'I would travel around the world if I had money. Would you like some coffee?'
        }
      ],
      'Present Simple': [
        {
          rule: 'Câu khẳng định',
          structure: 'Subject + V(s/es) + Object',
          explanation: 'Thì hiện tại đơn dùng để diễn tả hành động thường xuyên, sự thật hiển nhiên. Với ngôi thứ 3 số ít (he, she, it) thêm s/es vào động từ.',
          example: 'I work in an office. She works at a hospital. They play football every Sunday.'
        },
        {
          rule: 'Câu phủ định',
          structure: 'Subject + do/does + not + base verb',
          explanation: 'Câu phủ định sử dụng do not (don\'t) với I, you, we, they và does not (doesn\'t) với he, she, it.',
          example: 'I don\'t like coffee. He doesn\'t speak French. We don\'t have time.'
        },
        {
          rule: 'Câu hỏi Yes/No',
          structure: 'Do/Does + Subject + base verb?',
          explanation: 'Câu hỏi yes/no sử dụng do với I, you, we, they và does với he, she, it.',
          example: 'Do you like music? Does she live in London? Do they have children?'
        },
        {
          rule: 'Câu hỏi WH-',
          structure: 'WH- + do/does + Subject + base verb?',
          explanation: 'Câu hỏi thông tin sử dụng từ hỏi (what, where, when, why, how) + do/does.',
          example: 'What do you do for work? Where does he live? When do they start school?'
        },
        {
          rule: 'Dấu hiệu nhận biết',
          structure: 'Adverbs of frequency + Present Simple',
          explanation: 'Thường đi với các trạng từ chỉ tần suất: always, usually, often, sometimes, never.',
          example: 'I always brush my teeth before bed. She usually arrives on time.'
        }
      ],
      'Past Simple': [
        {
          rule: 'Động từ có quy tắc',
          structure: 'Subject + V-ed + Object',
          explanation: 'Động từ có quy tắc thêm -ed vào cuối để tạo thành quá khứ đơn. Nếu động từ kết thúc bằng -e chỉ thêm -d.',
          example: 'I walked to school yesterday. They visited their grandparents last week. She lived in Paris for two years.'
        },
        {
          rule: 'Động từ bất quy tắc',
          structure: 'Subject + V2 (irregular) + Object',
          explanation: 'Động từ bất quy tắc có dạng quá khứ riêng cần học thuộc lòng. Ví dụ: go-went, see-saw, buy-bought.',
          example: 'I went to the market this morning. She bought a new dress yesterday. We saw a good movie last night.'
        },
        {
          rule: 'Câu phủ định và câu hỏi',
          structure: 'Subject + did not + base verb / Did + Subject + base verb?',
          explanation: 'Câu phủ định và câu hỏi sử dụng did với tất cả các ngôi, động từ chính trở về dạng nguyên mẫu.',
          example: 'I didn\'t go to work yesterday. Did you finish your homework? She didn\'t understand the lesson.'
        },
        {
          rule: 'Dấu hiệu nhận biết',
          structure: 'Past time expressions + Past Simple',
          explanation: 'Thường đi với các cụm từ chỉ thời gian quá khứ: yesterday, last week, ago, in 1990.',
          example: 'I met him three years ago. Last summer, we traveled to Japan.'
        }
      ],
      'Present Perfect': [
        {
          rule: 'Cấu trúc cơ bản',
          structure: 'Subject + have/has + past participle',
          explanation: 'Thì hiện tại hoàn thành diễn tả hành động đã xảy ra trong quá khứ nhưng có liên quan đến hiện tại.',
          example: 'I have lived here for 5 years. She has just finished her work.'
        },
        {
          rule: 'Sử dụng với "for" và "since"',
          structure: 'Subject + have/has + V3 + for/since + time',
          explanation: 'For + khoảng thời gian (for 2 hours), since + mốc thời gian cụ thể (since 2010).',
          example: 'They have been married for 10 years. I have known him since we were children.'
        },
        {
          rule: 'Với "already", "yet", "just"',
          structure: 'Subject + have/has + already/just + V3 / haven\'t + V3 + yet',
          explanation: 'Already và just đặt giữa have/has và V3. Yet dùng trong câu phủ định và câu hỏi, đặt cuối câu.',
          example: 'I have already done my homework. Have you finished yet? She has just arrived.'
        }
      ],
      'Present Continuous': [
        {
          rule: 'Cấu trúc hiện tại tiếp diễn',
          structure: 'Subject + am/is/are + V-ing',
          explanation: 'Thì hiện tại tiếp diễn diễn tả hành động đang xảy ra tại thời điểm nói.',
          example: 'I am reading a book now. She is cooking dinner. They are playing football.'
        },
        {
          rule: 'Câu phủ định và câu hỏi',
          structure: 'Subject + am/is/are + not + V-ing / Am/Is/Are + Subject + V-ing?',
          explanation: 'Thêm not sau am/is/are để tạo câu phủ định. Đảo am/is/are lên đầu để tạo câu hỏi.',
          example: 'I am not working today. Is she coming to the party? Are you listening to me?'
        }
      ]
    };

    // Get grammar rules for the topic, or create generic ones
    let selectedRules = grammarDatabase[topic as keyof typeof grammarDatabase] || this.generateGenericGrammar(topic, level);
    
    // Limit to requested count and add variety
    const finalRules = [];
    for (let i = 0; i < count && i < selectedRules.length; i++) {
      finalRules.push(selectedRules[i]);
    }
    
    // If we need more rules, generate additional ones
    while (finalRules.length < count) {
      const additionalRules = this.generateGenericGrammar(topic, level);
      for (let i = 0; i < additionalRules.length && finalRules.length < count; i++) {
        finalRules.push(additionalRules[i]);
      }
    }

    return finalRules.map((rule, index) => ({
      id: `grammar-${Date.now()}-${index}`,
      ...rule
    }));
  }

  private generateGenericGrammar(topic: string, level: string): Array<{rule: string, structure: string, explanation: string, example: string}> {
    const levelBasedGrammar = {
      'A1': [
        {
          rule: `${topic} - Cấu trúc cơ bản`,
          structure: 'Subject + Verb + Object',
          explanation: `Cấu trúc cơ bản của ${topic} ở trình độ sơ cấp. Bao gồm chủ ngữ, động từ và tân ngữ trong câu đơn giản.`,
          example: `This is a basic example of how we use ${topic} in everyday English.`
        },
        {
          rule: `${topic} - Mẫu câu đơn giản`,
          structure: 'Simple sentence pattern',
          explanation: `Mẫu câu đơn giản cho ${topic}, phù hợp với người mới bắt đầu học tiếng Anh.`,
          example: `Here is how beginners can use ${topic} in simple sentences.`
        }
      ],
      'A2': [
        {
          rule: `${topic} - Quy tắc sử dụng`,
          structure: 'Extended sentence structure',
          explanation: `Quy tắc sử dụng ${topic} ở trình độ cơ bản, với nhiều biến thể và ngữ cảnh khác nhau.`,
          example: `We can use ${topic} in various ways to express different meanings and ideas.`
        },
        {
          rule: `${topic} - Mẫu thường gặp`,
          structure: 'Common usage patterns',
          explanation: `Các mẫu thường gặp của ${topic} trong giao tiếp hàng ngày và văn viết đơn giản.`,
          example: `These are common examples of ${topic} that you hear in everyday conversation.`
        }
      ],
      'B1': [
        {
          rule: `${topic} - Cấu trúc nâng cao`,
          structure: 'Intermediate sentence patterns',
          explanation: `Cấu trúc trung cấp của ${topic} với các quy tắc phức tạp hơn và nhiều ứng dụng thực tế.`,
          example: `At intermediate level, students learn to use ${topic} in more sophisticated ways.`
        }
      ],
      'B2': [
        {
          rule: `${topic} - Ứng dụng phức tạp`,
          structure: 'Advanced grammatical structures',
          explanation: `Ứng dụng phức tạp của ${topic} trong văn phong trang trọng và giao tiếp chuyên nghiệp.`,
          example: `Advanced learners can use ${topic} effectively in formal and academic contexts.`
        }
      ],
      'C1': [
        {
          rule: `${topic} - Sử dụng tinh tế`,
          structure: 'High-level grammatical patterns',
          explanation: `Cách sử dụng tinh tế của ${topic} ở trình độ cao, thể hiện sự thành thạo trong ngôn ngữ.`,
          example: `Proficient speakers demonstrate mastery of ${topic} through nuanced and precise usage.`
        }
      ],
      'C2': [
        {
          rule: `${topic} - Trình độ bản ngữ`,
          structure: 'Native-like usage patterns',
          explanation: `Sử dụng ${topic} ở trình độ bản ngữ với các sắc thái tinh tế và biến thể phong cách.`,
          example: `Native-like proficiency in ${topic} includes subtle distinctions and stylistic variations.`
        }
      ]
    };

    return levelBasedGrammar[level as keyof typeof levelBasedGrammar] || levelBasedGrammar['A1'];
  }
}

export const aiCourseGeneratorService = new AICourseGeneratorService();
export type { AIGenerationConfig, GeneratedCourse };
