import mongoose, { Connection } from 'mongoose';

interface DatabaseCacheConfig {
  useCache?: boolean;
  ttl?: number; // Time to live in seconds
}

interface ConnectionConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Extend the global type
declare global {
  var mongoose: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const defaultConnectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  // Performance optimizations
  autoIndex: false, // Don't build indexes
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
};

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    const connectionOptions = {
      ...defaultConnectionOptions,
      dbName: process.env.NODE_ENV === 'production' ? 'trendwise-prod' : 'trendwise-dev',
    };

    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connection pooling and optimization
export async function connectToDatabase(config?: ConnectionConfig): Promise<Connection> {
  return dbConnect();
}

// Database query optimization utilities
export class DatabaseOptimizer {
  static async findWithCache<T>(
    model: mongoose.Model<T>,
    query: any,
    options: DatabaseCacheConfig & mongoose.QueryOptions = {}
  ) {
    const { useCache = false, ttl = 300, ...queryOptions } = options;
    
    // Create cache key from query
    const cacheKey = `db:${model.modelName}:${JSON.stringify(query)}:${JSON.stringify(queryOptions)}`;
    
    if (useCache) {
      // Check cache first (implement your preferred caching solution)
      // For now, we'll use a simple in-memory cache
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Execute query with optimizations
    const result = await model
      .find(query, null, queryOptions)
      .lean() // Return plain JavaScript objects instead of Mongoose documents
      .exec();

    if (useCache) {
      await this.setCache(cacheKey, result, ttl);
    }

    return result;
  }

  static async aggregateWithCache<T>(
    model: mongoose.Model<T>,
    pipeline: any[],
    options: DatabaseCacheConfig = {}
  ) {
    const { useCache = false, ttl = 300 } = options;
    
    const cacheKey = `db:${model.modelName}:agg:${JSON.stringify(pipeline)}`;
    
    if (useCache) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Add optimization stages to pipeline
    const optimizedPipeline = [
      ...pipeline,
      { $addFields: { _cacheTimestamp: new Date() } }
    ];

    const result = await model.aggregate(optimizedPipeline).exec();

    if (useCache) {
      await this.setCache(cacheKey, result, ttl);
    }

    return result;
  }

  private static cacheStorage = new Map<string, { data: any; expires: number }>();

  private static async getFromCache(key: string): Promise<any | null> {
    const item = this.cacheStorage.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cacheStorage.delete(key);
      return null;
    }

    return item.data;
  }

  private static async setCache(key: string, data: any, ttl: number): Promise<void> {
    const expires = Date.now() + (ttl * 1000);
    this.cacheStorage.set(key, { data, expires });
  }

  // Cleanup expired cache entries
  static cleanupCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cacheStorage.entries()) {
      if (now > item.expires) {
        this.cacheStorage.delete(key);
      }
    }
  }
}

// Performance monitoring
export class DatabaseMonitor {
  private static queryTimes = new Map<string, number[]>();

  static startQuery(queryId: string): void {
    if (!this.queryTimes.has(queryId)) {
      this.queryTimes.set(queryId, []);
    }
    this.queryTimes.get(queryId)!.push(Date.now());
  }

  static endQuery(queryId: string): number {
    const times = this.queryTimes.get(queryId);
    if (!times || times.length === 0) return 0;

    const startTime = times.pop()!;
    const duration = Date.now() - startTime;

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryId} took ${duration}ms`);
    }

    return duration;
  }

  static getAverageQueryTime(queryId: string): number {
    const times = this.queryTimes.get(queryId);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }
}

// Cleanup cache every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    DatabaseOptimizer.cleanupCache();
  }, 10 * 60 * 1000);
}

export default dbConnect;
