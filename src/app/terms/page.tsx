import { Metadata } from 'next';
import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - TrendWise',
  description: 'Read our terms of service and user agreement for TrendWise.',
};

export default function TermsPage() {
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
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Terms of
            <span className="block gradient-text">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
            Please read these terms carefully before using TrendWise. By using our service, you agree to these terms.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in-scale">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-6 w-6 text-blue-600" />
            <p className="text-gray-600 font-medium">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">1. Acceptance of Terms</h2>
              </div>
              <div className="bg-green-50 rounded-2xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  By accessing and using TrendWise, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">2. Use License</h2>
              </div>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                Permission is granted to temporarily access TrendWise for personal, 
                non-commercial transitory viewing only.
              </p>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">Under this license you may not:</p>
              <div className="bg-red-50 rounded-2xl p-6">
                <ul className="list-none space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Modify or copy the materials
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Use the materials for commercial purposes
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Attempt to reverse engineer any software
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Remove any copyright or proprietary notations
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">3. User Content</h2>
              </div>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                By posting comments or other content on TrendWise, you grant us a non-exclusive, 
                royalty-free license to use, modify, and display such content.
              </p>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">You agree that your content will:</p>
              <div className="bg-blue-50 rounded-2xl p-6">
                <ul className="list-none space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Be appropriate and not offensive
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Not violate any laws or regulations
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Not infringe on others' rights
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Be factual and not misleading
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0">4. Disclaimer</h2>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  The materials on TrendWise are provided on an 'as is' basis. TrendWise makes 
                  no warranties, expressed or implied, and hereby disclaims all other warranties.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Limitations</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                TrendWise shall not be held liable for any damages arising out of the use 
                or inability to use the materials on our platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Modifications</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                TrendWise may revise these terms of service at any time without notice. 
                By using this platform, you agree to be bound by the current version of these terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Contact Information</h2>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:legal@trendwise.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                    legal@trendwise.com
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
