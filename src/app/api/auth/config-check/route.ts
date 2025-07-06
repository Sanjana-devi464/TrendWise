import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const issues = [];
  const config = {
    nodeEnv: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasMongoDbUri: !!process.env.MONGODB_URI,
    host: request.headers.get('host'),
    protocol: request.headers.get('x-forwarded-proto') || 'http',
    url: request.url,
  };

  // Check for common issues
  if (!config.hasNextAuthSecret) {
    issues.push('NEXTAUTH_SECRET is missing');
  }
  if (!config.hasGoogleClientId) {
    issues.push('GOOGLE_CLIENT_ID is missing');
  }
  if (!config.hasGoogleClientSecret) {
    issues.push('GOOGLE_CLIENT_SECRET is missing');
  }
  if (!config.hasMongoDbUri) {
    issues.push('MONGODB_URI is missing');
  }
  if (!config.nextAuthUrl) {
    issues.push('NEXTAUTH_URL is not set (optional but recommended)');
  }

  // Check if running in development
  if (config.nodeEnv === 'development') {
    const expectedUrl = `${config.protocol}://${config.host}`;
    if (config.nextAuthUrl && config.nextAuthUrl !== expectedUrl) {
      issues.push(`NEXTAUTH_URL mismatch: expected ${expectedUrl}, got ${config.nextAuthUrl}`);
    }
  }

  return NextResponse.json({
    status: issues.length === 0 ? 'OK' : 'Issues found',
    config,
    issues,
    recommendations: [
      'Ensure all environment variables are set',
      'For development, NEXTAUTH_URL should match your local server URL',
      'NEXTAUTH_SECRET should be a random string (use: openssl rand -base64 32)',
      'Google OAuth credentials should be configured for your domain'
    ]
  });
}
