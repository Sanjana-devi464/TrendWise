import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Article from '@/models/Article';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get user's comments with article information
    const comments = await Comment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get article information for each comment
    const articleIds = comments.map(comment => comment.articleId);
    const articles = await Article.find({ _id: { $in: articleIds } })
      .select('title slug')
      .lean();

    // Create a map for quick article lookup
    const articleMap = new Map();
    articles.forEach((article: any) => {
      articleMap.set(article._id.toString(), article);
    });

    // Combine comment and article data
    const commentsWithArticles = comments.map(comment => ({
      ...comment,
      article: articleMap.get(comment.articleId.toString())
    }));

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      comments: commentsWithArticles,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
