import { Metadata } from 'next';
import { TrendingUp, Zap, Users, Target, Shield, Lightbulb, Heart, Award } from 'lucide-react';
import ScrollHandler from '@/components/ScrollHandler';

export const metadata: Metadata = {
  title: 'About Us - TrendWise | AI-Powered Insights Platform',
  description: 'Learn about TrendWise, the AI-powered platform that discovers trending topics and generates insightful articles. Meet our team and discover our mission to keep you informed.',
  keywords: ['about trendwise', 'ai platform', 'trending topics', 'team', 'mission', 'vision', 'artificial intelligence', 'content discovery'],
  authors: [{ name: 'TrendWise Team' }],
  creator: 'TrendWise',
  publisher: 'TrendWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'About TrendWise - AI-Powered Insights Platform',
    description: 'Discover the story behind TrendWise and how we\'re revolutionizing content discovery with AI.',
    type: 'website',
    url: 'https://trendwise.com/about',
    siteName: 'TrendWise',
    locale: 'en_US',
    images: [
      {
        url: '/api/generate-images/about-hero/1200x630',
        width: 1200,
        height: 630,
        alt: 'TrendWise Team - AI-Powered Content Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About TrendWise - AI-Powered Insights Platform',
    description: 'Discover the story behind TrendWise and how we\'re revolutionizing content discovery with AI.',
    creator: '@trendwise',
    images: ['/api/generate-images/about-hero/1200x630'],
  },
  alternates: {
    canonical: 'https://trendwise.com/about',
  },
};

// Structured data for the organization
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TrendWise',
  description: 'AI-powered platform that discovers trending topics and generates insightful articles',
  url: 'https://trendwise.com',
  logo: 'https://trendwise.com/logo.png',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Miss Sanjana Devi',
    jobTitle: 'Founder & CEO',
    description: 'Computer Science Engineering student with expertise in full-stack development and AI integration',
    sameAs: [
      'https://linkedin.com/in/sanjana-devi',
      'https://github.com/sanjana-devi'
    ]
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@trendwise.com',
    contactType: 'customer service',
    availableLanguage: 'English'
  },
  sameAs: [
    'https://twitter.com/trendwise',
    'https://linkedin.com/company/trendwise'
  ]
};

// Performance optimization: Define static content
const FEATURE_CARDS = [
  {
    id: 'ai-powered',
    icon: Zap,
    title: 'AI-Powered Intelligence',
    description: 'Our advanced AI algorithms analyze millions of data points to identify emerging trends before they go mainstream, giving you a competitive edge.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'real-time',
    icon: TrendingUp,
    title: 'Real-time Insights',
    description: 'Stay updated with real-time trend analysis and instant article generation, ensuring you never miss the next big thing in your industry.',
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'community',
    icon: Users,
    title: 'Community-Driven',
    description: 'Join thousands of forward-thinking individuals who rely on TrendWise for their daily dose of insights and engaging discussions.',
    gradient: 'from-purple-500 to-purple-600',
  },
] as const;

const STATS = [
  { value: '50K+', label: 'Articles Generated', color: 'text-blue-600' },
  { value: '25K+', label: 'Active Users', color: 'text-green-600' },
  { value: '1M+', label: 'Trends Analyzed', color: 'text-purple-600' },
  { value: '99.9%', label: 'Uptime', color: 'text-orange-600' },
] as const;

const VALUES = [
  {
    id: 'trust',
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We believe in building trust through transparency in our AI processes and data handling practices.',
    color: 'bg-blue-600',
  },
  {
    id: 'innovation',
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We continuously push the boundaries of AI technology to deliver cutting-edge solutions.',
    color: 'bg-green-600',
  },
  {
    id: 'user-centric',
    icon: Heart,
    title: 'User-Centric',
    description: 'Every feature we build is designed with our users\' needs and experience at the forefront.',
    color: 'bg-purple-600',
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <ScrollHandler />
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" aria-hidden="true"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg" aria-hidden="true">
                  <TrendingUp className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TrendWise</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We're on a mission to democratize access to trending insights and AI-powered content, 
                helping millions stay informed in our rapidly changing world.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20" aria-labelledby="mission-vision-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-blue-600 mr-3" aria-hidden="true" />
                  <h2 id="mission-vision-heading" className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  At TrendWise, we believe everyone deserves access to the latest trends and insights that shape our world. 
                  Our AI-powered platform crawls the web, identifies emerging topics, and generates comprehensive articles 
                  that keep you ahead of the curve.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We're not just another content platform – we're your intelligent companion in navigating the 
                  information landscape, filtering noise, and delivering what matters most.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center mb-6">
                  <Lightbulb className="h-8 w-8 text-purple-600 mr-3" aria-hidden="true" />
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  To become the world's leading AI-powered insights platform, where curiosity meets intelligence, 
                  and where staying informed becomes effortless and engaging.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <blockquote className="text-base text-gray-700 italic">
                    "In a world of information overload, we're the lighthouse guiding you to what truly matters."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-4xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine cutting-edge AI technology with human insight to deliver unparalleled content discovery.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURE_CARDS.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <article
                    key={feature.id}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 focus-within:shadow-xl focus-within:-translate-y-2"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`} aria-hidden="true">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20" aria-labelledby="stats-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="stats-heading" className="text-4xl font-bold text-gray-900 mb-4">TrendWise by the Numbers</h2>
              <p className="text-xl text-gray-600">Our impact in the world of AI-powered content discovery.</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`} aria-describedby={`stat-${index}-desc`}>
                    {stat.value}
                  </div>
                  <div id={`stat-${index}-desc`} className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section id="meet-the-team" className="py-20" aria-labelledby="team-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="team-heading" className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The visionary minds behind TrendWise, dedicated to revolutionizing AI-powered content discovery.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="max-w-md">
                <article className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full -translate-y-16 translate-x-16" aria-hidden="true"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-blue-600/5 rounded-full translate-y-12 -translate-x-12" aria-hidden="true"></div>
                  
                  <div className="relative z-10">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-500/20">
                        <img 
                          src="https://i.ibb.co/Mkrr5B1F/Pi7-Passport-Photo.jpg" 
                          alt="Miss Sanjana Devi - Founder & CEO of TrendWise" 
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      </div>
                    </div>
                    
                    {/* Name & Title */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Miss Sanjana Devi</h3>
                      <p className="text-lg text-blue-600 font-semibold">Founder & CEO</p>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-8 text-center">
                      Results-driven Computer Science Engineering student with hands-on experience in full-stack 
                      development and AI integration. Demonstrated leadership through successful project 
                      management and hackathon participation. Seeking to leverage technical expertise and 
                      problem-solving abilities to contribute to innovative software solutions in a dynamic 
                      development environment.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-4" role="list">
                      <a 
                        href="https://www.linkedin.com/in/sanjana-devi-6719b1359/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Connect with Sanjana Devi on LinkedIn"
                      >
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a 
                        href="https://github.com/Sanjana-devi464" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        aria-label="View Sanjana Devi's GitHub Profile"
                      >
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a 
                        href="mailto:sanjanash464@gmail.com"
                        className="p-3 bg-green-600 hover:bg-green-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        aria-label="Send email to Sanjana Devi"
                      >
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white" aria-labelledby="values-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="values-heading" className="text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                The principles that guide everything we do at TrendWise.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VALUES.map((value) => {
                const IconComponent = value.icon;
                return (
                  <article key={value.id} className="text-center p-8">
                    <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-6`} aria-hidden="true">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center" aria-hidden="true">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 id="cta-heading" className="text-4xl font-bold text-white mb-6">Ready to Stay Ahead?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of forward-thinking individuals who rely on TrendWise for their daily insights. 
              Start your journey with AI-powered content discovery today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/articles"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Explore Articles
              </a>
              <a
                href="/trends"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                View Trending Topics
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
