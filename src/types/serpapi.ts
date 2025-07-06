// SerpAPI Google Trends Types
export interface SerpAPITrendingSearch {
  query: string;
  start_timestamp?: number;
  end_timestamp?: number;
  active?: boolean;
  search_volume?: number;
  increase_percentage?: number;
  categories?: Array<{
    id: number;
    name: string;
  }>;
  trend_breakdown?: string[];
  exploreLink?: string;
  formattedTraffic?: string;
  relatedQueries?: Array<{
    query: string;
    exploreLink: string;
  }>;
  articles?: Array<{
    title: string;
    timeAgo: string;
    source: string;
    image: {
      imageUrl: string;
      source: string;
      newsUrl: string;
    };
  }>;
}

export interface SerpAPITrendingNowResponse {
  trending_searches: SerpAPITrendingSearch[];
  daily_search_trends?: SerpAPITrendingSearch[];
  realtime_search_trends?: SerpAPITrendingSearch[];
}

export interface SerpAPIRelatedQuery {
  query: string;
  value: number;
  link: string;
  serpapi_link: string;
}

export interface SerpAPITrendsResponse {
  related_queries?: {
    top?: SerpAPIRelatedQuery[];
    rising?: SerpAPIRelatedQuery[];
  };
  related_topics?: {
    top?: any[];
    rising?: any[];
  };
  interest_over_time?: {
    timeline_data: Array<{
      date: string;
      timestamp: string;
      values: Array<{
        query: string;
        value: number;
        extracted_value: number;
      }>;
    }>;
  };
}

export interface SerpAPIError {
  error: string;
  message?: string;
}
