import OpenAI from "openai";

// Debug API key loading
console.log('OpenAI Configuration Debug:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('- OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A');
console.log('- OPENAI_API_KEY ends with:', process.env.OPENAI_API_KEY?.substring(-10) || 'N/A');

// Initialize OpenAI client with error handling for build time
export const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

console.log('OpenAI client initialized:', !!openai);
