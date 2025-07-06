import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './mongodb';
import User from '@/models/User';

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
          
          // Check if user exists using cached lookup
          let existingUser = await getCachedUser(user.email!);
          
          if (!existingUser) {
            // Check if this is the first user (make them admin)
            const userCount = await User.countDocuments();
            const isFirstUser = userCount === 0;
            
            console.log('📝 Creating new user:', { email: user.email, isFirstUser });
            
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
            console.log('✅ New user created successfully');
          } else {
            console.log('👤 Existing user found, updating if needed');
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
              console.log('✅ User info updated');
            }
          }
          
          console.log('✅ SignIn callback completed successfully');
          return true;
        } catch (error) {
          console.error('❌ Error in signIn callback:', error);
          // Return true to allow sign-in even if database operation fails
          return true;
        }
      }
      console.log('✅ SignIn callback approved for non-Google provider');
      return true;
    },
    async jwt({ token, user, account }) {
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
          } else {
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
            }
          }
          
          // Add user data to token
          token.role = existingUser.role;
          token.userId = existingUser._id.toString();
        } catch (error) {
          console.error('Error in JWT callback:', error);
          // Set fallback values instead of throwing
          token.role = 'user';
          token.userId = user.id || '';
        }
      }
      
      // If token already has role, keep it
      if (!token.role || !token.userId) {
        try {
          await dbConnect();
          const dbUser = await getCachedUser(token.email as string);
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id.toString();
          } else {
            // Fallback if user not found in database
            token.role = 'user';
            token.userId = token.sub || '';
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
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
      // Handle localhost properly in development
      const actualBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
      
      console.log('🔄 Redirect callback:', { url, baseUrl: actualBaseUrl });
      
      // If signing in, always redirect to home page
      if (url.includes('/api/auth/signin') || url.includes('/login')) {
        console.log('✅ Redirecting to home after signin');
        return actualBaseUrl;
      }
      
      // If signing out, redirect to home page
      if (url.includes('/api/auth/signout')) {
        console.log('✅ Redirecting to home after signout');
        return actualBaseUrl;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log('✅ Relative URL redirect:', `${actualBaseUrl}${url}`);
        return `${actualBaseUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlOrigin = new URL(url).origin;
        const baseOrigin = new URL(actualBaseUrl).origin;
        if (urlOrigin === baseOrigin) {
          console.log('✅ Same origin redirect:', url);
          return url;
        }
      } catch (error) {
        console.error('Error parsing URLs in redirect:', error);
      }
      
      // Default to home page
      console.log('✅ Default redirect to home');
      return actualBaseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect auth errors to login page
  },
  events: {
    async signIn({ user, account, profile: _, isNewUser }) {
      try {
        console.log('SignIn event:', { user: user.email, account: account?.provider, isNewUser });
        
        // Clear any cached session data to force refresh
        if (typeof window !== 'undefined') {
          // This will be executed on client-side
          localStorage.removeItem('nextauth.session-token');
          sessionStorage.removeItem('nextauth.session-token');
        }
      } catch (error) {
        console.error('Error in signIn event:', error);
      }
    },
    async signOut({ session, token }) {
      try {
        console.log('SignOut event:', { user: session?.user?.email || token?.email });
        
        // Clear any cached session data
        if (typeof window !== 'undefined') {
          // This will be executed on client-side
          localStorage.removeItem('nextauth.session-token');
          sessionStorage.removeItem('nextauth.session-token');
        }
      } catch (error) {
        console.error('Error in signOut event:', error);
      }
    },
    async createUser({ user }) {
      try {
        console.log('User created:', user.email);
      } catch (error) {
        console.error('Error in createUser event:', error);
      }
    },
    async session({ session }) {
      try {
        console.log('Session event:', { user: session.user?.email });
      } catch (error) {
        console.error('Error in session event:', error);
      }
    },
  },
};
