import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Eye, Tag, ArrowLeft } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import ArticleImage from '@/components/ArticleImage';
import ArticleErrorBoundary from '@/components/ArticleErrorBoundary';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import { interleaveImagesInContent, isValidImageUrl } from '@/lib/utils';

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Process article content with interleaved images
function processArticleContent(article: any): string {
  let content = article.content;
  
  // Get valid images from media array
  const validImages = article.media?.images
    ?.filter((img: string) => img && isValidImageUrl(img))
    ?.slice(0, 4) || []; // Limit to 4 images for performance
  
  // If we have images, interleave them in the content
  if (validImages.length > 0) {
    content = interleaveImagesInContent(content, validImages);
  }
  
  return content;
}

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string) {
  try {
    await dbConnect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const article = await Article.findOne({ slug, isPublished: true }).lean() as any;
    
    if (!article) {
      return null;
    }
    
    // Convert MongoDB ObjectId to string
    return {
      ...article,
      _id: article._id.toString(),
      publishedAt: article.publishedAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found - TrendWise',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.tags?.join(', '),
    authors: [{ name: article.author }],
    openGraph: {
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.excerpt,
      images: article.ogImage ? [{ url: article.ogImage }] : undefined,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.excerpt,
      images: article.ogImage ? [article.ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <ArticleErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gray-900 text-white">
          {article.featuredImage && article.featuredImage.trim() !== '' && isValidUrl(article.featuredImage) && (
            <div className="absolute inset-0 opacity-30 image-container">
              <ArticleImage
                src={article.featuredImage}
                alt={article.title}
                fill={true}
                className="object-cover"
                priority={true}
                style={{ opacity: 0, transition: 'opacity 0.3s' }}
                article={article}
                fallbackType="featured"
              />
            </div>
          )}
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-6">
              <Link
                href="/articles"
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-blue-600 px-3 py-1 rounded-full">{article.category}</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readingTime} min read
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {article.viewCount} views
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {article.title}
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl">
                {article.excerpt}
              </p>
              
              <div className="text-sm text-gray-400">
                By {article.author}
              </div>
            </div>
          </div>
        </div>

      {/* Article Content */}
      <div className="relative">
        {/* Background Image */}
        {article.featuredImage && article.featuredImage.trim() !== '' && (
          <div className="absolute inset-0 opacity-5">
            <ArticleImage
              src={article.featuredImage}
              alt=""
              fill={true}
              className="object-cover"
              style={{ opacity: 0, transition: 'opacity 0.3s' }}
              article={article}
              fallbackType="featured"
            />
          </div>
        )}
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: processArticleContent(article) }}
              className="text-gray-900 leading-relaxed article-content bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-sm"
              style={{ 
                // Prevent image-related CSS issues
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            />
          </article>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/articles?search=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
            <CommentSection articleSlug={article.slug} />
          </div>
        </div>
      </div>
    </div>
    </ArticleErrorBoundary>
  );
}
