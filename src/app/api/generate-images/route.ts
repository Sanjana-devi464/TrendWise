import { NextResponse } from 'next/server';
import { generateImagePrompts, generateAIImages } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { article } = await request.json();
    
    if (!article || !article.title) {
      return NextResponse.json(
        { error: 'Article data is required' },
        { status: 400 }
      );
    }

    console.log('Generating images for article:', article.title);
    
    // Check if AI image generation is available
    try {
      // Generate image prompts using AI
      const prompts = await generateImagePrompts(article);
      console.log('Generated prompts:', prompts);
      
      // Generate actual images
      const images = await generateAIImages(prompts);
      console.log('Generated images:', images);
      
      // Return the first image as featured, rest as media
      const [featuredImage, ...mediaImages] = images;
      
      return NextResponse.json({
        success: true,
        featuredImage,
        mediaImages,
        prompts // Include prompts for debugging
      });
      
    } catch (aiError) {
      console.warn('AI image generation failed, using fallbacks:', aiError);
      
      // Return enhanced fallback images based on article content
      const category = article.category?.toLowerCase() || 'business';
      const fallbackImages = [
        `/api/placeholder/800x400?category=${category}&text=${encodeURIComponent(article.title.substring(0, 50))}`,
        `/api/placeholder/600x300?category=${category}&text=${encodeURIComponent('Related Content')}`,
        `/api/placeholder/600x300?category=${category}&text=${encodeURIComponent('Article Image')}`
      ];
      
      return NextResponse.json({
        success: true,
        featuredImage: fallbackImages[0],
        mediaImages: fallbackImages.slice(1),
        prompts: [],
        fallbackUsed: true
      });
    }
    
  } catch (error) {
    console.error('Error in generate-images API:', error);
    
    // Return basic fallback images
    const fallbackImages = [
      '/api/placeholder/800x400',
      '/api/placeholder/600x300',
      '/api/placeholder/600x300'
    ];
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate images',
      featuredImage: fallbackImages[0],
      mediaImages: fallbackImages.slice(1),
      prompts: [],
      fallbackUsed: true
    });
  }
}
