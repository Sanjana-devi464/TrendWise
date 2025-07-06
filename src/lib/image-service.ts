// Image service health check utilities

interface ImageServiceStatus {
  pollinations: boolean;
  unsplash: boolean;
  lastChecked: number;
}

let serviceStatus: ImageServiceStatus = {
  pollinations: true,
  unsplash: true,
  lastChecked: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function checkImageServiceHealth(): Promise<ImageServiceStatus> {
  const now = Date.now();
  
  // Return cached result if recent
  if (now - serviceStatus.lastChecked < CACHE_DURATION) {
    return serviceStatus;
  }
  
  const checks = await Promise.allSettled([
    // Check Pollinations AI
    fetch('https://image.pollinations.ai/prompt/test?width=100&height=100', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    }).then(r => r.ok),
    
    // Check Unsplash
    fetch('https://source.unsplash.com/100x100/?nature', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    }).then(r => r.ok)
  ]);
  
  serviceStatus = {
    pollinations: checks[0].status === 'fulfilled' ? checks[0].value : false,
    unsplash: checks[1].status === 'fulfilled' ? checks[1].value : false,
    lastChecked: now
  };
  
  console.log('Image service health check:', serviceStatus);
  return serviceStatus;
}

export function getImageServiceUrl(prompt: string, dimensions: { width: number; height: number } = { width: 800, height: 400 }): string {
  const { width, height } = dimensions;
  
  // Try Pollinations first if available
  if (serviceStatus.pollinations) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}`;
  }
  
  // Try Unsplash if available
  if (serviceStatus.unsplash) {
    const keywords = prompt.split(' ').slice(0, 3).join(',');
    return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords)}`;
  }
  
  // Fallback to internal placeholder API
  const category = detectCategory(prompt);
  const text = prompt.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 30);
  return `/api/placeholder/${width}x${height}?category=${category}&text=${encodeURIComponent(text)}`;
}

function detectCategory(prompt: string): string {
  const keywords = prompt.toLowerCase();
  
  if (keywords.includes('technology') || keywords.includes('tech') || keywords.includes('ai') || keywords.includes('digital')) {
    return 'technology';
  } else if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('fitness')) {
    return 'health';
  } else if (keywords.includes('lifestyle') || keywords.includes('fashion') || keywords.includes('travel')) {
    return 'lifestyle';
  } else if (keywords.includes('science') || keywords.includes('research') || keywords.includes('innovation')) {
    return 'science';
  } else if (keywords.includes('sport') || keywords.includes('game') || keywords.includes('match') || keywords.includes('football') || keywords.includes('soccer')) {
    return 'sports';
  } else if (keywords.includes('business') || keywords.includes('finance') || keywords.includes('economy')) {
    return 'business';
  }
  
  return 'business'; // default
}

export { detectCategory };
