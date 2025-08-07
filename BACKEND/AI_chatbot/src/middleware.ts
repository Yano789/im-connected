import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://localhost:80',
  'http://localhost:8080',
  'https://im-connected-production.up.railway.app',
  'https://scanner-service.up.railway.app',
  'https://ai-chatbot-production-c94d.up.railway.app',
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': getOriginHeader(origin),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Continue with the request and add CORS headers to the response
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', getOriginHeader(origin));
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

function getOriginHeader(origin: string | null): string {
  // In production, be more permissive for Railway deployments
  if (process.env.NODE_ENV === 'production') {
    if (!origin || origin.includes('railway.app') || origin.includes('localhost')) {
      return origin || '*';
    }
  }
  
  // Development or unknown origins
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    return origin || '*';
  }
  
  return '*';
}

export const config = {
  matcher: '/api/:path*',
};
