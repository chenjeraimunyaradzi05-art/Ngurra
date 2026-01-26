'use client';

import api from '@/lib/apiClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  BookOpen,
  Heart,
  ArrowRight,
  Plus,
} from 'lucide-react';

/**
 * Community Forums Page - Browse discussion categories and recent topics
 * /community
 */
export default function CommunityClient({ initialCategories = [], initialTopics = [] }) {
  const hasPrefetched = initialCategories.length > 0;
  const [categories, setCategories] = useState(hasPrefetched ? initialCategories : []);
  const [recentTopics, setRecentTopics] = useState(hasPrefetched ? initialTopics : []);
  const [loading, setLoading] = useState(!hasPrefetched);

  useEffect(() => {
    // Skip fetch if we have prefetched data
    if (hasPrefetched) {
      return;
    }
    fetchCommunityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCommunityData() {
    setLoading(true);
    try {
      const [catRes, topicsRes] = await Promise.all([
        api('/community/categories'),
        api('/community/topics/recent'),
      ]);

      if (catRes.ok) {
        const catData = catRes.data;
        setCategories(catData?.categories || catData);
      }
      if (topicsRes.ok) {
        const topicsData = topicsRes.data;
        setRecentTopics(topicsData?.topics || topicsData);
      }
    } catch (err) {
      // Demo data
      setCategories([
        {
          id: 'career-advice',
          name: 'Career Advice',
          description: 'Get guidance on career paths, job searching, and professional development',
          icon: '💼',
          topicCount: 156,
          postCount: 1240,
          color: 'blue',
        },
        {
          id: 'industry-insights',
          name: 'Industry Insights',
          description: 'Discussions about different industries and job markets',
          icon: '📊',
          topicCount: 89,
          postCount: 567,
          color: 'purple',
        },
        {
          id: 'cultural-connection',
          name: 'Cultural Connection',
          description: 'Celebrate and share Indigenous culture in the workplace',
          icon: '🔸',
          topicCount: 234,
          postCount: 1890,
          color: 'amber',
        },
        {
          id: 'success-stories',
          name: 'Success Stories',
          description: 'Share your journey and celebrate community achievements',
          icon: '🌟',
          topicCount: 67,
          postCount: 412,
          color: 'green',
        },
        {
          id: 'training-education',
          name: 'Training & Education',
          description: 'Discuss courses, certifications, and learning resources',
          icon: '📚',
          topicCount: 112,
          postCount: 789,
          color: 'cyan',
        },
        {
          id: 'mentorship',
          name: 'Mentorship',
          description: 'Connect with mentors and share mentoring experiences',
          icon: '🤝',
          topicCount: 78,
          postCount: 534,
          color: 'pink',
        },
      ]);
      setRecentTopics([
        {
          id: '1',
          title: 'Tips for navigating corporate workplaces as a First Nations person',
          category: 'career-advice',
          categoryName: 'Career Advice',
          author: 'Sarah M.',
          authorAvatar: null,
          createdAt: '2025-01-22T10:30:00Z',
          replyCount: 23,
          viewCount: 456,
          isLocked: false,
          isPinned: true,
        },
        {
          id: '2',
          title: 'Mining industry opportunities in WA - 2025 outlook',
          category: 'industry-insights',
          categoryName: 'Industry Insights',
          author: 'Dave K.',
          authorAvatar: null,
          createdAt: '2025-01-21T15:45:00Z',
          replyCount: 15,
          viewCount: 289,
          isLocked: false,
          isPinned: false,
        },
        {
          id: '3',
          title: 'Celebrating NAIDOC Week at work - share your experiences!',
          category: 'cultural-connection',
          categoryName: 'Cultural Connection',
          author: 'Emily T.',
          authorAvatar: null,
          createdAt: '2025-01-20T09:00:00Z',
          replyCount: 45,
          viewCount: 892,
          isLocked: false,
          isPinned: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Demo success stories
  const successStories = [
    {
      id: '1',
      name: 'Sarah M.',
      role: 'Now: Site Supervisor at BuildCo',
      story:
        'Started as a trainee through Ngurra Pathways. The mentorship program helped me navigate the construction industry.',
      image: null,
    },
    {
      id: '2',
      name: 'James T.',
      role: 'Now: IT Support Specialist',
      story:
        'The TAFE course recommendations matched perfectly with my skills. Landed my dream job within 3 months.',
      image: null,
    },
    {
      id: '3',
      name: 'Emily W.',
      role: 'Now: Business Development Manager',
      story:
        'Connected with an amazing mentor who guided me through my career transition. Forever grateful!',
      image: null,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-overlay filter blur-xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
            <Link href="/" className="text-indigo-200 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-indigo-300" />
            <span className="text-white font-medium">Community</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6">
                <Heart className="w-4 h-4" />
                <span>Connect & Share</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Community Forums</h1>
              <p className="text-xl text-indigo-100">
                Connect, share experiences, and grow with the Ngurra Pathways community. Learn from
                each other&apos;s journeys.
              </p>
            </div>

            <Link
              href="/community/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Start New Topic
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">5,200+</div>
              <div className="text-sm text-indigo-200">Active Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">1,240+</div>
              <div className="text-sm text-indigo-200">Discussions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">8,500+</div>
              <div className="text-sm text-indigo-200">Helpful Replies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">156</div>
              <div className="text-sm text-indigo-200">Success Stories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Success Stories Section */}
        <section className="mb-12 -mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Success Stories</h2>
            </div>
            <Link
              href="/community/stories"
              className="flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-500 ring-4 ring-indigo-100">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{story.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{story.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">&ldquo;{story.story}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Employer Leaderboard */}
          <Link
            href="/community/leaderboard"
            className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-900 mb-2 group-hover:text-emerald-700">
                  Employer Leaderboard
                </h3>
                <p className="text-emerald-700 text-sm mb-4">
                  Discover top employers leading Indigenous employment and reconciliation efforts
                </p>
                <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Rankings <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Advisory Council */}
          <Link
            href="/community/advisory"
            className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚖️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-purple-900 mb-2 group-hover:text-purple-700">
                  Community Advisory Council
                </h3>
                <p className="text-purple-700 text-sm mb-4">
                  Meet our First Nations council members and see how they guide platform decisions
                </p>
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Categories Grid */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Browse Categories</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/community/category/${category.slug || category.id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {category.topicCount} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {category.postCount} posts
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Discussions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Recent Discussions</h2>
            </div>
            <Link
              href="/community/all"
              className="flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {recentTopics.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No discussions yet</h3>
                <p className="text-slate-500 mb-4">Be the first to start a conversation!</p>
                <Link
                  href="/community/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Start New Topic
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTopics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TopicRow({ topic }) {
  const timeAgo = getTimeAgo(topic.createdAt);

  return (
    <Link
      href={`/community/topic/${topic.id}`}
      className="group flex items-center gap-4 p-5 hover:bg-indigo-50/50 transition-colors"
    >
      {/* Author Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-indigo-100">
        {topic.author?.charAt(0) || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {topic.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              📌 Pinned
            </span>
          )}
          {topic.isLocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
              🔒 Locked
            </span>
          )}
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {topic.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {topic.categoryName}
          </span>
          <span className="text-slate-400">
            by <span className="text-slate-600">{topic.author}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">{timeAgo}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium text-slate-700">{topic.replyCount} replies</div>
        <div className="text-xs text-slate-400">{topic.viewCount} views</div>
      </div>

      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all hidden md:block" />
    </Link>
  );
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}
