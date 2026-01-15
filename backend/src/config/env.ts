import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

// Debug logging
console.log('✅ Environment file path:', envPath);
console.log('✅ Dotenv parse result:', result.error ? `ERROR: ${result.error.message}` : 'SUCCESS');
console.log('✅ OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('✅ OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 20)}... (length: ${process.env.OPENAI_API_KEY.length})` : 'UNDEFINED');

// List all loaded env vars for debugging
console.log('✅ All env vars starting with OPENAI:', 
  Object.keys(process.env)
    .filter(key => key.includes('OPENAI'))
    .map(key => `${key}=${process.env[key]?.substring(0, 20)}...`)
);
