import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Log authentication attempts for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Middleware - Path:', req.nextUrl.pathname);
      console.log('🔐 Middleware - Has token:', !!req.nextauth.token);
    }
    
    const response = NextResponse.next();
    
    // Add CORS headers for better session handling
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Add performance headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Enable compression for all responses
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Accept-Encoding', 'gzip, deflate, br');
    }
    
    // Cache static assets aggressively
    if (req.nextUrl.pathname.startsWith('/_next/static/') || 
        req.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          // STRICT ADMIN ACCESS CONTROL
          // Only allow the exact admin email specified in environment variable
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
          
          if (!token?.email) {
            console.log('❌ No email in token');
            return false;
          }
          
          // Normalize emails for comparison (case-insensitive and trim whitespace)
          const userEmail = token.email.toLowerCase().trim();
          const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
          
          console.log('🔍 Middleware admin check:', {
            userEmail,
            adminEmail,
            exactMatch: userEmail === adminEmail,
            userRole: token?.role
          });
          
          // ONLY allow access if:
          // 1. Email matches exactly the designated admin email, OR
          // 2. User has admin role AND email is verified
          const isExactAdminEmail = userEmail === adminEmail;
          const hasAdminRole = token?.role === 'admin';
          
          if (isExactAdminEmail) {
            console.log('✅ Admin access granted - exact email match');
            return true;
          }
          
          if (hasAdminRole && userEmail === adminEmail) {
            console.log('✅ Admin access granted - admin role and email match');
            return true;
          }
          
          console.log('❌ Admin access denied - email mismatch or insufficient privileges');
          return false;
        }
        
        // For profile and user-specific routes, check authentication
        if (req.nextUrl.pathname.startsWith('/profile')) {
          return !!token;
        }
        
        // For other protected routes, just check if user is authenticated
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*'
  ]
};
