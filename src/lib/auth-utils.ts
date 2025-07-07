'use client';

import { signIn, signOut, getSession } from 'next-auth/react';

interface AuthUtilsType {
  login: (options?: { callbackUrl?: string }) => Promise<any>;
  logout: (options?: { callbackUrl?: string }) => Promise<any>;
  refreshSession: () => Promise<any>;
  getCurrentSession: () => Promise<any>;
}

export const authUtils: AuthUtilsType = {
  login: async (options = {}) => {
    const { callbackUrl = '/' } = options;
    
    try {
      console.log('🔄 Starting login process...');
      
      // Clear any existing session data before login
      if (typeof window !== 'undefined') {
        // Clear localStorage and sessionStorage
        localStorage.removeItem('nextauth.session-token');
        sessionStorage.removeItem('nextauth.session-token');
      }
      
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
      console.log('🔄 Login result:', result);
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  logout: async (options = {}) => {
    const { callbackUrl = '/' } = options;
    
    try {
      console.log('🔄 Starting logout process...');
      await signOut({ 
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      console.log('🔄 Refreshing session...');
      const session = await getSession();
      return session;
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    try {
      const session = await getSession();
      return session;
    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  }
};

export default authUtils;
