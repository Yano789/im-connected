// Vercel serverless function for assistants endpoint
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const assistant = await openai.beta.assistants.create({
        instructions: "You are a helpful assistant.",
        name: "Quickstart Assistant", 
        model: "gpt-4o",
        tools: [
          { type: "code_interpreter" },
          {
            type: "function",
            function: {
              name: "summarize_text",
              description: "When the user asks to summarize a post, input the post title word for word into summarize_text() in utils/summary.ts. Then summarize the content returned from summarize_text() for the user.",
              parameters: {
                type: "object",
                properties: {
                  "postTitle": {
                    "type": "string",
                    "description": "Title of the post to summarize information about"
                  }
                },
                required: ["postTitle"]
              },
            }
          },
          { type: "file_search" },
        ],
      });
      return res.status(200).json({ assistantId: assistant.id });
    } catch (error) {
      console.error('Error creating assistant:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
