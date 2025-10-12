/**
 * Test script for AI-powered IELTS test generation
 * Run with: node test-ai-ielts.js
 */

const testAIIELTS = async () => {
  console.log('🧪 Testing AI-powered IELTS generation...\n');

  const testConfig = {
    title: 'AI-Generated IELTS Reading Test - Technology',
    difficulty: 'Medium',
    duration: 60,
    numPassages: 2,
    questionsPerPassage: 10,
    topics: [
      'Artificial Intelligence and Machine Learning',
      'Climate Change and Renewable Energy'
    ],
    targetBand: '6.5-7.5',
    description: 'A comprehensive reading test focusing on modern technology topics'
  };

  try {
    console.log('📤 Sending request to generate IELTS test...');
    console.log('Config:', JSON.stringify(testConfig, null, 2));
    console.log('\n');

    const response = await fetch('http://localhost:5002/api/ai/generate-ielts-reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Replace with actual admin token
      },
      body: JSON.stringify(testConfig)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();
    
    console.log('✅ IELTS test generated successfully!\n');
    console.log('Generated with:', result.generatedWith);
    console.log('Title:', result.exam.title);
    console.log('Total passages:', result.exam.passages.length);
    console.log('Total questions:', result.exam.total_questions);
    console.log('Duration:', result.exam.duration, 'minutes');
    console.log('\n📝 Passages:');
    
    result.exam.passages.forEach((passage, index) => {
      console.log(`\nPassage ${index + 1}:`);
      console.log('  Title:', passage.title);
      console.log('  Topic:', passage.topic);
      console.log('  Word count:', passage.word_count);
      console.log('  Questions:', passage.questions.length);
      console.log('  Question types:', [...new Set(passage.questions.map(q => q.type))].join(', '));
    });

    console.log('\n🎯 Test Topics Covered:');
    result.exam.passages.forEach((passage, index) => {
      console.log(`  ${index + 1}. ${passage.topic}`);
    });

    // Save result to file for inspection
    const fs = require('fs');
    const filename = `ai-ielts-test-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(result.exam, null, 2));
    console.log(`\n💾 Full test saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test topic suggestions
const testTopicSuggestions = async () => {
  console.log('\n🧪 Testing AI topic suggestions...\n');

  try {
    const response = await fetch('http://localhost:5002/api/ai/ielts-topic-suggestions?difficulty=Medium', {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Replace with actual admin token
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();
    
    console.log('✅ Topic suggestions retrieved!\n');
    console.log('Generated with:', result.generatedWith);
    console.log('Topics:', result.suggestions.length);
    console.log('\n📋 Suggested Topics:');
    result.suggestions.forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  AI-Powered IELTS Test Generation - Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  await testTopicSuggestions();
  console.log('\n' + '─'.repeat(60) + '\n');
  await testAIIELTS();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Suite Completed');
  console.log('═══════════════════════════════════════════════════════\n');
};

runTests();
