import { TrendingTopic } from './gemini';
import * as cheerio from 'cheerio';
import { getJson } from 'serpapi';
import type { SerpAPITrendingNowResponse, SerpAPITrendsResponse, SerpAPITrendingSearch, SerpAPIRelatedQuery } from '../types/serpapi';

export interface TrendData {
  keyword: string;
  volume: string;
  category: string;
  source: 'google' | 'twitter';
}

// Alternative trending topics sources
interface TrendSource {
  name: string;
  url: string;
  parser: (html: string) => TrendingTopic[];
}

// Enhanced trending topics sources with better reliability
const TRENDING_SOURCES: TrendSource[] = [
  {
    name: 'Reddit Hot',
    url: 'https://www.reddit.com/hot.json?limit=25',
    parser: parseRedditTrends
  },
  {
    name: 'Reddit r/Technology',
    url: 'https://www.reddit.com/r/technology/hot.json?limit=15',
    parser: parseRedditTechnology
  },
  {
    name: 'Reddit r/WorldNews',
    url: 'https://www.reddit.com/r/worldnews/hot.json?limit=10',
    parser: parseRedditWorldNews
  },
  {
    name: 'GitHub Trending',
    url: 'https://api.github.com/search/repositories?q=created:>2024-12-01&sort=stars&order=desc&per_page=10',
    parser: parseGitHubTrending
  }
];

// Enhanced user agents for better success rate
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parseRedditTrends(jsonData: string): TrendingTopic[] {
  try {
    const data = JSON.parse(jsonData);
    const trends: TrendingTopic[] = [];
    
    if (data?.data?.children) {
      data.data.children.slice(0, 8).forEach((post: any, index: number) => {
        if (post?.data?.title && post.data.ups > 100) {
          trends.push({
            title: post.data.title,
            keywords: extractKeywords(post.data.title),
            category: post.data.subreddit || 'General',
            source: 'google',
            trendScore: Math.max(90 - index * 5, 60)
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing Reddit trends:', error);
    return [];
  }
}

function parseRedditTechnology(jsonData: string): TrendingTopic[] {
  try {
    const data = JSON.parse(jsonData);
    const trends: TrendingTopic[] = [];
    
    if (data?.data?.children) {
      data.data.children.slice(0, 6).forEach((post: any, index: number) => {
        if (post?.data?.title && post.data.ups > 50) {
          trends.push({
            title: post.data.title,
            keywords: extractKeywords(post.data.title),
            category: 'Technology',
            source: 'google',
            trendScore: Math.max(85 - index * 4, 55)
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing Reddit Technology trends:', error);
    return [];
  }
}

function parseRedditWorldNews(jsonData: string): TrendingTopic[] {
  try {
    const data = JSON.parse(jsonData);
    const trends: TrendingTopic[] = [];
    
    if (data?.data?.children) {
      data.data.children.slice(0, 5).forEach((post: any, index: number) => {
        if (post?.data?.title && post.data.ups > 200) {
          trends.push({
            title: post.data.title,
            keywords: extractKeywords(post.data.title),
            category: 'World News',
            source: 'google',
            trendScore: Math.max(88 - index * 4, 65)
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing Reddit World News trends:', error);
    return [];
  }
}

function parseGitHubTrending(jsonData: string): TrendingTopic[] {
  try {
    const data = JSON.parse(jsonData);
    const trends: TrendingTopic[] = [];
    
    if (data?.items) {
      data.items.slice(0, 5).forEach((repo: any, index: number) => {
        if (repo?.name && repo?.description) {
          const title = `${repo.name}: ${repo.description}`;
          trends.push({
            title: title.length > 100 ? title.substring(0, 97) + '...' : title,
            keywords: extractKeywords(`${repo.name} ${repo.description}`),
            category: 'Technology',
            source: 'google',
            trendScore: Math.max(80 - index * 3, 60)
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing GitHub trending:', error);
    return [];
  }
}


function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'may', 'say', 'she', 'use', 'way', 'will', 'with'].includes(word))
    .slice(0, 5);
}

export async function fetchGoogleTrends(): Promise<TrendingTopic[]> {
  try {
    console.log('Attempting to fetch trending topics...');
    
    // Try Google Trends RSS first
    const googleTrends = await fetchGoogleTrendsRSS();
    if (googleTrends.length > 0) {
      return googleTrends;
    }
    
    // Try alternative sources
    const alternativeTrends = await fetchAlternativeTrends();
    if (alternativeTrends.length > 0) {
      return alternativeTrends;
    }
    
    throw new Error('All trending sources failed');
    
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    console.log('Using fallback trends');
    return getEnhancedFallbackTrends();
  }
}

async function fetchGoogleTrendsRSS(): Promise<TrendingTopic[]> {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  SerpAPI key not found. Using alternative sources and enhanced fallback.');
    return [];
  }

  try {
    console.log('Fetching Google Trends via SerpAPI...');
    
    // First, try to get trending searches
    const trendingResponse = await getJson({
      engine: "google_trends_trending_now",
      geo: "US",
      api_key: apiKey
    }) as SerpAPITrendingNowResponse;
    
    const trends: TrendingTopic[] = [];
    
    if (trendingResponse?.trending_searches?.length > 0) {
      trendingResponse.trending_searches.slice(0, 10).forEach((trend: SerpAPITrendingSearch, index: number) => {
        if (trend?.query) {
          // The query is directly on the trend object, not nested under trend.query.query
          trends.push({
            title: trend.query,
            keywords: extractKeywords(trend.query),
            category: trend.categories?.[0]?.name || 'Trending',
            source: 'google',
            trendScore: Math.max(95 - index * 3, 70)
          });
        }
      });
    }
    
    // If trending_searches is not available, try daily search trends
    if (trends.length === 0 && trendingResponse?.daily_search_trends && trendingResponse.daily_search_trends.length > 0) {
      trendingResponse.daily_search_trends.slice(0, 10).forEach((trend: SerpAPITrendingSearch, index: number) => {
        if (trend?.query) {
          trends.push({
            title: trend.query,
            keywords: extractKeywords(trend.query),
            category: trend.categories?.[0]?.name || 'Daily Trends',
            source: 'google',
            trendScore: Math.max(90 - index * 3, 65)
          });
        }
      });
    }
    
    // Try realtime search trends if others fail
    if (trends.length === 0 && trendingResponse?.realtime_search_trends && trendingResponse.realtime_search_trends.length > 0) {
      trendingResponse.realtime_search_trends.slice(0, 10).forEach((trend: SerpAPITrendingSearch, index: number) => {
        if (trend?.query) {
          trends.push({
            title: trend.query,
            keywords: extractKeywords(trend.query),
            category: trend.categories?.[0]?.name || 'Realtime Trends',
            source: 'google',
            trendScore: Math.max(88 - index * 3, 60)
          });
        }
      });
    }
    
    // If we still don't have enough trends, try fetching some popular search terms
    if (trends.length < 5) {
      try {
        const popularTopics = ['technology', 'artificial intelligence', 'climate change', 'health', 'entertainment', 'business', 'science'];
        const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
        
        const exploreResponse = await getJson({
          engine: "google_trends",
          q: randomTopic,
          geo: "US",
          api_key: apiKey
        }) as SerpAPITrendsResponse;
        
        if (exploreResponse?.related_queries?.rising && exploreResponse.related_queries.rising.length > 0) {
          exploreResponse.related_queries.rising.slice(0, 5).forEach((query: SerpAPIRelatedQuery, index: number) => {
            if (query?.query && !trends.some(t => t.title.toLowerCase().includes(query.query.toLowerCase()))) {
              trends.push({
                title: query.query,
                keywords: extractKeywords(query.query),
                category: 'Rising Searches',
                source: 'google',
                trendScore: Math.max(85 - index * 2, 55)
              });
            }
          });
        }
        
        // Also try top related queries if rising is not available
        if (exploreResponse?.related_queries?.top && exploreResponse.related_queries.top.length > 0 && trends.length < 8) {
          exploreResponse.related_queries.top.slice(0, 3).forEach((query: SerpAPIRelatedQuery, index: number) => {
            if (query?.query && !trends.some(t => t.title.toLowerCase().includes(query.query.toLowerCase()))) {
              trends.push({
                title: query.query,
                keywords: extractKeywords(query.query),
                category: 'Related Searches',
                source: 'google',
                trendScore: Math.max(80 - index * 2, 50)
              });
            }
          });
        }
      } catch (exploreError) {
        console.log('Could not fetch related searches:', exploreError instanceof Error ? exploreError.message : 'Unknown error');
      }
    }
    
    if (trends.length > 0) {
      console.log(`✓ Successfully fetched ${trends.length} Google Trends via SerpAPI`);
      return trends;
    }
    
    console.log('No trends found in SerpAPI response, falling back to alternative sources');
    return [];
    
  } catch (error) {
    console.error('Error fetching Google Trends via SerpAPI:', error instanceof Error ? error.message : 'Unknown error');
    
    // Check for specific SerpAPI errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 Invalid SerpAPI key. Please check your SERPAPI_KEY environment variable.');
      } else if (error.message.includes('credits')) {
        console.log('💳 SerpAPI credits exhausted. Consider upgrading your plan or wait for credit refresh.');
      } else if (error.message.includes('quota')) {
        console.log('📊 SerpAPI quota exceeded. Please wait or upgrade your plan.');
      }
    }
    
    console.log('Falling back to alternative sources');
    return [];
  }
}

async function fetchAlternativeTrends(): Promise<TrendingTopic[]> {
  console.log('Trying alternative trending sources...');
  
  for (const source of TRENDING_SOURCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.text();
        const trends = source.parser(data);
        
        if (trends.length > 0) {
          console.log(`Successfully fetched ${trends.length} trends from ${source.name}`);
          return trends;
        }
      }
    } catch (error) {
      console.log(`${source.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return [];
}

function parseGoogleTrendsRSS(xmlText: string): TrendingTopic[] {
  try {
    const $ = cheerio.load(xmlText, { xmlMode: true });
    const trends: TrendingTopic[] = [];
    
    // Try different RSS formats
    $('item').each((index, element) => {
      if (index >= 10) return false; // Limit to 10 items
      
      const $item = $(element);
      let title = $item.find('title').text().trim();
      
      // Remove CDATA wrapper if present
      title = title.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      
      if (title && !title.toLowerCase().includes('google') && !title.toLowerCase().includes('trends')) {
        trends.push({
          title,
          keywords: extractKeywords(title),
          category: 'Trending',
          source: 'google',
          trendScore: Math.max(95 - index * 5, 60)
        });
      }
    });
    
    // If no items found, try different XML structure
    if (trends.length === 0) {
      $('entry').each((index, element) => {
        if (index >= 10) return false;
        
        const $entry = $(element);
        const title = $entry.find('title').text().trim();
        
        if (title && !title.toLowerCase().includes('google')) {
          trends.push({
            title,
            keywords: extractKeywords(title),
            category: 'Trending',
            source: 'google',
            trendScore: Math.max(95 - index * 5, 60)
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing Google Trends RSS:', error);
    return [];
  }
}

function getEnhancedFallbackTrends(): TrendingTopic[] {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Technology trends based on current events and 2025 trends
  const techTrends = [
    'AI Agent Automation Tools 2025',
    'Quantum Computing Commercial Applications',
    'Advanced Autonomous Vehicle Deployment',
    'Next-Generation Battery Technology',
    'Smart City Infrastructure Integration',
    'Decentralized Social Media Platforms',
    'Extended Reality (XR) Workplace Solutions',
    'AI-Powered Cybersecurity Systems',
    'Sustainable Tech Manufacturing',
    'Edge Computing Expansion'
  ];
  
  // Time-based contextual trends
  const contextualTrends = [];
  
  if (currentHour < 8) {
    contextualTrends.push(
      'Morning Productivity AI Tools',
      'Global Market Analysis Platforms',
      'Remote Work Collaboration Software'
    );
  } else if (currentHour < 17) {
    contextualTrends.push(
      'Business Process Automation',
      'Industry Digital Transformation',
      'Professional AI Development Tools'
    );
  } else {
    contextualTrends.push(
      'Streaming Technology Innovations',
      'Gaming AI Integration',
      'Social Media Algorithm Updates'
    );
  }
  
  // Seasonal trends for 2025
  const seasonalTrends = [];
  if (currentMonth >= 11 || currentMonth <= 1) {
    seasonalTrends.push(
      'Holiday Tech Gift Trends 2025',
      'Year-End Software Security Updates',
      'New Year Digital Wellness Tools'
    );
  } else if (currentMonth >= 2 && currentMonth <= 4) {
    seasonalTrends.push(
      'Spring Startup Innovations',
      'Tech Conference Announcements',
      'Beta Product Launches'
    );
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    seasonalTrends.push(
      'Summer Tech Education Programs',
      'Mobile App Development Trends',
      'Outdoor Smart Technology'
    );
  } else {
    seasonalTrends.push(
      'Back-to-School EdTech Solutions',
      'Educational AI Platforms',
      'Student Technology Accessibility'
    );
  }
  
  // Current events and trending topics for 2025
  const currentEventsTrends = [
    'Climate Technology Solutions',
    'Mental Health App Innovations',
    'Renewable Energy Smart Grids',
    'Space Technology Commercialization',
    'Personalized Medicine AI',
    'Sustainable Fashion Technology'
  ];
  
  // Combine all trends with better distribution
  const allTopics = [
    ...contextualTrends,
    ...seasonalTrends,
    ...currentEventsTrends.slice(0, 3),
    ...techTrends.slice(0, 5)
  ];
  
  return allTopics.slice(0, 15).map((topic, index) => ({
    title: topic,
    keywords: extractKeywords(topic),
    category: index < 3 ? 'Breaking' : index < 6 ? 'Technology' : index < 9 ? 'Innovation' : 'Trending',
    source: 'google',
    trendScore: Math.max(85 - index * 2, 45)
  }));
}

function getGoogleFallbackTrends(): TrendingTopic[] {
  return getEnhancedFallbackTrends();
}

export async function fetchTwitterTrends(): Promise<TrendingTopic[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken || bearerToken === 'AAAAAAAAAAAAAAAAAAAAAH1Z2wEAAAAAzYs5N5QRwFrnwpOC%2B4skOJw6oW8%3DvuIjFc6FAUSwOV4ThYGdwvWaB8Cpz0d7ROMJM26ZoWakuoqv2i') {
    console.log('Twitter Bearer Token not provided or using placeholder, using fallback trends');
    return getEnhancedTwitterFallbackTrends();
  }
  
  try {
    console.log('Attempting to fetch Twitter trends...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    // Try Twitter API v1.1 trends endpoint (most reliable)
    const endpoints = [
      'https://api.twitter.com/1.1/trends/place.json?id=1', // Worldwide
      'https://api.twitter.com/1.1/trends/place.json?id=23424977', // United States
      'https://api.twitter.com/1.1/trends/place.json?id=23424975' // United Kingdom
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'TrendWise/1.0',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        if (response.ok) {
          const data = await response.json();
          const trends = parseTwitterTrendsData(data);
          
          if (trends.length > 0) {
            clearTimeout(timeoutId);
            console.log(`Successfully fetched ${trends.length} Twitter trends`);
            return trends;
          }
        } else {
          const errorText = await response.text();
          console.log(`Twitter API endpoint ${endpoint} failed: ${response.status} ${response.statusText}`, errorText);
        }
      } catch (endpointError) {
        console.log(`Twitter endpoint ${endpoint} error:`, endpointError instanceof Error ? endpointError.message : 'Unknown error');
      }
    }
    
    clearTimeout(timeoutId);
    console.log('All Twitter API endpoints failed, using fallback trends');
    return getEnhancedTwitterFallbackTrends();
    
  } catch (error) {
    console.error('Error fetching Twitter trends:', error);
    console.log('Using fallback Twitter trends');
    return getEnhancedTwitterFallbackTrends();
  }
}

function parseTwitterTrendsData(data: any): TrendingTopic[] {
  const trends: TrendingTopic[] = [];
  
  try {
    if (data && Array.isArray(data) && data[0] && data[0].trends) {
      data[0].trends.slice(0, 10).forEach((trend: any, index: number) => {
        if (trend.name && !trend.name.startsWith('#') && trend.name.length > 3) {
          // Filter out non-meaningful trends
          const cleanName = trend.name.trim();
          if (!cleanName.match(/^\d+$/) && !cleanName.toLowerCase().includes('twitter')) {
            trends.push({
              title: cleanName,
              keywords: extractKeywords(cleanName),
              category: 'Social Media',
              source: 'twitter',
              trendScore: Math.max(90 - index * 4, 45)
            });
          }
        }
      });
    }
  } catch (parseError) {
    console.error('Error parsing Twitter trends data:', parseError);
  }
  
  return trends;
}

function getEnhancedTwitterFallbackTrends(): TrendingTopic[] {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentDay = currentDate.getDay();
  
  // Different trends based on time and day
  const socialMediaTrends = [
    'Content Creator Economy Growth',
    'Social Media Algorithm Updates',
    'Influencer Marketing Strategies',
    'Live Streaming Technology',
    'Digital Community Building',
    'User Generated Content Trends',
    'Social Commerce Integration',
    'Brand Engagement Analytics',
    'Viral Content Patterns',
    'Social Media Privacy Updates'
  ];
  
  // Weekend vs weekday trends
  const contextualTrends = currentDay === 0 || currentDay === 6 
    ? ['Weekend Entertainment Trends', 'Leisure Technology Apps', 'Social Gaming Platforms']
    : ['Professional Networking', 'Business Communication Tools', 'Productivity Social Apps'];
  
  // Time-based trends
  const timeBasedTrends = currentHour < 12
    ? ['Morning Social Media Habits', 'Global News Discussions', 'Trending Breakfast Topics']
    : currentHour < 18
    ? ['Afternoon Social Engagement', 'Work-Life Balance Discussions', 'Industry Network Updates']
    : ['Evening Entertainment Buzz', 'Prime Time Social Trends', 'Late Night Community Talks'];
  
  const allTopics = [...contextualTrends, ...timeBasedTrends, ...socialMediaTrends.slice(0, 6)];
  
  return allTopics.slice(0, 10).map((topic, index) => ({
    title: `${topic} ${currentDate.getFullYear()}`,
    keywords: extractKeywords(topic),
    category: 'Social Media',
    source: 'twitter',
    trendScore: Math.max(80 - index * 3, 45)
  }));
}

function getTwitterFallbackTrends(): TrendingTopic[] {
  return getEnhancedTwitterFallbackTrends();
}
export function getFallbackTrends(): TrendingTopic[] {
  // Use the enhanced fallback trends with better categorization and current context
  return getEnhancedFallbackTrends();
}

export async function getAllTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    console.log('Fetching trending topics from all sources...');
    
    // Use Promise.allSettled to avoid one failure stopping the other
    const [googleResult, twitterResult] = await Promise.allSettled([
      fetchGoogleTrends(),
      fetchTwitterTrends()
    ]);
    
    const allTrends: TrendingTopic[] = [];
    let successCount = 0;
    
    if (googleResult.status === 'fulfilled' && googleResult.value.length > 0) {
      allTrends.push(...googleResult.value);
      console.log(`✓ Fetched ${googleResult.value.length} Google trends`);
      successCount++;
    } else {
      console.log('✗ Google Trends failed:', googleResult.status === 'rejected' ? googleResult.reason?.message : 'No trends returned');
    }
    
    if (twitterResult.status === 'fulfilled' && twitterResult.value.length > 0) {
      allTrends.push(...twitterResult.value);
      console.log(`✓ Fetched ${twitterResult.value.length} Twitter trends`);
      successCount++;
    } else {
      console.log('✗ Twitter Trends failed:', twitterResult.status === 'rejected' ? twitterResult.reason?.message : 'No trends returned');
    }
    
    // If we got some trends but not enough, supplement with fallback
    if (allTrends.length < 8) {
      const fallbackTrends = getFallbackTrends();
      const neededTrends = 12 - allTrends.length;
      allTrends.push(...fallbackTrends.slice(0, neededTrends));
      console.log(`Added ${Math.min(neededTrends, fallbackTrends.length)} fallback trends`);
    }
    
    // If no trends were fetched from any source, use all fallback
    if (allTrends.length === 0) {
      console.log('No trends fetched from external sources, using all fallback trends');
      allTrends.push(...getFallbackTrends());
    }
    
    // Enhanced deduplication and sorting
    const uniqueTrends = deduplicateTrends(allTrends)
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 15); // Top 15 unique trends
    
    console.log(`✓ Returning ${uniqueTrends.length} unique trending topics (${successCount}/2 sources successful)`);
    return uniqueTrends;
    
  } catch (error) {
    console.error('Error in getAllTrendingTopics:', error);
    console.log('Using fallback trends due to error');
    return getFallbackTrends();
  }
}

function deduplicateTrends(trends: TrendingTopic[]): TrendingTopic[] {
  const seen = new Set<string>();
  const unique: TrendingTopic[] = [];
  
  for (const trend of trends) {
    // Create a normalized version for comparison
    const normalized = trend.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Check for exact matches and similar titles
    let isDuplicate = false;
    
    for (const seenTitle of seen) {
      // Check for exact match
      if (seenTitle === normalized) {
        isDuplicate = true;
        break;
      }
      
      // Check for similarity (if titles are long enough and share significant content)
      if (normalized.length > 15 && seenTitle.length > 15) {
        const commonWords = normalized.split(' ').filter(word => 
          word.length > 3 && seenTitle.includes(word)
        );
        
        if (commonWords.length >= 2) {
          isDuplicate = true;
          break;
        }
      }
    }
    
    if (!isDuplicate) {
      seen.add(normalized);
      unique.push(trend);
    }
  }
  
  return unique;
}
