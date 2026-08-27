import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Repeat, Users, Zap, BookOpen, Star, ArrowRight, CheckCircle2, TrendingUp, Award } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="flex items-center justify-between px-6 py-4 lg:px-12" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 transition-colors">
              <Repeat size={28} strokeWidth={2.5} />
              <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero section */}
      <div className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-8 bg-indigo-100 border border-indigo-200">
              <span className="text-xs font-semibold text-indigo-700">🎓 Learn & Earn • No Cost</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
              Learn Anything,<br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Teach Everything</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with skilled professionals to exchange knowledge. Learn new skills, share your expertise, and grow your network—all for free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="#features" className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                Learn More
              </a>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 pt-12 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-6 font-medium">TRUSTED BY PROFESSIONALS WORLDWIDE</p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">45K+</div>
                  <div className="text-sm text-gray-600">Active Learners</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">12K+</div>
                  <div className="text-sm text-gray-600">Skills Shared</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">⭐ 4.9/5</div>
                  <div className="text-sm text-gray-600">Community Rated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Why Choose SkillSwap?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to master new skills and build meaningful connections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { 
                name: 'Peer-to-Peer Learning', 
                description: 'Learn directly from skilled professionals in your community. Real knowledge, real experience.',
                icon: Users,
                color: 'bg-blue-100 text-blue-600'
              },
              { 
                name: 'Smart Matching', 
                description: 'Our algorithm connects you with perfect learning partners based on shared interests.',
                icon: Zap,
                color: 'bg-yellow-100 text-yellow-600'
              },
              { 
                name: 'Scheduled Sessions', 
                description: 'Flexible 1-on-1 virtual sessions with integrated video and collaboration tools.',
                icon: BookOpen,
                color: 'bg-purple-100 text-purple-600'
              },
              { 
                name: 'Build Your Reputation', 
                description: 'Earn badges and ratings. Showcase your expertise to your professional network.',
                icon: Star,
                color: 'bg-red-100 text-red-600'
              },
            ].map((feature) => (
              <div key={feature.name} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Get Started in 4 Steps</h2>
            <p className="text-xl text-gray-600">Join thousands who are already learning and teaching</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                step: '1', 
                title: 'Create Your Profile',
                description: 'Set up your account and tell us about yourself',
                icon: Award
              },
              { 
                step: '2', 
                title: 'Add Your Skills',
                description: 'List what you know and what you want to learn',
                icon: CheckCircle2
              },
              { 
                step: '3', 
                title: 'Find Your Match',
                description: 'Discover people with complementary skills',
                icon: Users
              },
              { 
                step: '4', 
                title: 'Start Learning',
                description: 'Schedule sessions and begin your journey',
                icon: TrendingUp
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    {idx < 3 && (
                      <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-transparent"></div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="py-20 sm:py-28 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { label: 'Active Users', value: '45K+', icon: '👥' },
              { label: 'Skills Listed', value: '500+', icon: '🎯' },
              { label: 'Sessions Completed', value: '125K+', icon: '✓' },
              { label: 'Avg Rating', value: '4.9★', icon: '⭐' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Ready to Transform Your Skills?</h2>
          <p className="text-xl text-gray-600 mb-10">Join a vibrant community of learners and experts. Start your journey today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
            >
              Sign Up for Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all"
            >
              Already a Member? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 pb-12 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Repeat size={20} />
                <span className="font-bold">SkillSwap</span>
              </div>
              <p className="text-sm text-gray-400">Learn, teach, and grow with a global community.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
