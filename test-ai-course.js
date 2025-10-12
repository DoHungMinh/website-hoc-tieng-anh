// Test AI Course Generation
const axios = require('axios');

const testAIGeneration = async () => {
  console.log('🧪 Testing AI Course Generation...\n');
  
  try {
    const response = await axios.post('http://localhost:5002/api/ai/generate-course', {
      type: 'vocabulary',
      topic: 'Technology',
      level: 'B1',
      contentLength: 15,
      price: 199000,
      duration: '3 tuần',
      includePronunciation: true,
      includeExamples: true,
      difficulty: 'intermediate'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds
    });

    const course = response.data.course;
    console.log('✅ Response received!\n');
    console.log('📚 Course Title:', course.title);
    console.log('📊 Total Vocabulary:', course.vocabulary.length);
    console.log('\n🔍 First 3 vocabulary items:\n');
    
    course.vocabulary.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. Word: ${item.word}`);
      console.log(`   Pronunciation: ${item.pronunciation}`);
      console.log(`   Meaning: ${item.meaning}`);
      console.log(`   Example: ${item.example}`);
      console.log('');
    });

    // Check if it's mock data or real AI
    const firstWord = course.vocabulary[0].word;
    if (firstWord.includes('-word-') || firstWord.includes('technology-word')) {
      console.log('❌ RESULT: This is MOCK DATA');
      console.log('   Reason: Word format looks like "technology-word-1"\n');
    } else if (firstWord.match(/^[a-z]+$/i) && course.vocabulary[0].meaning.length > 20) {
      console.log('✅ RESULT: This is REAL AI DATA from OpenAI');
      console.log('   Reason: Real English word with detailed meaning\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testAIGeneration();
