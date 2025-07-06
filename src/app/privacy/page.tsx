import { Metadata } from 'next';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - TrendWise',
  description: 'Learn how TrendWise collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/5 to-yellow-400/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Privacy
            <span className="block gradient-text">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
            Your privacy matters to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in-scale">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="h-6 w-6 text-blue-600" />
            <p className="text-gray-600 font-medium">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">1. Information We Collect</h2>
              </div>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                sign in with Google, or comment on articles.
              </p>
              <div className="bg-blue-50 rounded-2xl p-6">
                <ul className="list-none space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Google account information (name, email, profile picture)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Comments and interactions on articles
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Usage data and analytics
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">2. How We Use Your Information</h2>
              </div>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                We use the information we collect to:
              </p>
              <div className="bg-green-50 rounded-2xl p-6">
                <ul className="list-none space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Provide and maintain our service
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Enable user authentication and comments
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Improve our platform and user experience
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Send important updates about our service
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">3. Information Sharing</h2>
              </div>
              <div className="bg-purple-50 rounded-2xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy or with your consent.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Data Security</h2>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Google OAuth</h2>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                We use Google OAuth for authentication. When you sign in with Google, we receive 
                your basic profile information (name, email, profile picture) from Google.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Contact Us</h2>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@trendwise.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                    privacy@trendwise.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
