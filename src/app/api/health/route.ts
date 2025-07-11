import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      HAS_MONGODB_URI: !!process.env.MONGODB_URI,
      HAS_GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      HAS_GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      HAS_NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    };

    // For Vercel, skip database connection test to avoid timeout
    let dbStatus = 'not-tested-on-vercel';
    
    if (!process.env.VERCEL) {
      // Only test database connection in development
      try {
        const { default: dbConnect } = await import('@/lib/mongodb');
        await dbConnect();
        dbStatus = 'connected';
      } catch (error) {
        console.error('Database connection error:', error);
        dbStatus = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
