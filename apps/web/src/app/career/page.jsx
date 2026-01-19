'use client';

/**
 * Career Progress Page
 * Track career milestones, achievements, and goals
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Trophy, Loader2, Target, TrendingUp, Star, Video, Briefcase, DollarSign, Route } from 'lucide-react';
import CareerMilestones from '@/components/CareerMilestones';

export default function CareerPage() {
  // Theme colors
  const accentPink = '#E91E8C';
  const accentPurple = '#8B5CF6';

  return (
    <div 
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}
      suppressHydrationWarning
    >
      {/* Decorative halos */}
      <div 
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentPink}22 0%, transparent 70%)`, filter: 'blur(40px)' }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentPurple}22 0%, transparent 70%)`, filter: 'blur(40px)' }}
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-slate-600">
            <li><Link href="/" className="hover:text-rose-600 transition-colors">Home</Link></li>
            <li><span className="text-slate-400">/</span></li>
            <li><Link href="/member/dashboard" className="hover:text-rose-600 transition-colors">Dashboard</Link></li>
            <li><span className="text-slate-400">/</span></li>
            <li className="text-slate-900">Career Progress</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(233, 30, 140, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' }}
            >
              <Trophy className="w-8 h-8" style={{ color: accentPink }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Career Progress</h1>
              <p className="text-slate-600">Track your journey, celebrate achievements, and set goals</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              className="bg-white border border-slate-200 rounded-xl p-4"
              style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
            >
              <TrendingUp className="w-6 h-6 mb-2" style={{ color: accentPink }} />
              <h3 className="font-semibold text-slate-900 mb-1">Track Progress</h3>
              <p className="text-sm text-slate-600">Document your career journey from first job to leadership</p>
            </div>
            <div 
              className="bg-white border border-slate-200 rounded-xl p-4"
              style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
            >
              <Target className="w-6 h-6 mb-2" style={{ color: accentPurple }} />
              <h3 className="font-semibold text-slate-900 mb-1">Set Goals</h3>
              <p className="text-sm text-slate-600">Define your career aspirations and track completion</p>
            </div>
            <div 
              className="bg-white border border-slate-200 rounded-xl p-4"
              style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
            >
              <Star className="w-6 h-6 mb-2" style={{ color: accentPink }} />
              <h3 className="font-semibold text-slate-900 mb-1">Celebrate Wins</h3>
              <p className="text-sm text-slate-600">Acknowledge achievements and build confidence</p>
            </div>
          </div>
        </div>

        {/* Career Milestones Component */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentPink }} />
          </div>
        }>
          <CareerMilestones />
        </Suspense>

        {/* Additional Resources */}
        <div 
          className="mt-12 bg-white border border-slate-200 rounded-xl p-6"
          style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Career Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/career/video-resume" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-pink-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(233, 30, 140, 0.1)' }}>
                <Video className="w-5 h-5" style={{ color: accentPink }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Video Resume</div>
                <div className="text-sm text-slate-600">Record and share your introduction</div>
              </div>
            </Link>
            <Link href="/career/skills" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Star className="w-5 h-5" style={{ color: accentPurple }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Skills Verification</div>
                <div className="text-sm text-slate-600">Assessments, badges, endorsements</div>
              </div>
            </Link>
            <Link href="/career/portfolio" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-pink-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(233, 30, 140, 0.1)' }}>
                <Briefcase className="w-5 h-5" style={{ color: accentPink }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Career Portfolio</div>
                <div className="text-sm text-slate-600">Build and share project work</div>
              </div>
            </Link>
            <Link href="/career/salary" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <DollarSign className="w-5 h-5" style={{ color: accentPurple }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Salary Benchmark</div>
                <div className="text-sm text-slate-600">Compare pay and negotiate confidently</div>
              </div>
            </Link>
            <Link href="/career/progression" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-pink-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(233, 30, 140, 0.1)' }}>
                <Route className="w-5 h-5" style={{ color: accentPink }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Career Progression</div>
                <div className="text-sm text-slate-600">Timeline, goals, learning suggestions</div>
              </div>
            </Link>
            <Link href="/mentors" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Trophy className="w-5 h-5" style={{ color: accentPurple }} />
              </div>
              <div>
                <div className="font-medium text-slate-900">Find a Mentor</div>
                <div className="text-sm text-slate-600">Get guidance on your career path</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
