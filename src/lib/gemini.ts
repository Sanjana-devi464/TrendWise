import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateSEOFields } from './utils';
import { checkImageServiceHealth, getImageServiceUrl } from './image-service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface TrendingTopic {
  title: string;
  keywords: string[];
  category: string;
  source: string;
  trendScore: number;
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  tags: string[];
  category: string;
  readingTime: number;
  featuredImage?: string;
  media: {
    images?: string[];
    videos?: string[];
    tweets?: string[];
  };
}

export async function generateArticleFromTrend(trend: TrendingTopic): Promise<GeneratedArticle> {
  // Use the correct Gemini model name - gemini-1.5-flash or gemini-1.5-pro
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Generate a comprehensive, SEO-optimized blog article about the trending topic: "${trend.title}"

Keywords to include: ${trend.keywords.join(', ')}
Category: ${trend.category}
Trend Score: ${trend.trendScore}/100

Requirements:
1. Create an engaging, informative article of 1500-2000 words
2. Use proper HTML structure with H1, H2, H3 headings
3. Include relevant keywords naturally throughout the content
4. Write in a conversational, engaging tone
5. Include actionable insights and current information
6. Make it SEO-friendly with proper keyword density
7. Include a compelling introduction and conclusion

Please format your response as a JSON object with the following structure:
{
  "title": "Main article title (EXACTLY 60 characters or less)",
  "content": "Full HTML content with proper headings and paragraphs",
  "excerpt": "Brief summary (EXACTLY 160 characters or less)",
  "metaTitle": "SEO title (EXACTLY 60 characters or less)",
  "metaDescription": "SEO description (EXACTLY 160 characters or less)",
  "ogTitle": "Open Graph title (EXACTLY 60 characters or less)",
  "ogDescription": "Open Graph description (EXACTLY 160 characters or less)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readingTime": estimated_reading_time_in_minutes
}

IMPORTANT: All text fields with character limits MUST be shorter than their specified limits. Do not exceed:
- Title, metaTitle, ogTitle: 60 characters maximum
- Excerpt, metaDescription, ogDescription: 160 characters maximum

Make sure all content is original, accurate, and provides real value to readers.
`;

  try {
    console.log('Generating article for trend:', trend.title);
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text.substring(0, 200) + '...');
    
    // Parse the JSON response
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Sometimes the response might have extra text before or after JSON
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No JSON found in response:', cleanedText);
      throw new Error('Invalid response format from AI');
    }
    
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    
    let articleData;
    try {
      articleData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Cleaned text:', cleanedText);
      throw new Error('Failed to parse AI response');
    }
    
    // Validate required fields
    if (!articleData.title || !articleData.content) {
      console.error('Missing required fields in response:', articleData);
      throw new Error('AI response missing required fields');
    }
    
    // Generate slug from title
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    console.log('Successfully generated article:', articleData.title);

    // Helper function to truncate text to specified length
    const truncateText = (text: string, maxLength: number): string => {
      if (!text || text.length <= maxLength) return text || '';
      return text.substring(0, maxLength - 3) + '...';
    };

    // Ensure all fields respect character limits using utility functions
    const seoFields = validateSEOFields({
      metaTitle: articleData.metaTitle || articleData.title,
      metaDescription: articleData.metaDescription || articleData.excerpt || articleData.title,
      ogTitle: articleData.ogTitle || articleData.title,
      ogDescription: articleData.ogDescription || articleData.excerpt || articleData.title,
      excerpt: articleData.excerpt || articleData.title
    });

    return {
      title: articleData.title,
      content: articleData.content,
      excerpt: seoFields.excerpt,
      metaTitle: seoFields.metaTitle,
      metaDescription: seoFields.metaDescription,
      ogTitle: seoFields.ogTitle,
      ogDescription: seoFields.ogDescription,
      tags: articleData.tags || [trend.title],
      readingTime: articleData.readingTime || 5,
      slug: slug,
      category: trend.category,
      media: {
        images: [],
        videos: [],
        tweets: []
      }
    };
  } catch (error) {
    console.error('Error generating article:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to generate article content');
  }
}

export async function generateImagePrompts(article: GeneratedArticle): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
Based on the following article, generate 5-6 descriptive image prompts that would be perfect for:
1. A featured hero image
2. 4-5 related content images to be placed throughout the article

Article Title: "${article.title}"
Article Category: "${article.category}"
Article Tags: ${article.tags.join(', ')}
Article Excerpt: "${article.excerpt}"

Requirements for image prompts:
- Be specific and descriptive
- Focus on visual elements that relate to the content
- Avoid text or logos in descriptions
- Make them suitable for stock photography or AI image generation
- Keep each prompt under 100 characters
- Focus on professional, clean, modern aesthetics
- Create variety in the types of images (closeups, wide shots, abstract, concrete)
- Make them complement the article content flow

Format your response as a JSON array of strings:
["prompt1", "prompt2", "prompt3", "prompt4", "prompt5", "prompt6"]

Example good prompts:
- "Modern office workspace with laptop and coffee, bright natural lighting"
- "Abstract digital technology background with blue tones and geometric shapes"
- "Professional business meeting in glass conference room"
- "Close-up of hands typing on keyboard with code on screen"
- "Minimalist desk setup with notebook and smartphone"
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the JSON response
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonStart = cleanedText.indexOf('[');
    const jsonEnd = cleanedText.lastIndexOf(']');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON array found in response');
    }
    
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    const prompts = JSON.parse(cleanedText);
    
    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid prompts format');
    }
    
    return prompts.filter(prompt => typeof prompt === 'string' && prompt.length > 0);
  } catch (error) {
    console.error('Error generating image prompts:', error);
    // Fallback prompts based on category and tags
    return [
      `${article.category} concept with modern design and professional aesthetic`,
      `${article.tags[0] || 'trending'} related imagery with clean background`,
      `Abstract ${article.category} visualization with contemporary style`,
      `Professional workspace related to ${article.category}`,
      `Technology and ${article.category} concept illustration`,
      `Modern ${article.tags[1] || 'business'} environment with clean design`
    ];
  }
}

export async function generateAIImages(prompts: string[]): Promise<string[]> {
  // Check image service health first
  await checkImageServiceHealth();
  
  const images: string[] = [];
  
  for (const prompt of prompts) {
    try {
      // Use the smart image service URL generator
      const imageUrl = getImageServiceUrl(prompt, { width: 800, height: 400 });
      images.push(imageUrl);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error generating image URL, using placeholder:', error);
      
      // Final fallback to internal placeholder
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 30);
      const fallbackUrl = `/api/placeholder/800x400?text=${encodeURIComponent(cleanPrompt)}`;
      images.push(fallbackUrl);
    }
  }
  
  return images;
}

export async function enhanceArticleWithMedia(article: GeneratedArticle, keywords: string[]): Promise<GeneratedArticle> {
  try {
    console.log('Generating AI-powered images for article:', article.title);
    
    // Step 1: Generate descriptive image prompts using AI
    const imagePrompts = await generateImagePrompts(article);
    console.log('Generated image prompts:', imagePrompts);
    
    // Step 2: Generate actual images using AI services
    const generatedImages = await generateAIImages(imagePrompts);
    console.log('Generated images:', generatedImages);
    
    // Step 3: Select featured image and media images
    const [featuredImage, ...mediaImages] = generatedImages;
    
    return {
      ...article,
      featuredImage: featuredImage || `/api/placeholder/800x400?category=${article.category.toLowerCase()}&text=${encodeURIComponent(article.title.substring(0, 30))}`,
      media: {
        images: mediaImages.length > 0 ? mediaImages : [
          `/api/placeholder/600x300?category=${article.category.toLowerCase()}&text=${encodeURIComponent(keywords[0] || article.category)}`,
          `/api/placeholder/600x300?category=${article.category.toLowerCase()}&text=${encodeURIComponent(keywords[1] || 'Related Content')}`,
          `/api/placeholder/600x300?category=${article.category.toLowerCase()}&text=${encodeURIComponent(article.tags[0] || 'Topic Image')}`,
          `/api/placeholder/600x300?category=${article.category.toLowerCase()}&text=${encodeURIComponent(article.tags[1] || 'Article Image')}`
        ],
        videos: [],
        tweets: []
      }
    };
  } catch (error) {
    console.error('Error enhancing article with media:', error);
    
    // Enhanced fallback with better keyword extraction
    const categorySlug = article.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const keywordSlug = (keywords[0] || 'trending').toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return {
      ...article,
      featuredImage: `https://source.unsplash.com/800x400/?${categorySlug},professional,modern`,
      media: {
        images: [
          `https://source.unsplash.com/600x300/?${keywordSlug},business`,
          `https://source.unsplash.com/600x300/?${categorySlug},technology`,
          `https://source.unsplash.com/600x300/?${article.tags[0] || 'professional'},modern`,
          `https://source.unsplash.com/600x300/?${article.tags[1] || 'workspace'},clean`
        ],
        videos: [],
        tweets: []
      }
    };
  }
}
