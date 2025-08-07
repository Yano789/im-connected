/*import { openai } from "@/app/openai";

// Send a new message to a thread
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

export async function POST(request, { params: { threadId } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const { toolCallOutputs, runId } = await request.json();

  const stream = openai.beta.threads.runs.submitToolOutputsStream(
    threadId,
    runId,
    // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
    { tool_outputs: toolCallOutputs }
  );

  const response = new Response(stream.toReadableStream(), {
    headers: corsHeaders,
  });

  //return new Response(stream.toReadableStream());

  return response;
}*/

// e.g., app/api/your-route/route.ts


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
    headers: makeCorsHeaders(request.headers.get("origin")),
  });
}

export async function POST(
  request: Request,
  { params: { threadId } }: { params: { threadId: string } }
) {
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

    const { toolCallOutputs, runId } = await request.json();
    console.log(toolCallOutputs)

    const stream = openai.beta.threads.runs.submitToolOutputsStream(
      threadId,
      runId,
      { tool_outputs: toolCallOutputs }
    );

    return new Response(stream.toReadableStream(), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Chatbot Actions Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

