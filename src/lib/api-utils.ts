// API Response Caching Utilities

interface CacheConfig {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  mustRevalidate?: boolean;
}

export function setCacheHeaders(
  response: Response, 
  config: CacheConfig = {}
): Response {
  const {
    maxAge = 300, // 5 minutes default
    staleWhileRevalidate = 60, // 1 minute default
    mustRevalidate = false
  } = config;

  const headers = new Headers(response.headers);
  
  const cacheControl = [
    'public',
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`
  ];

  if (mustRevalidate) {
    cacheControl.push('must-revalidate');
  }

  headers.set('Cache-Control', cacheControl.join(', '));
  headers.set('Vary', 'Accept-Encoding');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function createCachedResponse(
  data: any, 
  config: CacheConfig = {},
  status = 200
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return setCacheHeaders(response, config);
}

// Memory cache for short-term API responses
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number = 300): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Cleanup expired cache entries every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}

// Rate limiting
class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

// Error handling utility
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function createErrorResponse(
  error: APIError | Error, 
  defaultStatus = 500
): Response {
  const statusCode = error instanceof APIError ? error.statusCode : defaultStatus;
  const code = error instanceof APIError ? error.code : 'INTERNAL_ERROR';

  return new Response(
    JSON.stringify({
      error: error.message,
      code,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Request validation utility
interface ValidationRule {
  type: 'string' | 'number' | 'boolean';
  min?: number;
  max?: number;
  maxLength?: number;
  optional?: boolean;
  default?: any;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  valid: boolean;
  data: any;
  errors?: string[];
}

export function validateRequest(
  searchParams: URLSearchParams, 
  schema: ValidationSchema
): ValidationResult {
  const data: any = {};
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = searchParams.get(key);
    
    if (!value) {
      if (!rule.optional) {
        if (rule.default !== undefined) {
          data[key] = rule.default;
        } else {
          errors.push(`${key} is required`);
        }
      }
      continue;
    }

    // Type validation and conversion
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${key} must be a number`);
        continue;
      }
      if (rule.min && numValue < rule.min) {
        errors.push(`${key} must be at least ${rule.min}`);
        continue;
      }
      if (rule.max && numValue > rule.max) {
        errors.push(`${key} must be at most ${rule.max}`);
        continue;
      }
      data[key] = numValue;
    } else if (rule.type === 'string') {
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${key} must be at most ${rule.maxLength} characters`);
        continue;
      }
      data[key] = value;
    } else if (rule.type === 'boolean') {
      data[key] = value === 'true';
    }
  }

  return {
    valid: errors.length === 0,
    data,
    errors: errors.length > 0 ? errors : undefined
  };
}

// API Error handling utility
export function handleApiError(
  message: string, 
  status: number = 500, 
  details?: any
): Response {
  console.error('API Error:', { message, status, details });

  const errorResponse = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && details && { details })
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
