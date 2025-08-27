const fetch = require('node-fetch');

async function getAdminToken() {
  try {
    console.log('🔐 Getting admin token...');
    
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@shopcong.io.vn',
        password: 'Admin123!@#'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Login failed:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Login successful!');
    console.log('User:', data.user);
    console.log('Token:', data.token);
    
    return data.token;
  } catch (error) {
    console.error('❌ Network error during login:', error.message);
    return null;
  }
}

// Test data cho reading exam
const readingExamData = {
  title: "Test Reading Exam - Debug",
  type: "reading",
  difficulty: "Band 6.0-7.0",
  duration: 60,
  description: "Test reading exam for debugging API",
  passages: [
    {
      id: "1",
      title: "Climate Change Impact",
      content: "Climate change is one of the most pressing issues of our time. Scientists around the world have been studying its effects on various ecosystems and human societies.",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the main topic of the passage?",
          options: ["Weather patterns", "Climate change", "Ecosystem studies", "Human societies"],
          correctAnswer: 1,
          explanation: "The passage primarily discusses climate change and its effects."
        },
        {
          id: "2",
          type: "true-false-notgiven",
          question: "Scientists have been researching climate change effects.",
          correctAnswer: "True",
          explanation: "The passage states that scientists have been studying climate change effects."
        }
      ]
    }
  ]
};

// Test data cho listening exam
const listeningExamData = {
  title: "Test Listening Exam - Debug",
  type: "listening",
  difficulty: "Band 6.0-7.0",
  duration: 40,
  description: "Test listening exam for debugging API",
  sections: [
    {
      id: "1",
      title: "Section 1 - Conversation",
      description: "A conversation between a student and a librarian",
      duration: 10,
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What does the student want to borrow?",
          options: ["A textbook", "A novel", "A research paper", "A magazine"],
          correctAnswer: 0,
          explanation: "The student asks about borrowing a textbook."
        },
        {
          id: "2",
          type: "fill-blank",
          question: "The library closes at _______ PM.",
          correctAnswer: "9",
          explanation: "The librarian mentions the library closes at 9 PM."
        }
      ]
    }
  ]
};

async function testCreateExam(examData, examType, token) {
  try {
    console.log(`\n📝 Testing ${examType} exam creation...`);
    
    const response = await fetch('http://localhost:5002/api/ielts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(examData)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to create exam');
      console.error('Response body:', responseText);
      return false;
    }

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Exam created successfully!');
      console.log('Exam ID:', responseData.data._id);
      console.log('Title:', responseData.data.title);
      console.log('Type:', responseData.data.type);
      console.log('Total Questions:', responseData.data.totalQuestions);
      return true;
    } catch (parseError) {
      console.log('✅ Exam created (response not JSON):', responseText);
      return true;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing IELTS Exam Creation API with Authentication...\n');
  
  // Get admin token
  const token = await getAdminToken();
  if (!token) {
    console.error('❌ Could not get admin token. Exiting...');
    return;
  }
  
  console.log('\n--- Testing Reading Exam Creation ---');
  const readingSuccess = await testCreateExam(readingExamData, 'reading', token);
  
  console.log('\n--- Testing Listening Exam Creation ---');
  const listeningSuccess = await testCreateExam(listeningExamData, 'listening', token);
  
  console.log('\n🎯 Test Results:');
  console.log(`Reading exam: ${readingSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Listening exam: ${listeningSuccess ? '✅ PASSED' : '❌ FAILED'}`);
}

main();
