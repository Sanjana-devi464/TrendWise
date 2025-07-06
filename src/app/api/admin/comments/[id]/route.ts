import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth';

// Approve or reject a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin OR is the designated admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    const hasAdminRole = session?.user?.role === 'admin';
    const isDesignatedAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    const isAdmin = hasAdminRole || isDesignatedAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      comment.isApproved = true;
      await comment.save();
      
      return NextResponse.json({
        success: true,
        message: 'Comment approved successfully',
        comment
      });
    } else {
      // For reject, we delete the comment
      await Comment.findByIdAndDelete(id);
      
      return NextResponse.json({
        success: true,
        message: 'Comment rejected and deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const comment = await Comment.findByIdAndDelete(id);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
