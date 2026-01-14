/**
 * Test Speechace API directly
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function testSpeechaceAPI() {
  try {
    // Get API key
    const rawKey = process.env.SPEECHACE_API_KEY || '';
    const apiKey = decodeURIComponent(rawKey);
    
    console.log('🔑 API Key length:', apiKey.length);
    console.log('🔑 First 20 chars:', apiKey.substring(0, 20));
    console.log('🔑 Last 20 chars:', apiKey.substring(apiKey.length - 20));
    
    // Find a test audio file
    const audioPath = 'E:\\github\\hyteam\\website-hoc-tieng-anh\\backend\\temp\\audio\\cloudinary-mp3-695d2d8f98f8851605b5bb38-0-1768378992045.mp3';
    
    if (!fs.existsSync(audioPath)) {
      console.error('❌ Audio file not found:', audioPath);
      console.log('Please provide a valid audio file path');
      return;
    }
    
    console.log('🎤 Audio file:', audioPath);
    console.log('📊 File size:', fs.statSync(audioPath).size, 'bytes');
    
    // Prepare FormData
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('text', 'I like to travel around the world');
    formData.append('user_audio_file', fs.createReadStream(audioPath));
    formData.append('dialect', 'en-us');
    formData.append('user_id', 'test-user-123');
    
    console.log('\n📋 Sending request to Speechace...');
    
    const response = await axios.post(
      'https://api2.speechace.com/api/scoring/text/v0.5/json',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000,
      }
    );
    
    console.log('\n✅ Response status:', response.data.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSpeechaceAPI();
