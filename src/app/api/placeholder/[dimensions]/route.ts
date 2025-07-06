import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string }> }
) {
  try {
    const { dimensions } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags') || '';
    const text = searchParams.get('text') || '';
    
    const [width, height] = dimensions.split('x').map(Number);
    
    if (!width || !height || width > 2000 || height > 2000) {
      return new NextResponse('Invalid dimensions', { status: 400 });
    }

    // Generate color based on category
    let backgroundColor = '#f3f4f6';
    let textColor = '#6b7280';
    
    if (category) {
      switch (category.toLowerCase()) {
        case 'technology':
        case 'tech':
          backgroundColor = '#e0e7ff';
          textColor = '#4338ca';
          break;
        case 'business':
          backgroundColor = '#ecfdf5';
          textColor = '#059669';
          break;
        case 'lifestyle':
          backgroundColor = '#fef3c7';
          textColor = '#d97706';
          break;
        case 'health':
          backgroundColor = '#fce7f3';
          textColor = '#be185d';
          break;
        case 'science':
          backgroundColor = '#e0f2fe';
          textColor = '#0369a1';
          break;
        default:
          backgroundColor = '#f3f4f6';
          textColor = '#6b7280';
      }
    }

    // Generate display text
    const displayText = text || (category ? category.charAt(0).toUpperCase() + category.slice(1) : `${width} × ${height}`);

    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100%" height="100%" fill="${backgroundColor}"/>
            <circle cx="20" cy="20" r="1" fill="${textColor}" opacity="0.1"/>
            <circle cx="80" cy="40" r="1" fill="${textColor}" opacity="0.1"/>
            <circle cx="40" cy="80" r="1" fill="${textColor}" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grain)"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
              font-family="Arial, sans-serif" 
              font-size="${Math.min(width, height) / 20}" 
              fill="${textColor}" 
              font-weight="500">
          ${displayText}
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}
