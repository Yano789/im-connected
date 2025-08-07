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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      };
    }
  }
  
  // Development environment with strict origin checking
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: makeCorsHeaders(request.headers.get("origin")),
  });
}

// Create a new assistant
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const corsHeaders = makeCorsHeaders(origin);
  
  try {
    if (!openai) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

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
    
    return new Response(JSON.stringify({ assistantId: assistant.id }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("AI Chatbot Assistant Creation Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}
