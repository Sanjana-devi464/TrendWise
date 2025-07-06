import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  featuredImage?: string;
  media: {
    images?: string[];
    videos?: string[];
    tweets?: string[];
  };
  tags: string[];
  category: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  readingTime: number;
  viewCount: number;
  trending: {
    source: string; // 'google' | 'twitter' | 'manual'
    keywords: string[];
    trendScore: number;
  };
}

const ArticleSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxLength: 300
  },
  metaTitle: {
    type: String,
    required: true,
    maxLength: 60
  },
  metaDescription: {
    type: String,
    required: true,
    maxLength: 160
  },
  ogImage: {
    type: String,
    default: ''
  },
  ogTitle: {
    type: String,
    maxLength: 60
  },
  ogDescription: {
    type: String,
    maxLength: 160
  },
  featuredImage: {
    type: String,
    default: ''
  },
  media: {
    images: [{
      type: String
    }],
    videos: [{
      type: String
    }],
    tweets: [{
      type: String
    }]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'TrendWise AI'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  readingTime: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  trending: {
    source: {
      type: String,
      enum: ['google', 'twitter', 'manual'],
      default: 'google'
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    trendScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ isPublished: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ 'trending.keywords': 1 });

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
