'use client';

interface ArticleVideoProps {
  src: string;
  title: string;
  className?: string;
  onVideoError?: () => void;
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ArticleVideo({ 
  src, 
  title, 
  className,
  onVideoError
}: ArticleVideoProps) {
  if (!src || !src.trim() || !isValidUrl(src)) {
    return null;
  }

  return (
    <iframe
      src={src}
      className={className}
      allowFullScreen
      title={title}
      style={{ opacity: 0, transition: 'opacity 0.3s' }}
      onError={(e) => {
        console.error('Video failed to load:', src);
        const target = e.target as HTMLIFrameElement;
        const parent = target.closest('.video-container');
        if (parent) {
          (parent as HTMLElement).style.display = 'none';
        }
        onVideoError?.();
      }}
      onLoad={(e) => {
        const target = e.target as HTMLIFrameElement;
        target.style.opacity = '1';
      }}
    />
  );
}
