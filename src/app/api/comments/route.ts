import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Article from '@/models/Article';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const articleSlug = searchParams.get('articleSlug');
    const userId = searchParams.get('userId');
    
    // If userId is provided, get user's comment history (requires authentication)
    if (userId) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Users can only view their own comment history
      if (session.user.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const userComments = await Comment.find({ userId })
        .populate('articleId', 'title slug')
        .sort({ createdAt: -1 })
        .limit(50);

      return NextResponse.json(userComments);
    }
    
    // Otherwise, get comments for a specific article (public)
    if (!articleSlug) {
      return NextResponse.json(
        { error: 'Article slug is required' },
        { status: 400 }
      );
    }
    
    // Find article by slug
    const article = await Article.findOne({ slug: articleSlug });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    const comments = await Comment.find({ 
      articleId: article._id, 
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate user ID exists
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    const body = await request.json();
    const { articleSlug, content } = body;
    
    if (!articleSlug || !content) {
      return NextResponse.json(
        { error: 'Article slug and content are required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment content too long (max 1000 characters)' },
        { status: 400 }
      );
    }
    
    // Find article by slug
    const article = await Article.findOne({ slug: articleSlug });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    const comment = new Comment({
      articleId: article._id,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userImage: session.user.image,
      content: content.trim(),
      isApproved: false // Comments need approval by default
    });
    
    await comment.save();
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
