'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, Suspense } from 'react';
import { 
  Mail, Sparkles, Crown, Gem, Star, Heart, Briefcase, 
  GraduationCap, Users, TrendingUp, BookOpen, Building2,
  Rocket, Shield, HandHeart, Leaf, ChevronRight, Play,
  ArrowRight, Clock, MapPin, Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';

const FeaturedJobs = dynamic(() => import('../components/FeaturedJobs'), {
  ssr: false,
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page');
    setMounted(true);
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <div className="relative overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen" style={{ fontFamily: "Inter, 'Segoe UI', Roboto, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif" }} suppressHydrationWarning>
      {/* Aura-inspired gradient background - Dark Mode Only */}
      <div 
        className="fixed inset-0 opacity-0 dark:opacity-40 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 600px 400px at 20% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 500px 350px at 75% 60%, rgba(168, 85, 247, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 400px 300px at 60% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 70%),
            radial-gradient(ellipse 350px 250px at 85% 85%, rgba(236, 72, 153, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 300px 200px at 10% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)
          `
        }}
        aria-hidden="true"
      />
      
      {/* Sparkle overlay */}
      <div 
        className="fixed inset-0 dot-celestial opacity-0 dark:opacity-20 pointer-events-none transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Main content wrapper */}
      <div className="relative flex flex-col min-h-screen w-full max-w-full overflow-x-hidden py-6 px-2">
        {/* Three-column layout wrapper */}
        <div className="flex-1 w-full">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* LEFT SIDEBAR */}
            <div className="hidden lg:block w-[240px] shrink-0">
              {mounted && <LeftSidebar />}
            </div>
            
            {/* MAIN CONTENT */}
            <div className="flex-1 min-w-0 space-y-4">
              <HeroSection />
              <FeaturedJobs />
            </div>
            
            {/* RIGHT SIDEBAR */}
            <div className="hidden lg:block w-[240px] shrink-0">
              {mounted && <RightSidebar />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEFT SIDEBAR COMPONENT - PLATFORM FEATURES
// ============================================================================

function LeftSidebar() {
  const platformFeatures = [
    { icon: Briefcase, label: 'Job Board', description: 'Culturally safe opportunities', href: '/jobs', color: 'from-pink-500 to-purple-500' },
    { icon: Heart, label: 'Mentorship', description: 'Connect with guides', href: '/mentorship', color: 'from-purple-500 to-indigo-500' },
    { icon: GraduationCap, label: 'Learning Hub', description: 'Courses & certifications', href: '/courses', color: 'from-indigo-500 to-blue-500' },
    { icon: Users, label: 'Community', description: 'Network with peers', href: '/community', color: 'from-blue-500 to-cyan-500' },
    { icon: Building2, label: 'Employers', description: 'Partner organizations', href: '/business', color: 'from-cyan-500 to-teal-500' },
    { icon: TrendingUp, label: 'Career Paths', description: 'Plan your journey', href: '/career', color: 'from-teal-500 to-green-500' },
  ];

  const quickStats = [
    { label: 'Jobs Available', value: '500+' },
    { label: 'Active Mentors', value: '120+' },
    { label: 'Partner Employers', value: '85' },
  ];

  return (
    <aside className="space-y-4 w-full" suppressHydrationWarning>
      {/* Platform Features */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-500">Explore</h3>
        <nav className="space-y-1">
          {platformFeatures.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.color}`}>
                <item.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors block">{item.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{item.description}</span>
              </div>
            </Link>
          ))}
        </nav>
      </Card>

      {/* Quick Stats */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-500">Platform Stats</h3>
        <div className="space-y-2">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Get Started CTA */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Get Started</h3>
        </div>
        <p className="text-xs mb-3 text-slate-600 dark:text-slate-400">
          Complete your profile to unlock personalized job matches and mentorship opportunities.
        </p>
        <Link 
          href="/onboarding"
          className="block w-full py-2 text-center text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)' }}
        >
          Complete Profile
        </Link>
      </Card>

      {/* Resources */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-500">Resources</h3>
        <nav className="space-y-1">
          {[
            { icon: Shield, label: 'Cultural Safety', href: '/resources/cultural-safety' },
            { icon: HandHeart, label: 'Support Services', href: '/resources/support' },
            { icon: Leaf, label: 'Wellbeing', href: '/resources/wellbeing' },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{item.label}</span>
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  );
}

// ============================================================================
// RIGHT SIDEBAR COMPONENT - SOCIAL & ACTIVITY
// ============================================================================

function RightSidebar() {
  const feedItems = [
    { id: 1, user: 'Sarah M.', avatar: 'SM', action: 'landed a new role', detail: 'Software Developer at BHP', time: '2h ago', type: 'achievement' },
    { id: 2, user: 'Community', avatar: '🎉', action: 'New event', detail: 'Indigenous Tech Meetup - Sydney', time: '4h ago', type: 'event' },
    { id: 3, user: 'James K.', avatar: 'JK', action: 'shared an article', detail: 'Building Careers in Country', time: '5h ago', type: 'post' },
    { id: 4, user: 'Mentor Match', avatar: '🤝', action: 'New mentor available', detail: 'Tech & Engineering', time: '6h ago', type: 'mentor' },
    { id: 5, user: 'Emily W.', avatar: 'EW', action: 'completed a course', detail: 'Project Management Certificate', time: '8h ago', type: 'achievement' },
  ];

  const quickLinks = [
    { icon: Users, label: 'My Network', href: '/connections', count: 42 },
    { icon: BookOpen, label: 'Saved Posts', href: '/bookmarks', count: 8 },
    { icon: Heart, label: 'Following', href: '/following', count: 15 },
  ];

  return (
    <aside className="space-y-4 w-full overflow-hidden" suppressHydrationWarning>
      {/* User Profile Card */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)' }}>
            JD
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">John Doe</div>
            <div className="text-xs truncate text-slate-600 dark:text-slate-400">Software Engineer</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0 text-center mb-3">
          <div className="rounded-l-lg p-1.5 bg-slate-100 dark:bg-white/5">
            <div className="text-[9px] text-slate-500 dark:text-slate-500">Views</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">128</div>
          </div>
          <div className="p-1.5 bg-slate-100 dark:bg-white/5">
            <div className="text-[9px] text-slate-500 dark:text-slate-500">Saved</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">12</div>
          </div>
          <div className="rounded-r-lg p-1.5 bg-slate-100 dark:bg-white/5">
            <div className="text-[9px] text-slate-500 dark:text-slate-500">Applied</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">5</div>
          </div>
        </div>
        <Link 
          href="/profile" 
          className="block w-full py-2 text-center text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)' }}
        >
          View Profile
        </Link>
      </Card>

      {/* Quick Social Links */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider text-slate-500 dark:text-slate-500">Social</h3>
        <nav className="space-y-1">
          {quickLinks.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{item.label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400">{item.count}</span>
            </Link>
          ))}
        </nav>
      </Card>

      {/* Activity Feed */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">Feed</h3>
          <Link href="/social-feed" className="text-xs font-medium hover:opacity-80 text-purple-600 dark:text-purple-400">See All</Link>
        </div>
        <div className="space-y-3">
          {feedItems.map((item) => (
            <div key={item.id} className="flex gap-3 items-start group cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)' }}>
                {item.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">{item.user}</span>{' '}
                  {item.action}
                </p>
                <p className="text-[10px] truncate text-slate-500 dark:text-slate-500">{item.detail}</p>
                <p className="text-[10px] mt-0.5 text-slate-400 dark:text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Share Your Journey */}
      <Card variant="ngurra" padding="md" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Share Your Journey</h3>
        </div>
        <p className="text-xs mb-3 text-slate-600 dark:text-slate-400" suppressHydrationWarning>
          Celebrate wins, ask questions, or connect with the community.
        </p>
        <Link 
          href="/social-feed/new"
          className="block w-full py-2 text-center text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)' }}
        >
          Create Post
        </Link>
      </Card>
    </aside>
  );
}

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

function HeroSection() {
  return (
    <section className="relative rounded-xl overflow-hidden border shadow-2xl border-slate-200 dark:border-slate-700/30 bg-white dark:bg-[#050816] transition-colors duration-300">
      {/* Aura gradient background - Dark Mode */}
      <div 
        className="absolute inset-0 z-0 opacity-0 dark:opacity-100 transition-opacity duration-300"
        style={{ 
          background: 'linear-gradient(135deg, #050816 0%, rgba(99,102,241,0.3) 25%, rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.3) 75%, #050816 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }} 
      />

       {/* Aura gradient background - Light Mode */}
       <div 
        className="absolute inset-0 z-0 dark:opacity-0 transition-opacity duration-300"
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 215, 0, 0.05) 25%, rgba(236, 72, 153, 0.05) 50%, rgba(80, 200, 120, 0.05) 75%, #ffffff 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite'
        }} 
      />

      {/* Overlay for readability - Dark Mode Only */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 z-10 opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-300" />
      
      {/* Sparkle/star decorations */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-8 right-12 w-2 h-2 rounded-full animate-pulse shadow-lg" style={{ background: '#ec4899', boxShadow: '0 0 10px rgba(236,72,153,0.5)' }} />
        <div className="absolute top-16 right-24 w-1.5 h-1.5 bg-slate-300 dark:bg-white rounded-full animate-pulse delay-300" />
        <div className="absolute top-24 right-8 w-1 h-1 rounded-full animate-pulse delay-700" style={{ background: '#a855f7' }} />
        <div className="absolute bottom-12 left-1/3 w-1.5 h-1.5 rounded-full animate-pulse delay-500" style={{ background: '#6366f1' }} />
        <div className="absolute bottom-20 right-1/4 w-2 h-2 rounded-full animate-pulse delay-1000" style={{ background: '#ec4899' }} />
      </div>

      <div className="relative z-20 p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[380px]">
        {/* Main headline */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          <span>Your Path, </span>
          <span className="animate-pulse" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Story.
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-200">
          Connect with <span className="font-semibold" style={{ color: '#a855f7' }}>culturally safe employers</span>, find mentors who understand your journey, and build a career that <span className="font-semibold" style={{ color: '#ec4899' }}>honors your heritage</span>.
        </p>
        
        {/* CTA Cards - Full width, stretched */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Link 
            href="/jobs" 
            className="group relative flex-1 p-4 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)', boxShadow: '0 10px 30px rgba(168,85,247,0.3)' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold">Find a Job</div>
                  <div className="text-sm text-white/70 font-normal">500+ culturally safe opportunities</div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          <Link 
            href="/mentorship" 
            className="group relative flex-1 p-4 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%)', boxShadow: '0 10px 30px rgba(99,102,241,0.3)' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold">Find a Mentor</div>
                  <div className="text-sm text-white/70 font-normal">Connect with experienced guides</div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
