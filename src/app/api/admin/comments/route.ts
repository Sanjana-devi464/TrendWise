import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth';

// Get all comments (pending and approved) for admin
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin comments endpoint called');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session user:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session?.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin OR is the designated admin email
    // Check if user is admin OR is the designated admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    const hasAdminRole = session.user.role === 'admin';
    const isDesignatedAdmin = session.user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    const isAdmin = hasAdminRole || isDesignatedAdmin;
    
    console.log('🔐 Access check:', { 
      userEmail: session.user.email,
      adminEmail: ADMIN_EMAIL, 
      hasAdminRole, 
      isDesignatedAdmin, 
      isAdmin 
    });
    if (!isAdmin) {
      console.log('❌ Admin access denied');
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access granted, connecting to database');
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', or 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let filter = {};
    if (status === 'pending') {
      filter = { isApproved: false };
    } else if (status === 'approved') {
      filter = { isApproved: true };
    }
    // 'all' or no status means no filter

    const comments = await Comment.find(filter)
      .populate('articleId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(filter);
    const pendingCount = await Comment.countDocuments({ isApproved: false });
    const approvedCount = await Comment.countDocuments({ isApproved: true });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        total: pendingCount + approvedCount
      }
    });
  } catch (error) {
    console.error('💥 Error in admin comments endpoint:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
