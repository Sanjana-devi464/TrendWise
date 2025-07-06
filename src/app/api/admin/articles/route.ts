import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import { authOptions } from '@/lib/auth';

// Get all articles for admin management
export async function GET(request: NextRequest) {
  try {
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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published'); // 'true', 'false', or null for all
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (published !== null) {
      filter.isPublished = published === 'true';
    }

    const articles = await Article.find(filter)
      .select('title slug excerpt category author readingTime isPublished createdAt updatedAt views trending.trendScore')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(filter);
    const publishedCount = await Article.countDocuments({ isPublished: true });
    const draftCount = await Article.countDocuments({ isPublished: false });

    // Get categories for filter
    const categories = await Article.distinct('category');

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        published: publishedCount,
        drafts: draftCount,
        total: publishedCount + draftCount
      },
      categories
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
