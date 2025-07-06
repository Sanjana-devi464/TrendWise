import { NextRequest, NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/crawler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') as 'google' | 'twitter' | 'all' || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log(`Fetching trends - Source: ${source}, Limit: ${limit}`);
    
    const trends = await getAllTrendingTopics();
    
    let filteredTrends = trends;
    
    if (source !== 'all') {
      filteredTrends = trends.filter(trend => trend.source === source);
      console.log(`Filtered ${filteredTrends.length} trends for source: ${source}`);
    }
    
    // Limit results
    filteredTrends = filteredTrends.slice(0, limit);
    
    const response = {
      trends: filteredTrends,
      total: filteredTrends.length,
      source,
      timestamp: new Date().toISOString(),
      success: true
    };
    
    console.log(`Returning ${filteredTrends.length} trending topics`);
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error in trends API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending topics',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}
