import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth';
import { cacheHelpers } from '@/lib/cache';

// Get a single article for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin OR is the designated admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    const hasAdminRole = session?.user?.role === 'admin';
    const isDesignatedAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    const isAdmin = hasAdminRole || isDesignatedAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// Update an article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin OR is the designated admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    const hasAdminRole = session?.user?.role === 'admin';
    const isDesignatedAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    const isAdmin = hasAdminRole || isDesignatedAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const {
      _id: _,
      createdAt: __,
      updatedAt: ___,
      views: ____,
      ...updateData
    } = body;

    const article = await Article.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Invalidate the articles cache so changes appear immediately
    console.log('Invalidating articles cache after article update...');
    cacheHelpers.clearCache('articles');

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
      article
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check if user is admin OR is the designated admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sanjanade464@gmail.com';
    const hasAdminRole = session?.user?.role === 'admin';
    const isDesignatedAdmin = session?.user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    const isAdmin = hasAdminRole || isDesignatedAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Find the article first
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete all comments associated with this article
    await Comment.deleteMany({ articleId: id });
    
    // Delete the article
    await Article.findByIdAndDelete(id);

    // Invalidate the articles cache so changes appear immediately
    console.log('Invalidating articles cache after article deletion...');
    cacheHelpers.clearCache('articles');
    
    // Also trigger client-side cache invalidation
    cacheHelpers.invalidateClientCache('articles', { 
      action: 'delete', 
      articleId: id,
      timestamp: Date.now() 
    });

    return NextResponse.json({
      success: true,
      message: 'Article and associated comments deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
