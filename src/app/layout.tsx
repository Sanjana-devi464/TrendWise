import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from 'next/dynamic';
import Script from 'next/script';
import "./globals.css";
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load Footer since it's below the fold
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="h-16" /> // Placeholder to prevent layout shift
});

// Preload critical fonts
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif']
});

export const metadata: Metadata = {
  title: "TrendWise - AI-Powered Blog Platform",
  description: "Discover trending topics and AI-generated articles on technology, business, and more. Stay ahead with TrendWise.",
  keywords: "trending topics, AI articles, blog, technology, business, news",
  authors: [{ name: "TrendWise" }],
  creator: "TrendWise",
  publisher: "TrendWise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: "TrendWise - AI-Powered Blog Platform",
    description: "Discover trending topics and AI-generated articles on technology, business, and more.",
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: "TrendWise",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TrendWise - AI-Powered Blog Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TrendWise - AI-Powered Blog Platform",
    description: "Discover trending topics and AI-generated articles on technology, business, and more.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        
        {/* Critical resource hints */}
        <link rel="preload" href="/api/articles" as="fetch" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Optimized favicon and PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        
        {/* Theme and viewport optimizations */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrendWise" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* Critical CSS inlining hint */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        <noscript>
          <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
        </noscript>
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Performance monitoring script */}
        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance monitoring early
              window.__PERFORMANCE_START__ = performance.now();
              
              // Monitor Core Web Vitals
              new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                  }
                }
              }).observe({entryTypes: ['largest-contentful-paint']});
            `,
          }}
        />
        
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow" id="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </Providers>

        {/* Service Worker Registration - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="sw-register"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered successfully');
                        
                        // Update available
                        registration.addEventListener('updatefound', () => {
                          const newWorker = registration.installing;
                          if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content available
                                if (confirm('New version available! Reload to update?')) {
                                  if (typeof window !== 'undefined') {
                                    window.location.reload();
                                  }
                                }
                              }
                            });
                          }
                        });
                      })
                      .catch(function(error) {
                        console.log('SW registration failed:', error);
                      });
                  });
                }
              `,
            }}
          />
        )}
        
        {/* Critical performance measurement */}
        <Script
          id="performance-end"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', () => {
                const loadTime = performance.now() - window.__PERFORMANCE_START__;
                console.log('Page load time:', loadTime + 'ms');
                
                // Report to analytics if available
                if (typeof gtag !== 'undefined') {
                  gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_map: { load_time: loadTime }
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
