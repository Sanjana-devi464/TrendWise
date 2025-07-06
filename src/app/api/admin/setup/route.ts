import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function POST(_request: NextRequest) {
  try {
    console.log('🔧 Admin setup started...');
    const session = await getServerSession(authOptions);
    
    console.log('📧 Session user email:', session?.user?.email);
    console.log('🔐 Session exists:', !!session);
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the user is the authorized admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    console.log('🎯 Admin email from env:', ADMIN_EMAIL);
    console.log('👤 User email:', session.user.email);
    
    // Normalize emails for strict comparison
    const userEmail = session.user.email.toLowerCase().trim();
    const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
    
    console.log('📧 Normalized comparison:', { userEmail, adminEmail });
    
    if (userEmail !== adminEmail) {
      console.log('❌ Email mismatch - access denied');
      return NextResponse.json(
        { error: 'Unauthorized: Only the designated admin can access this feature' },
        { status: 403 }
      );
    }
    
    console.log('✅ Admin email verified - access granted');
    
    await dbConnect();
    console.log('🗄️ Database connected');
    
    // First try to find existing user
    let existingUser = await User.findOne({ email: session.user.email });
    console.log('👤 Existing user found:', !!existingUser);
    
    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ Updated existing user to admin');
    } else {
      // Create new user as admin
      existingUser = await User.create({
        name: session.user.name || 'Admin',
        email: session.user.email,
        image: session.user.image || '',
        role: 'admin',
        emailVerified: new Date()
      });
      console.log('✅ Created new admin user');
    }
    
    console.log('🎉 Admin setup successful!');
    return NextResponse.json({
      success: true,
      message: 'Admin role assigned successfully',
      user: {
        email: existingUser.email,
        role: existingUser.role,
        name: existingUser.name
      }
    });
    
  } catch (error) {
    console.error('💥 Error setting up admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to setup admin', details: errorMessage },
      { status: 500 }
    );
  }
}
