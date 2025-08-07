/*import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Create a new thread
export async function POST() {
  const thread = await openai.beta.threads.create();
  return Response.json({ threadId: thread.id });
}*/


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

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const corsHeaders = makeCorsHeaders(origin);
  
  try {
    if (!openai) {
      const errorBody = JSON.stringify({ error: "OpenAI API key not configured" });
      return new Response(errorBody, {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const thread = await openai.beta.threads.create();
    const body = JSON.stringify({ threadId: thread.id });

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("AI Chatbot Thread Creation Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

