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
]);

function makeCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  
  if (!openai) {
    const errorBody = JSON.stringify({ error: "OpenAI API key not configured" });
    return new Response(errorBody, {
      status: 500,
      headers: {
        ...makeCorsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  }

  const thread = await openai.beta.threads.create();
  const body = JSON.stringify({ threadId: thread.id });

  return new Response(body, {
    status: 200,
    headers: {
      ...makeCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

