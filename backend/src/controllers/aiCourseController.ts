import { Request, Response } from 'express';
import { aiCourseGeneratorService } from '../services/aiCourseGeneratorService';

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

export const generateCourse = async (req: Request, res: Response) => {
  try {
    const config: AIGenerationConfig = req.body;

    // Validate required fields
    if (!config.type || !config.topic || !config.level) {
      return res.status(400).json({
        error: 'Missing required fields: type, topic, level'
      });
    }

    // Validate content length
    if (!config.contentLength || config.contentLength < 5 || config.contentLength > 100) {
      return res.status(400).json({
        error: 'Content length must be between 5 and 100'
      });
    }

    // Validate price - Allow 0 for free courses (courses within Level packages)
    if (config.price === undefined || config.price === null || config.price < 0) {
      return res.status(400).json({
        error: 'Price must be 0 or a positive number'
      });
    }

    console.log(`🚀 Starting AI generation: ${config.contentLength} ${config.type} items for topic "${config.topic}"`);
    
    // Generate course using AI service
    const generatedCourse = await aiCourseGeneratorService.generateCourse(config);

    // Check if response was already sent (safety check)
    if (res.headersSent) {
      console.warn('⚠️ Response already sent, skipping success response');
      return;
    }

    console.log(`✅ Successfully generated course with ${config.type === 'vocabulary' ? generatedCourse.vocabulary.length : generatedCourse.grammar.length} items`);

    return res.json({
      success: true,
      course: generatedCourse
    });

  } catch (error) {
    console.error('❌ Error in generateCourse controller:', error);
    
    // Check if response was already sent
    if (res.headersSent) {
      console.warn('⚠️ Response already sent, skipping error response');
      return;
    }
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({
          error: 'AI service configuration error'
        });
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return res.status(429).json({
          error: 'AI service temporarily unavailable. Please try again later.'
        });
      }
    }

    return res.status(500).json({
      error: 'Failed to generate course content'
    });
  }
};

export const getTopicSuggestions = async (req: Request, res: Response) => {
  try {
    const { type, level } = req.query;

    const suggestions = {
      vocabulary: {
        A1: ['Family & Friends', 'Daily Routines', 'Food & Drinks', 'Colors & Numbers', 'Basic Greetings'],
        A2: ['Travel & Transportation', 'Shopping', 'Weather', 'Hobbies', 'Health & Body'],
        B1: ['Work & Career', 'Education', 'Technology', 'Environment', 'Culture & Traditions'],
        B2: ['Business Communication', 'Media & News', 'Science & Research', 'Politics', 'Economics'],
        C1: ['Academic Writing', 'Professional Development', 'Advanced Literature', 'Philosophy', 'Global Issues'],
        C2: ['Specialized Terminology', 'Idiomatic Expressions', 'Advanced Rhetoric', 'Technical Writing', 'Cultural Nuances']
      },
      grammar: {
        A1: ['Present Simple', 'Basic Questions', 'Plural Nouns', 'Articles (a/an/the)', 'Basic Adjectives'],
        A2: ['Past Simple', 'Future Plans', 'Comparatives', 'Modal Verbs (can/could)', 'Present Continuous'],
        B1: ['Present Perfect', 'Conditionals', 'Passive Voice', 'Reported Speech', 'Relative Clauses'],
        B2: ['Mixed Conditionals', 'Advanced Passive', 'Subjunctive Mood', 'Complex Sentences', 'Phrasal Verbs'],
        C1: ['Advanced Grammar Patterns', 'Discourse Markers', 'Ellipsis & Substitution', 'Inversion', 'Cleft Sentences'],
        C2: ['Stylistic Variations', 'Advanced Syntax', 'Register & Formality', 'Complex Modality', 'Advanced Cohesion']
      }
    };

    const topicList = suggestions[type as keyof typeof suggestions]?.[level as keyof (typeof suggestions)['vocabulary']] || [];

    return res.json({
      success: true,
      suggestions: topicList
    });

  } catch (error) {
    console.error('Error in getTopicSuggestions:', error);
    return res.status(500).json({
      error: 'Failed to get topic suggestions'
    });
  }
};
