const fetch = require('node-fetch');

// Test data cho reading exam
const readingExamData = {
  title: "Test Reading Exam",
  type: "reading",
  difficulty: "Band 6.0-7.0",
  duration: 60,
  description: "Test reading exam for debugging",
  passages: [
    {
      id: "1",
      title: "Test Passage",
      content: "This is a test passage content for reading comprehension.",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the main topic?",
          options: ["Topic A", "Topic B", "Topic C", "Topic D"],
          correctAnswer: 0,
          explanation: "This is the explanation"
        }
      ]
    }
  ]
};

// Test data cho listening exam
const listeningExamData = {
  title: "Test Listening Exam",
  type: "listening",
  difficulty: "Band 6.0-7.0",
  duration: 40,
  description: "Test listening exam for debugging",
  sections: [
    {
      id: "1",
      title: "Section 1",
      description: "Conversation between two people",
      duration: 10,
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the speaker's main concern?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "This is the explanation"
        }
      ]
    }
  ]
};

async function testCreateExam(examData, examType) {
  try {
    console.log(`\nTesting ${examType} exam creation...`);
    
    const response = await fetch('http://localhost:5002/api/ielts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need a valid admin token for this to work
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      },
      body: JSON.stringify(examData)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error('❌ Failed to create exam');
      return false;
    }

    console.log('✅ Exam created successfully');
    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing IELTS Exam Creation API...');
  
  // Test without authentication first
  console.log('\n--- Testing without authentication ---');
  await testCreateExam(readingExamData, 'reading');
  
  // You can add more tests here with valid tokens
  console.log('\n--- Note: Add valid admin token to test with authentication ---');
}

main();
