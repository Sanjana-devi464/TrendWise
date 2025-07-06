import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import { authOptions } from '@/lib/auth';
import { generateArticleFromTrend, enhanceArticleWithMedia, TrendingTopic } from '@/lib/gemini';
import { cacheHelpers } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Log user info for debugging
    console.log('User generating article:', {
      email: session.user.email,
      role: session.user.role,
      name: session.user.name
    });
    
    // For now, allow all authenticated users to generate articles
    // You can later restrict this to admin users only by uncommenting the below:
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }
    
    await dbConnect();
    const body = await request.json();
    const { trend, autoPublish = true } = body;
    
    if (!trend || !trend.title) {
      return NextResponse.json(
        { error: 'Trend data is required' },
        { status: 400 }
      );
    }
    
    const trendingTopic: TrendingTopic = {
      title: trend.title,
      keywords: trend.keywords || [trend.title],
      category: trend.category || 'General',
      source: trend.source || 'manual',
      trendScore: trend.trendScore || 50
    };
    
    // Generate article content using Gemini AI
    console.log('Generating article for trend:', trendingTopic.title);
    const generatedArticle = await generateArticleFromTrend(trendingTopic);
    
    console.log('Article generated successfully, enhancing with media...');
    
    // Enhance with media (placeholder images for now)
    const enhancedArticle = await enhanceArticleWithMedia(generatedArticle, trendingTopic.keywords);
    
    // Check if article with same slug already exists
    const existingArticle = await Article.findOne({ slug: enhancedArticle.slug });
    
    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article with this title already exists' },
        { status: 409 }
      );
    }
    
    // Create article in database
    const article = new Article({
      ...enhancedArticle,
      isPublished: autoPublish,
      trending: {
        source: trendingTopic.source,
        keywords: trendingTopic.keywords,
        trendScore: trendingTopic.trendScore
      }
    });
    
    await article.save();
    
    // Invalidate the articles cache so the new article appears immediately
    console.log('Invalidating articles cache after article generation...');
    cacheHelpers.clearCache('articles');
    
    return NextResponse.json({
      success: true,
      article: {
        id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        isPublished: article.isPublished
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error generating article:', error);
    
    // More specific error messages
    let errorMessage = 'Failed to generate article';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('parse')) {
        errorMessage = 'AI response parsing error';
      } else if (error.message.includes('required fields')) {
        errorMessage = 'AI response incomplete';
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Article validation failed';
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  try {
    // Get generation status or recent generations
    await dbConnect();
    
    const recentArticles = await Article.find({ 
      'trending.source': { $in: ['google', 'twitter'] }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title slug publishedAt trending.source trending.trendScore');
    
    return NextResponse.json({
      recentGenerations: recentArticles,
      total: recentArticles.length
    });
    
  } catch (error) {
    console.error('Error fetching generation history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation history' },
      { status: 500 }
    );
  }
}
