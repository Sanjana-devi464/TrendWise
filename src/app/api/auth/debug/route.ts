import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
          image: session.user?.image
        },
        expires: session.expires
      } : null,
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'authorization': request.headers.get('authorization') ? '[PRESENT]' : '[MISSING]',
        'cookie': request.headers.get('cookie') ? '[PRESENT]' : '[MISSING]'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET
      }
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get auth debug info',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
