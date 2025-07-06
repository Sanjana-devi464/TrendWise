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
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
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
