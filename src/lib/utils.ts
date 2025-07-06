/**
 * Calculate reading time for article content
 * @param content - HTML or plain text content
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  // Strip HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Average reading speed is 200-250 words per minute
  // We'll use 225 words per minute as a middle ground
  const wordsPerMinute = 225;
  
  // Count words (split by whitespace and filter out empty strings)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time and round up to nearest minute
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Minimum reading time is 1 minute
  return Math.max(1, readingTime);
}

/**
 * Generate a URL-friendly slug from a title
 * @param title - Article title
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).replace(/\s+\S*$/, '') + '...';
}

/**
 * Truncate text for SEO meta fields ensuring character limits are respected
 * @param text - Text to truncate
 * @param maxLength - Maximum length allowed
 * @returns Truncated text that fits within SEO limits
 */
export function truncateForSEO(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  
  // For very short limits, just truncate and add ellipsis
  if (maxLength <= 10) {
    return text.substring(0, maxLength - 3) + '...';
  }
  
  // Try to truncate at word boundary
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If we can find a good word boundary, use it
    return truncated.substring(0, lastSpace) + '...';
  } else {
    // Otherwise, just truncate and add ellipsis
    return truncated + '...';
  }
}

/**
 * Validate and truncate SEO meta fields
 * @param fields - Object containing SEO fields to validate
 * @returns Object with validated and truncated SEO fields
 */
export function validateSEOFields(fields: {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  excerpt?: string;
}) {
  return {
    metaTitle: truncateForSEO(fields.metaTitle || '', 60),
    metaDescription: truncateForSEO(fields.metaDescription || '', 160),
    ogTitle: truncateForSEO(fields.ogTitle || '', 60),
    ogDescription: truncateForSEO(fields.ogDescription || '', 160),
    excerpt: truncateForSEO(fields.excerpt || '', 300),
  };
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Generate excerpt from content
 * @param content - HTML content
 * @param length - Maximum length of excerpt
 * @returns Plain text excerpt
 */
export function generateExcerpt(content: string, length: number = 160): string {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  const cleanText = plainText.replace(/\s+/g, ' ').trim();
  
  return truncateText(cleanText, length);
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get time ago string from date
 * @param date - Date string or Date object
 * @returns Time ago string (e.g., "2 hours ago")
 */
export function getTimeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Intelligently places images between text sections in HTML content
 * @param htmlContent - The original HTML content
 * @param images - Array of image URLs to insert
 * @returns Modified HTML content with images inserted between sections
 */
export function interleaveImagesInContent(htmlContent: string, images: string[]): string {
  if (!images || images.length === 0) {
    return htmlContent;
  }

  // Split content by major section breaks (h2, h3 tags or long paragraphs)
  const sectionRegex = /(<h[2-3][^>]*>.*?<\/h[2-3]>|<p[^>]*>.*?<\/p>)/gi;
  const sections = htmlContent.split(sectionRegex).filter(Boolean);
  
  if (sections.length < 2) {
    return htmlContent;
  }

  let imageIndex = 0;
  const result: string[] = [];
  let wordCount = 0;
  const targetWordsPerImage = Math.floor(getTotalWordCount(htmlContent) / (images.length + 1));

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    result.push(section);
    
    // Count words in this section
    const sectionWordCount = getWordCount(section);
    wordCount += sectionWordCount;
    
    // Insert image after accumulating enough content and if we have images left
    const shouldInsertImage = 
      imageIndex < images.length && 
      wordCount >= targetWordsPerImage * (imageIndex + 1) &&
      i < sections.length - 1 && // Not the last section
      !isLastSection(sections, i, 2); // Not within last 2 sections

    if (shouldInsertImage) {
      const imageUrl = images[imageIndex];
      const fallbackUrl = `/api/placeholder/600x300?category=article&text=${encodeURIComponent('Article illustration ' + (imageIndex + 1))}`;
      
      // Create image with fallback handling
      const imageHtml = `
        <div class="embedded-image my-6">
          <img 
            src="${imageUrl}" 
            alt="Article illustration ${imageIndex + 1}"
            loading="lazy"
            onerror="if(this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; }"
            onload="this.style.opacity = '1';"
            style="opacity: 0; transition: opacity 0.3s ease; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
          />
        </div>`;
      result.push(imageHtml);
      imageIndex++;
    }
  }

  return result.join('');
}

/**
 * Counts words in HTML content (excluding HTML tags)
 */
function getWordCount(html: string): number {
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return textContent ? textContent.split(' ').length : 0;
}

/**
 * Gets total word count for HTML content
 */
function getTotalWordCount(html: string): number {
  return getWordCount(html);
}

/**
 * Checks if current index is within the last N sections
 */
function isLastSection(sections: string[], currentIndex: number, withinLast: number): boolean {
  return currentIndex >= sections.length - withinLast;
}

/**
 * Validates if a URL is properly formatted
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate if a user email is the designated admin email
 * @param userEmail - User's email address
 * @param adminEmail - Admin email from environment (optional)
 * @returns Boolean indicating if user is the admin
 */
export function isAdminEmail(userEmail?: string | null, adminEmail?: string): boolean {
  if (!userEmail) return false;
  
  const ADMIN_EMAIL = adminEmail || process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
  
  // Normalize both emails for comparison
  const normalizedUserEmail = userEmail.toLowerCase().trim();
  const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase().trim();
  
  return normalizedUserEmail === normalizedAdminEmail;
}
