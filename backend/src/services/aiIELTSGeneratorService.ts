import OpenAI from 'openai';

export interface IELTSGeneratorConfig {
  title: string;
  difficulty: string;
  duration: number;
  numPassages: number;
  questionsPerPassage: number;
  topics: string[];
  targetBand: string;
  description?: string;
}

export class AIIELTSGeneratorService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate IELTS Reading test using OpenAI GPT-4
   */
  async generateIELTSReadingTest(config: IELTSGeneratorConfig) {
    console.log('🤖 Starting AI generation for IELTS Reading test:', config.title);

    const totalQuestions = config.numPassages * config.questionsPerPassage;
    const passages = [];

    // Generate each passage
    for (let i = 0; i < config.numPassages; i++) {
      const topic = config.topics[i % config.topics.length];
      console.log(`📝 Generating passage ${i + 1}/${config.numPassages} with topic: "${topic}"`);

      try {
        const passage = await this.generatePassage(topic, config, i + 1);
        passages.push(passage);
        console.log(`✅ Passage ${i + 1} generated successfully`);
      } catch (error) {
        console.error(`❌ Error generating passage ${i + 1}:`, error);
        throw error;
      }
    }

    const result = {
      title: config.title,
      description: config.description || `A comprehensive IELTS Reading test featuring ${config.numPassages} passages with ${totalQuestions} questions`,
      type: 'reading' as const,
      difficulty: config.difficulty,
      duration: config.duration,
      total_questions: totalQuestions,
      target_band: config.targetBand,
      instructions: [
        'Read each passage carefully before attempting the questions',
        'Manage your time effectively across all passages',
        'Look for keywords in questions to help locate relevant information',
        'Check your answers before moving to the next passage'
      ],
      passages: passages,
      scoring_criteria: {
        band_5: { min_correct: Math.floor(totalQuestions * 0.35), max_correct: Math.floor(totalQuestions * 0.42) },
        band_6: { min_correct: Math.floor(totalQuestions * 0.43), max_correct: Math.floor(totalQuestions * 0.54) },
        band_7: { min_correct: Math.floor(totalQuestions * 0.55), max_correct: Math.floor(totalQuestions * 0.69) },
        band_8: { min_correct: Math.floor(totalQuestions * 0.70), max_correct: Math.floor(totalQuestions * 0.84) },
        band_9: { min_correct: Math.floor(totalQuestions * 0.85), max_correct: totalQuestions }
      },
      time_allocation: {
        per_passage: Math.floor(config.duration / config.numPassages),
        total_reading: Math.floor(config.duration * 0.6),
        total_answering: Math.floor(config.duration * 0.4)
      },
      tips: [
        'Skim all passages first to get an overview',
        'Pay attention to keywords in questions',
        'Manage your time effectively across all passages',
        'Don\'t spend too much time on difficult questions',
        'Use elimination method for multiple choice questions'
      ]
    };

    console.log('🎉 IELTS Reading test generated successfully:', result.title);
    return result;
  }

  /**
   * Generate a single passage with questions
   */
  private async generatePassage(topic: string, config: IELTSGeneratorConfig, passageNumber: number) {
    const systemPrompt = `You are an IELTS expert specializing in creating authentic IELTS Academic Reading passages. 
Your passages must be comprehensive, well-researched, and match the quality of official IELTS tests.

Critical Requirements:
- Target difficulty: ${config.difficulty}
- Target band score: ${config.targetBand}
- Passage length: EXACTLY 750-900 words (count carefully)
- Academic style with sophisticated vocabulary
- Multiple detailed paragraphs with clear structure
- Include specific facts, statistics, examples, and expert opinions
- Complex sentence structures with varied syntax
- Formal academic tone throughout`;

    const userPrompt = `Create a comprehensive IELTS Academic Reading passage about "${topic}".

MANDATORY REQUIREMENTS:
1. LENGTH: Write a complete passage of 750-900 words. This is NON-NEGOTIABLE.
2. STRUCTURE: Divide into 6-8 well-developed paragraphs, each 100-150 words
3. CONTENT DEPTH:
   - Introduction: Context and background (100-120 words)
   - Body paragraphs (4-6 paragraphs): Each covering a specific aspect with:
     * Topic sentence
     * Supporting evidence and examples
     * Data, statistics, or research findings where relevant
     * Expert opinions or case studies
   - Conclusion: Summary and implications (80-100 words)

4. LANGUAGE QUALITY:
   - Use advanced academic vocabulary (Band 7-8 level)
   - Include technical terms relevant to the topic
   - Vary sentence structures (simple, compound, complex)
   - Use cohesive devices (however, moreover, consequently, etc.)

5. ACADEMIC FEATURES:
   - Present multiple perspectives or approaches
   - Include cause-effect relationships
   - Compare and contrast ideas
   - Discuss advantages and disadvantages
   - Reference research or studies (can be general)

6. TOPIC COVERAGE for "${topic}":
   - Historical context or development
   - Current state and key issues
   - Expert opinions and research findings
   - Future trends or implications
   - Practical applications or examples

IMPORTANT: Do NOT write placeholder text like "[Additional content would continue here]" or "[Content continues...]". 
Write the COMPLETE passage with ALL paragraphs fully developed.

Format your response as a JSON object:
{
  "title": "Engaging academic title (10-15 words)",
  "content": "COMPLETE passage text (750-900 words, NO placeholders)",
  "word_count": actual_word_count,
  "topic": "${topic}",
  "key_concepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "paragraph_count": number_of_paragraphs
}

Write the passage NOW - complete and comprehensive. No shortcuts or placeholders.`;

    // Generate passage content with higher token limit
    const passageResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7, // Slightly lower for more focused content
      max_tokens: 3500  // Increased to ensure full passage generation
    });

    const passageData = JSON.parse(passageResponse.choices[0]?.message?.content || '{}');

    // Validate passage quality
    const wordCount = passageData.word_count || passageData.content?.split(/\s+/).length || 0;
    if (wordCount < 700) {
      console.warn(`⚠️ Warning: Generated passage only ${wordCount} words. Expected 750-900 words.`);
    }
    
    // Check for placeholder text
    if (passageData.content?.includes('[') || passageData.content?.includes('would continue') || passageData.content?.includes('...')) {
      console.warn('⚠️ Warning: Passage may contain placeholder text');
    }

    console.log(`📝 Passage ${passageNumber} generated: "${passageData.title}" (${wordCount} words)`);

    // Generate questions for this passage
    const questions = await this.generateQuestions(passageData.content, topic, config, passageNumber);

    return {
      id: `passage${passageNumber}`,
      title: `Passage ${passageNumber}: ${passageData.title}`,
      content: passageData.content,
      word_count: wordCount,
      topic: topic,
      difficulty: config.difficulty,
      academic_level: 'University',
      source_type: 'academic' as const,
      questions: questions
    };
  }

  /**
   * Generate questions for a passage
   */
  private async generateQuestions(passageContent: string, topic: string, config: IELTSGeneratorConfig, passageNumber: number) {
    const systemPrompt = `You are an IELTS examiner creating authentic IELTS Reading questions. 
Generate ${config.questionsPerPassage} diverse questions that test comprehension of the passage.

Question types to use (mix them):
1. Multiple Choice (4 options: A, B, C, D)
2. True/False/Not Given
3. Fill in the blank (short answer)

Requirements:
- Questions must be answerable from the passage
- Vary question difficulty
- Test different comprehension skills (detail, main idea, inference)
- Use IELTS-style wording
- Provide clear correct answers
- Each question should be unique and test different parts of the passage`;

    const userPrompt = `Based on this passage, create ${config.questionsPerPassage} IELTS Reading questions:

PASSAGE:
${passageContent}

Generate a JSON array of exactly ${config.questionsPerPassage} questions with this structure:
[
  {
    "id": "passage${passageNumber}-q1",
    "type": "multiple-choice" | "true-false-notgiven" | "fill-blank",
    "question": "Question text",
    "passage_reference": "Lines X-Y or paragraph reference",
    "options": ["A", "B", "C", "D"] (only for multiple-choice, null otherwise),
    "correct_answer": "A" | "TRUE" | "FALSE" | "NOT GIVEN" | "short answer text",
    "explanation": "Why this is the correct answer",
    "difficulty": "${config.difficulty}",
    "band_score_range": "${config.targetBand}"
  }
]

IMPORTANT:
- Mix question types (at least 2 types)
- Questions should progressively test different parts of the passage
- Correct answers must be clearly identifiable in the passage
- For True/False/Not Given: answer must be exactly one of these three
- For Fill in the blank: answer should be 1-3 words from the passage
- For Multiple choice: options should be plausible but only one correct`;

    const questionsResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000
    });

    const responseContent = questionsResponse.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseContent);
    
    // Handle both array format and object with questions property
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

    return questions;
  }

  /**
   * Get topic suggestions based on difficulty
   */
  async getTopicSuggestions(difficulty?: string): Promise<string[]> {
    const systemPrompt = `You are an IELTS expert. Suggest 15 diverse academic topics suitable for IELTS Reading tests.
Topics should be:
- Academic and informative
- Suitable for ${difficulty || 'all levels'}
- Cover various fields (science, technology, society, culture, environment, etc.)
- Interesting and relevant to contemporary issues`;

    const userPrompt = `Provide 15 academic topics suitable for IELTS Reading passages at ${difficulty || 'various'} difficulty levels.
Format as a JSON array of strings: ["Topic 1", "Topic 2", ...]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return parsed.topics || parsed.suggestions || [];
    } catch (error) {
      console.error('Error getting topic suggestions from AI:', error);
      // Fallback to default topics
      return [
        'Technology and Innovation',
        'Environmental Conservation',
        'Education and Learning Methods',
        'Health and Medical Research',
        'Business and Economics',
        'Scientific Discoveries',
        'Cultural Heritage and History',
        'Social Media and Communication',
        'Urban Planning and Development',
        'Psychology and Human Behavior',
        'Art and Creative Expression',
        'Travel and Cultural Exchange',
        'Renewable Energy Sources',
        'Food Security and Agriculture',
        'Space Exploration and Research'
      ];
    }
  }
}
