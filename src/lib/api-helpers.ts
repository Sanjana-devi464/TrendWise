import { NextRequest, NextResponse } from 'next/server';

// Common error handler for all API routes
export function handleApiError(
  error: unknown,
  message: string = 'An error occurred',
  statusCode: number = 500
): NextResponse {
  console.error(`API Error: ${message}`, error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  return NextResponse.json(
    {
      error: message,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

// CORS handler for API routes
export function handleCors(request: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  return null;
}

// Add CORS headers to response
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
