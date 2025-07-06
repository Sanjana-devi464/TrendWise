import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Article from '@/models/Article';
import { validateSEOFields } from '@/lib/utils';
import { handleApiError, validateRequest } from '@/lib/api-utils';
import { cache, cacheHelpers } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Input validation
    const validation = validateRequest(searchParams, {
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 50, default: 10 },
      category: { type: 'string', optional: true },
      search: { type: 'string', optional: true, maxLength: 100 },
      forceRefresh: { type: 'boolean', optional: true, default: false }
    });
    
    if (!validation.valid) {
      return handleApiError('Invalid request parameters', 400, validation.errors);
    }
    
    const { page, limit, category, search, forceRefresh } = validation.data;
    const skip = (page - 1) * limit;

    // Create cache key for this specific query
    const cacheKey = cacheHelpers.generateKey('articles-api', { page, limit, category, search });
    
    // Try to get from cache first
    const cachedResult = await cacheHelpers.cachedFetch(
      cache.articles,
      cacheKey,
      async () => {
        // Build query
        const query: Record<string, unknown> = { isPublished: true };
        
        if (category && category !== 'all') {
          query.category = category;
        }
        
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ];
        }
        
        // Use optimized database query with parallel execution
        const [articles, totalCount] = await Promise.all([
          Article.find(query)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title slug excerpt featuredImage category tags publishedAt readingTime viewCount')
            .lean() // Use lean for better performance
            .exec(),
          Article.countDocuments(query)
        ]);

        return {
          articles,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        };
      },
      { forceRefresh }
    );

    const response = NextResponse.json({
      success: true,
      ...cachedResult
    });

    // Set cache headers based on whether this is a forced refresh
    if (forceRefresh) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    }
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;
  } catch (error) {
    return handleApiError('Failed to fetch articles', 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse and validate request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return handleApiError('Title and content are required', 400);
    }
    
    // Ensure all fields respect character limits using utility functions
    const seoFields = validateSEOFields({
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      excerpt: body.excerpt
    });
    
    const sanitizedBody = {
      ...body,
      ...seoFields,
      publishedAt: body.publishedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const article = new Article(sanitizedBody);
    await article.save();
    
    // Invalidate the articles cache so the new article appears immediately
    console.log('Invalidating articles cache after article creation...');
    cacheHelpers.clearCache('articles');
    
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ValidationError') {
      return handleApiError('Validation failed', 400, error.message);
    }
    
    return handleApiError('Failed to create article', 500, error);
  }
}
