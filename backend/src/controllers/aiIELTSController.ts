import { Request, Response } from 'express';
import { AIIELTSGeneratorService, IELTSGeneratorConfig } from '../services/aiIELTSGeneratorService';

interface AIIELTSReadingConfig {
  title: string;
  difficulty: string;
  duration: number;
  numPassages: number;
  questionsPerPassage: number;
  topics: string[];
  targetBand: string;
  description?: string;
}

// Legacy mock AI service - kept as fallback
const generateIELTSReadingContentMock = async (config: AIIELTSReadingConfig) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  // IELTS Reading standard: 3 passages with 40 total questions
  // Distribution: Passage 1 (13), Passage 2 (13), Passage 3 (14)
  const getQuestionsForPassage = (passageIndex: number, totalPassages: number): number => {
    if (totalPassages === 3) {
      // Standard IELTS: 13, 13, 14 = 40 questions
      return passageIndex === 2 ? 14 : 13; // Last passage gets 14, others get 13
    }
    // For non-standard configs, distribute evenly
    return config.questionsPerPassage;
  };

  const totalQuestions = config.numPassages === 3 ? 40 : config.numPassages * config.questionsPerPassage;
  
  // Generate passages with realistic content
  const passages = [];
  console.log(`Starting to generate ${config.numPassages} passages with total ${totalQuestions} questions`);
  
  for (let i = 1; i <= config.numPassages; i++) {
    const questionsInThisPassage = getQuestionsForPassage(i - 1, config.numPassages);
    
    // Get specific topic for this passage
    const currentPassageTopic = config.topics[(i-1) % config.topics.length] || 'General Academic Topic';
    console.log(`Creating passage ${i} with topic: "${currentPassageTopic}" and ${questionsInThisPassage} questions`);
    
    const questions = [];
    for (let j = 1; j <= questionsInThisPassage; j++) {
      // Use the specific passage topic instead of random
      const topic = currentPassageTopic;
      
        // Generate different question types that AI can support
        const questionTypes: Array<'multiple-choice' | 'fill-blank' | 'true-false-notgiven'> = 
          ['multiple-choice', 'fill-blank', 'true-false-notgiven'];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let questionText = '';
      let options: string[] | undefined = undefined;
      let correctAnswer = '';

      // Create unique questions based on passage topic and question number
      switch (randomType) {
        case 'multiple-choice':
          const mcQuestions = [
            `According to the passage, what is the main focus of ${topic.toLowerCase()} research?`,
            `Which of the following best describes the current state of ${topic.toLowerCase()}?`,
            `What does the author suggest about the future of ${topic.toLowerCase()}?`,
            `The passage indicates that ${topic.toLowerCase()} has impacted which area most significantly?`,
            `According to experts mentioned in the passage, ${topic.toLowerCase()} will likely result in?`,
            `What is identified as the primary challenge facing ${topic.toLowerCase()}?`,
            `The passage suggests that international cooperation in ${topic.toLowerCase()} is?`,
            `Historical development of ${topic.toLowerCase()} shows that?`,
            `Contemporary approaches to ${topic.toLowerCase()} emphasize?`,
            `The implications of advances in ${topic.toLowerCase()} are described as?`,
            `Educational institutions' response to ${topic.toLowerCase()} developments includes?`,
            `The passage mentions that ${topic.toLowerCase()} research requires?`,
            `Future predictions about ${topic.toLowerCase()} suggest that?`
          ];
          questionText = mcQuestions[(j-1) % mcQuestions.length];
          options = [
            `Rapid technological advancement and innovation`,
            `Increased international collaboration and funding`,
            `Better educational programs and public awareness`,
            `Stricter regulations and ethical guidelines`
          ];
          correctAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
          break;
        case 'true-false-notgiven':
          const tfQuestions = [
            `The author believes that ${topic.toLowerCase()} will become more important in the future.`,
            `Historical pioneers in ${topic.toLowerCase()} recognized its potential from the beginning.`,
            `Contemporary approaches to ${topic.toLowerCase()} focus primarily on individual research.`,
            `Industries worldwide are struggling to adapt to ${topic.toLowerCase()} developments.`,
            `Educational institutions have been slow to respond to ${topic.toLowerCase()} changes.`,
            `International cooperation in ${topic.toLowerCase()} has produced disappointing results.`,
            `The pace of innovation in ${topic.toLowerCase()} has been unprecedented.`,
            `Policymakers are ahead of the curve in addressing ${topic.toLowerCase()} challenges.`,
            `Ethical considerations in ${topic.toLowerCase()} are becoming less important.`,
            `The global nature of ${topic.toLowerCase()} research is a recent development.`,
            `Future applications of ${topic.toLowerCase()} could revolutionize society.`,
            `The responsibility for ${topic.toLowerCase()} development rests solely with researchers.`,
            `Early breakthroughs in ${topic.toLowerCase()} occurred in the late 20th century.`
          ];
          questionText = tfQuestions[(j-1) % tfQuestions.length];
          correctAnswer = ['TRUE', 'FALSE', 'NOT GIVEN'][Math.floor(Math.random() * 3)];
          break;
        case 'fill-blank':
          const fillQuestions = [
            `According to the passage, ${topic.toLowerCase()} has led to _______ in many sectors.`,
            `The historical development of ${topic.toLowerCase()} can be traced back _______ decades.`,
            `Contemporary approaches to ${topic.toLowerCase()} emphasize _______ collaboration.`,
            `Industries worldwide are adapting their practices to incorporate new _______ from research.`,
            `Educational institutions are revising their _______ to prepare students for the future.`,
            `The next decade is expected to bring _______ developments in ${topic.toLowerCase()}.`,
            `International cooperation involves sharing _______ and expertise globally.`,
            `The implications of advances in ${topic.toLowerCase()} are described as _______.`,
            `Modern ${topic.toLowerCase()} research requires _______ cooperation between countries.`,
            `The pace of innovation in ${topic.toLowerCase()} has been _______.`,
            `Policymakers are crafting _______ to address new challenges.`,
            `The responsibility for wise development rests with researchers, policymakers, and _______.`,
            `Future applications could _______ multiple sectors of society.`
          ];
          const fillAnswers = [
            'significant changes', 'several', 'interdisciplinary', 'insights', 'curricula', 
            'significant', 'resources', 'far-reaching', 'international', 'unprecedented',
            'legislation', 'citizens', 'revolutionize'
          ];
          questionText = fillQuestions[(j-1) % fillQuestions.length];
          correctAnswer = fillAnswers[(j-1) % fillAnswers.length];
          break;
        default:
          questionText = `What does the passage say about ${topic.toLowerCase()}?`;
          options = [
            `It is becoming more important`,
            `It faces significant challenges`, 
            `It requires further research`,
            `It has limited applications`
          ];
          correctAnswer = 'A';
          break;
      }
      
      questions.push({
        id: `passage${i}-q${j}`,
        type: randomType,
        question: questionText,
        passage_reference: `Lines ${j * 3 - 2}-${j * 3 + 1}`,
        options: options,
        correct_answer: correctAnswer,
        explanation: `This question tests your understanding of ${topic.toLowerCase()} as discussed in the passage. The correct answer can be found by carefully reading the relevant section.`,
        difficulty: config.difficulty,
        band_score_range: config.targetBand
      });
    }
    
    // Use the same topic as defined for questions
    const passageContentTopic = currentPassageTopic;
    
    // Generate realistic passage content
    const passageContent = `
${passageContentTopic}: A Modern Perspective

${passageContentTopic} has become increasingly significant in today's rapidly evolving world. Recent studies have shown that the impact of ${passageContentTopic.toLowerCase()} extends far beyond what researchers initially anticipated. This comprehensive analysis explores the multifaceted nature of this phenomenon and its implications for society.

The historical development of ${passageContentTopic.toLowerCase()} can be traced back several decades. Early pioneers in the field recognized its potential, but it wasn't until the late 20th century that significant breakthroughs began to emerge. These developments have fundamentally altered our understanding of the subject and opened new avenues for research and application.

Contemporary approaches to ${passageContentTopic.toLowerCase()} emphasize interdisciplinary collaboration. Experts from various fields contribute their unique perspectives, creating a rich tapestry of knowledge that benefits both academic research and practical implementation. This collaborative approach has yielded remarkable results, with innovations appearing at an unprecedented pace.

The implications of these advances are far-reaching. Industries worldwide are adapting their practices to incorporate new insights from ${passageContentTopic.toLowerCase()} research. Educational institutions are revising their curricula to ensure students are prepared for a future shaped by these developments. Policymakers are crafting legislation that addresses both the opportunities and challenges presented by this rapidly evolving field.

Looking toward the future, experts predict that ${passageContentTopic.toLowerCase()} will continue to play an increasingly important role in shaping our world. The next decade is expected to bring even more significant developments, with potential applications that could revolutionize multiple sectors of society. However, this progress also brings new responsibilities and ethical considerations that must be carefully addressed.

The global nature of modern ${passageContentTopic.toLowerCase()} research means that international cooperation is essential. Countries around the world are sharing resources and expertise to tackle common challenges and pursue shared goals. This collaborative spirit has already produced remarkable results and promises even greater achievements in the years to come.

As we stand on the threshold of a new era in ${passageContentTopic.toLowerCase()}, it is clear that the decisions made today will have lasting consequences for future generations. The responsibility to guide this development wisely rests with all of us – researchers, policymakers, educators, and citizens alike.
    `.trim();
    
    passages.push({
      id: `passage${i}`,
      title: `Passage ${i}: ${passageContentTopic}`,
      content: passageContent,
      word_count: passageContent.split(' ').length,
      topic: passageContentTopic,
      difficulty: config.difficulty,
      academic_level: 'University',
      source_type: 'academic' as const,
      questions: questions
    });
    
    console.log(`Created passage ${i}: "${passageContentTopic}" with ${questions.length} questions`);
  }
  
  console.log(`Total passages created: ${passages.length}`);
  console.log(`Passages summary:`, passages.map(p => ({ id: p.id, title: p.title, questionCount: p.questions.length })));

  return {
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
};

export const generateIELTSReading = async (req: Request, res: Response) => {
  try {
    const config: AIIELTSReadingConfig = req.body;

    // Validate required fields
    if (!config.title || !config.difficulty || !config.duration) {
      return res.status(400).json({
        error: 'Missing required fields: title, difficulty, duration'
      });
    }

    // Validate passages and questions
    if (!config.numPassages || config.numPassages < 1 || config.numPassages > 4) {
      return res.status(400).json({
        error: 'Number of passages must be between 1 and 4'
      });
    }

    if (!config.questionsPerPassage || config.questionsPerPassage < 5 || config.questionsPerPassage > 20) {
      return res.status(400).json({
        error: 'Questions per passage must be between 5 and 20'
      });
    }

    // Validate topics
    if (!config.topics || config.topics.length === 0) {
      return res.status(400).json({
        error: 'At least one topic is required'
      });
    }

    // Validate duration
    if (config.duration < 30 || config.duration > 120) {
      return res.status(400).json({
        error: 'Duration must be between 30 and 120 minutes'
      });
    }

    console.log('🚀 Generating IELTS Reading test with config:', config);

    let generatedExam;

    // Check if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Using OpenAI API for real content generation');
        const aiService = new AIIELTSGeneratorService();
        generatedExam = await aiService.generateIELTSReadingTest(config);
        console.log('✅ AI-generated IELTS Reading test completed:', generatedExam.title);
      } catch (aiError) {
        console.error('❌ AI generation failed, falling back to mock data:', aiError);
        console.log('🔄 Using mock data generation as fallback');
        generatedExam = await generateIELTSReadingContentMock(config);
      }
    } else {
      console.warn('⚠️ OpenAI API key not found, using mock data');
      generatedExam = await generateIELTSReadingContentMock(config);
    }

    console.log('📝 Generated IELTS Reading test:', generatedExam.title);

    // Check if response already sent (e.g., by timeout middleware)
    if (res.headersSent) {
      console.warn('⚠️ Response already sent, skipping json send');
      return;
    }

    return res.json({
      success: true,
      exam: generatedExam,
      generatedWith: process.env.OPENAI_API_KEY ? 'ai' : 'mock'
    });

  } catch (error) {
    console.error('❌ Error generating IELTS Reading test:', error);
    
    // Check if response already sent
    if (res.headersSent) {
      console.warn('⚠️ Response already sent, skipping error send');
      return;
    }
    
    return res.status(500).json({
      error: 'Failed to generate IELTS Reading test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getIELTSTopicSuggestions = async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.query;
    
    let suggestions: string[];

    // Check if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Getting AI-powered topic suggestions for difficulty:', difficulty);
        const aiService = new AIIELTSGeneratorService();
        suggestions = await aiService.getTopicSuggestions(difficulty as string);
        console.log('✅ AI topic suggestions retrieved:', suggestions.length);
      } catch (aiError) {
        console.error('❌ AI topic suggestions failed, using defaults:', aiError);
        suggestions = getDefaultTopics();
      }
    } else {
      console.log('⚠️ OpenAI API key not found, using default topics');
      suggestions = getDefaultTopics();
    }

    // Check if response already sent
    if (res.headersSent) {
      console.warn('⚠️ Response already sent for topic suggestions');
      return;
    }

    return res.json({
      success: true,
      suggestions: suggestions,
      generatedWith: process.env.OPENAI_API_KEY ? 'ai' : 'default'
    });

  } catch (error) {
    console.error('❌ Error getting topic suggestions:', error);
    
    // Check if response already sent
    if (res.headersSent) {
      console.warn('⚠️ Response already sent, skipping error response');
      return;
    }
    
    return res.status(500).json({
      error: 'Failed to get topic suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function for default topics
function getDefaultTopics(): string[] {
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

export const validateIELTSContent = async (req: Request, res: Response) => {
  try {
    const { exam } = req.body;

    // Basic validation of exam structure
    const isValid = exam &&
      exam.title &&
      exam.passages &&
      Array.isArray(exam.passages) &&
      exam.passages.length > 0 &&
      exam.total_questions &&
      exam.duration;

    return res.json({
      success: true,
      valid: isValid
    });

  } catch (error) {
    console.error('Error validating IELTS content:', error);
    return res.status(500).json({
      error: 'Failed to validate IELTS content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
