/*import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request, { params: { threadId } }) {
  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}*/
// /app/api/threads/[threadId]/message/route.js

/*import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

export async function OPTIONS() {
  // Handle preflight requests for CORS
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request, { params }) {
  const threadId = params.threadId;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  // Stream response with headers
  const response = new Response(stream.toReadableStream(), {
    headers: corsHeaders,
  });

  return response;
}*/



// routes/api/assistants/[threadId]/messages/route.ts
import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = new Set([
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:5001",
  "http://localhost:80",
  "http://localhost:8080",
  "https://im-connected-production.up.railway.app",
  "https://scanner-service.up.railway.app",
  "https://ai-chatbot-production-c94d.up.railway.app",
]);

function makeCorsHeaders(origin: string | null) {
  // In production environment, be more permissive for Railway deployments
  if (process.env.NODE_ENV === 'production') {
    // Allow Railway domains and cross-service communication
    if (!origin || origin.includes('railway.app') || origin.includes('localhost')) {
      return {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      };
    }
  }
  
  // Development environment with strict origin checking
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { 
    status: 204, 
    headers: makeCorsHeaders(request.headers.get("origin")) 
  });
}

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  const origin = request.headers.get("origin");
  const corsHeaders = makeCorsHeaders(origin);
  
  try {
    console.log("AI Chatbot Messages API called for thread:", params.threadId);
    
    if (!openai) {
      console.error("OpenAI client not initialized");
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!assistantId) {
      console.error("Assistant ID not configured");
      return new Response(JSON.stringify({ error: "Assistant ID not configured" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const threadId = params.threadId;
    const { content } = await request.json();
    
    console.log("Creating message in thread:", threadId, "with content:", content?.substring(0, 100) + "...");

    // Create the user message
    await openai.beta.threads.messages.create(threadId, { 
      role: "user", 
      content: content 
    });
    
    console.log("Message created, starting stream with assistant:", assistantId);

    // Start the assistant run with streaming
    const stream = openai.beta.threads.runs.stream(threadId, { 
      assistant_id: assistantId 
    });

    // Return the stream with proper CORS headers
    return new Response(stream.toReadableStream(), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Chatbot Messages API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

