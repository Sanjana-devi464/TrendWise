import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Only allow users to access their own stats for now
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    
    // Get user info
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get comment count
    const totalComments = await Comment.countDocuments({ 
      userId: userId,
      isApproved: true 
    });

    // Get recent activity (last comment date)
    const lastComment = await Comment.findOne(
      { userId: userId },
      {},
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({
      totalComments,
      memberSince: user.createdAt,
      lastActivity: lastComment?.createdAt || user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
