import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './mongodb';
import User from '@/models/User';

// Validate environment variables on startup
console.log('🔧 Auth environment validation:', {
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  hasMongodbUri: !!process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
});

// Cache user lookups to reduce database calls
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUser = async (email: string) => {
  const cacheKey = `user:${email}`;
  const cached = userCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  
  const user = await User.findOne({ email });
  if (user) {
    userCache.set(cacheKey, { user, timestamp: Date.now() });
  }
  
  return user;
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔄 SignIn callback triggered:', { 
        user: user.email, 
        provider: account?.provider,
        accountId: account?.providerAccountId 
      });
      
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          console.log('✅ SignIn callback completed successfully');
          return true;
        } catch (error) {
          console.error('❌ Error in signIn callback:', error);
          // Return true to allow sign-in even if database connection fails
          return true;
        }
      }
      console.log('✅ SignIn callback approved for non-Google provider');
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🔄 JWT callback triggered:', { 
        tokenEmail: token.email, 
        userEmail: user?.email, 
        provider: account?.provider 
      });
      
      // When user signs in for the first time
      if (account && user) {
        try {
          await dbConnect();
          
          // Check if user exists in our database using cached lookup
          let existingUser = await getCachedUser(user.email!);
          
          if (!existingUser) {
            // Check if this is the first user (make them admin)
            const userCount = await User.countDocuments();
            const isFirstUser = userCount === 0;
            
            console.log('📝 Creating new user in JWT:', { email: user.email, isFirstUser });
            
            // Create new user
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: isFirstUser ? 'admin' : 'user',
              emailVerified: new Date()
            });
            
            // Update cache
            userCache.delete(`user:${user.email}`);
            console.log('✅ New user created successfully in JWT');
          } else {
            console.log('👤 Existing user found in JWT, updating if needed');
            // Update existing user info if needed
            let needsUpdate = false;
            if (user.name && existingUser.name !== user.name) {
              existingUser.name = user.name;
              needsUpdate = true;
            }
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              await existingUser.save();
              // Invalidate cache
              userCache.delete(`user:${user.email}`);
              console.log('✅ User info updated in JWT');
            }
          }
          
          // Add user data to token
          token.role = existingUser.role;
          token.userId = existingUser._id.toString();
          console.log('✅ JWT token updated with user data');
        } catch (error) {
          console.error('❌ Error in JWT callback:', error);
          // Set fallback values instead of throwing
          token.role = 'user';
          token.userId = user.id || token.sub || '';
        }
      }
      
      // For subsequent requests, try to refresh user data if missing
      if (!token.role || !token.userId) {
        try {
          await dbConnect();
          const dbUser = await getCachedUser(token.email as string);
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id.toString();
            console.log('✅ JWT token refreshed with user data');
          } else {
            // Fallback if user not found in database
            token.role = 'user';
            token.userId = token.sub || '';
            console.log('⚠️ Using fallback user data in JWT');
          }
        } catch (error) {
          console.error('❌ Error fetching user role in JWT:', error);
          // Set fallback values
          token.role = 'user';
          token.userId = token.sub || '';
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string || token.sub!;
        session.user.role = token.role as string || 'user';
        // Ensure image is included in the session
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      
      // Force session serialization to ensure proper client-side sync
      return {
        ...session,
        expires: session.expires,
        user: {
          ...session.user,
          id: token.userId as string || token.sub!,
          role: token.role as string || 'user',
        }
      };
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });
      
      // If url is already a complete URL with the same origin, use it
      if (url.startsWith(baseUrl)) {
        console.log('✅ Same origin redirect:', url);
        return url;
      }
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('✅ Relative URL redirect:', redirectUrl);
        return redirectUrl;
      }
      
      // For any other case, redirect to home
      console.log('✅ Default redirect to home');
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect auth errors to login page
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🔄 SignIn event:', { user: user.email, provider: account?.provider, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('🔄 SignOut event:', { user: session?.user?.email || token?.email });
    },
  },
};
