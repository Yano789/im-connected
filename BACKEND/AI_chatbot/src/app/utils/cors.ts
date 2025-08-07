/**
 * Centralized CORS configuration for AI Chatbot service
 * Handles cross-origin requests from the main IM-CONNECTED application
 */

const ALLOWED_ORIGINS = new Set([
  "http://localhost",
  "http://localhost:5173", // Vite dev server
  "http://localhost:5001", // Forum backend
  "http://localhost:80",   // Docker frontend
  "http://localhost:8080", // Nginx proxy
  "https://im-connected-production.up.railway.app", // Main app
  "https://scanner-service.up.railway.app",        // Scanner service
  "https://ai-chatbot-production-c94d.up.railway.app", // AI chatbot service
]);

export function makeCorsHeaders(origin: string | null, methods: string = "GET, POST, PUT, DELETE, OPTIONS") {
  // In production environment, be more permissive for Railway deployments
  if (process.env.NODE_ENV === 'production') {
    // Allow Railway domains and cross-service communication
    if (!origin || origin.includes('railway.app') || origin.includes('localhost')) {
      return {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": methods,
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      };
    }
  }
  
  // Development environment with strict origin checking
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function createOptionsHandler() {
  return async function OPTIONS(request: Request) {
    return new Response(null, {
      status: 204,
      headers: makeCorsHeaders(request.headers.get("origin")),
    });
  };
}

export function createErrorResponse(error: string, status: number = 500, origin: string | null = null) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...makeCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}
