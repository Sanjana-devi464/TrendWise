import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Check critical environment variables
    const envChecks = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      MONGODB_URI: !!process.env.MONGODB_URI,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      SERPAPI_API_KEY: !!process.env.SERPAPI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    const missingEnvVars = Object.entries(envChecks)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    const status = missingEnvVars.length === 0 ? 'ok' : 'warning';
    
    return NextResponse.json({
      status,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString(),
      checks: envChecks,
      missingEnvVars,
      message: missingEnvVars.length === 0 
        ? 'All environment variables are configured'
        : `Missing environment variables: ${missingEnvVars.join(', ')}`
    });
  } catch (error) {
    console.error('Environment check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to check environment variables',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
