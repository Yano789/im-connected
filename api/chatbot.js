// Vercel serverless function wrapper for AI Chatbot Next.js API routes
export default async function handler(req, res) {
  try {
    // Set CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Extract the path from the request URL
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Remove the /api/chatbot prefix from the path
    const apiPath = pathname.replace('/api/chatbot', '');
    
    // Route to appropriate Next.js API handler based on path
    if (apiPath.includes('/assistants/threads') && apiPath.includes('/actions')) {
      const { POST } = await import('../BACKEND/AI_chatbot/src/app/api/assistants/threads/[threadId]/actions/route.ts');
      const response = await POST();
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (apiPath.includes('/assistants/threads') && apiPath.includes('/messages')) {
      const { POST } = await import('../BACKEND/AI_chatbot/src/app/api/assistants/threads/[threadId]/messages/route.ts');
      const response = await POST();
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (apiPath.includes('/assistants/threads')) {
      const { POST } = await import('../BACKEND/AI_chatbot/src/app/api/assistants/threads/route.ts');
      const response = await POST();
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (apiPath.includes('/assistants')) {
      const { POST } = await import('../BACKEND/AI_chatbot/src/app/api/assistants/route.ts');
      const response = await POST();
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    
    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
