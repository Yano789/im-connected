import OpenAI from "openai";

// Initialize OpenAI client with error handling for build time
export const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;
