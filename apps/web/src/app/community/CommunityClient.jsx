'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  MessageCircle,
  Users,
  TrendingUp,
  Award,
  Search,
  Plus,
  ArrowRight,
  Clock,
  Eye,
  MessageSquare,
  Pin,
  Lock,
  Loader2,
} from 'lucide-react';
import api from '@/lib/apiClient';

// Theme colors
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

// Demo categories
const demoCategories = [
  {
    id: '1',
    name: 'Career Advice',
    slug: 'career-advice',
    description:
      'Tips, strategies, and support for your career journey. Resume help, interview prep, and more.',
    icon: '💼',
    color: 'blue',
    topicCount: 156,
    postCount: 892,
  },
  {
    id: '2',
    name: 'Networking',
    slug: 'networking',
    description: 'Build connections, share opportunities, and expand your professional network.',
    icon: '🤝',
    color: 'purple',
    topicCount: 89,
    postCount: 543,
  },
  {
    id: '3',
    name: 'Training & Education',
    slug: 'training-education',
    description: 'Discuss courses, certifications, and educational pathways to upskill.',
    icon: '📚',
    color: 'amber',
    topicCount: 124,
    postCount: 678,
  },
  {
    id: '4',
    name: 'Success Stories',
    slug: 'success-stories',
    description: 'Celebrate wins and inspire others with your career milestones.',
    icon: '🏆',
    color: 'green',
    topicCount: 67,
    postCount: 312,
  },
  {
    id: '5',
    name: 'Business & Entrepreneurship',
    slug: 'business-entrepreneurship',
    description: 'For Indigenous business owners and aspiring entrepreneurs.',
    icon: '🚀',
    color: 'cyan',
    topicCount: 98,
    postCount: 456,
  },
  {
    id: '6',
    name: 'Culture & Identity',
    slug: 'culture-identity',
    description: 'Discuss cultural heritage, identity in the workplace, and community.',
    icon: '🌿',
    color: 'pink',
    topicCount: 134,
    postCount: 721,
  },
];

// Demo recent topics
const demoRecentTopics = [
  {
    id: '1',
    title: 'How I landed my first tech job without a degree',
    author: 'Sarah M.',
    authorAvatar: '👩🏽',
    categoryName: 'Success Stories',
    categorySlug: 'success-stories',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replyCount: 23,
    viewCount: 456,
    isPinned: true,
    isLocked: false,
    lastReply: { author: 'James K.', time: '15 min ago' },
  },
  {
    id: '2',
    title: 'Best resume tips for career changers?',
    author: 'David W.',
    authorAvatar: '👨🏾',
    categoryName: 'Career Advice',
    categorySlug: 'career-advice',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    replyCount: 15,
    viewCount: 234,
    isPinned: false,
    isLocked: false,
    lastReply: { author: 'Emma L.', time: '1 hour ago' },
  },
  {
    id: '3',
    title: 'Indigenous Business Network - Monthly Meetup Thread',
    author: 'Community Team',
    authorAvatar: '🌟',
    categoryName: 'Networking',
    categorySlug: 'networking',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    replyCount: 45,
    viewCount: 789,
    isPinned: true,
    isLocked: false,
    lastReply: { author: 'Michael C.', time: '3 hours ago' },
  },
  {
    id: '4',
    title: 'Free TAFE courses for First Nations people - Updated 2025 list',
    author: 'Education Hub',
    authorAvatar: '📚',
    categoryName: 'Training & Education',
    categorySlug: 'training-education',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replyCount: 32,
    viewCount: 1234,
    isPinned: false,
    isLocked: false,
    lastReply: { author: 'Lisa P.', time: '5 hours ago' },
  },
  {
    id: '5',
    title: 'Starting my own catering business - need advice!',
    author: 'Rachel T.',
    authorAvatar: '👩🏽',
    categoryName: 'Business & Entrepreneurship',
    categorySlug: 'business-entrepreneurship',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replyCount: 18,
    viewCount: 345,
    isPinned: false,
    isLocked: false,
    lastReply: { author: 'Tom B.', time: '8 hours ago' },
  },
];

// Demo success stories
const successStories = [
  {
    id: '1',
    name: 'Sarah M.',
    role: 'Now: Site Supervisor at BuildCo',
    story:
      'Started as a trainee through Ngurra Pathways. The mentorship program helped me navigate the construction industry.',
    avatar: '👩🏽',
  },
  {
    id: '2',
    name: 'James T.',
    role: 'Now: IT Support Specialist',
    story:
      'The TAFE course recommendations matched perfectly with my skills. Landed my dream job within 3 months.',
    avatar: '👨🏿',
  },
  {
    id: '3',
    name: 'Emily W.',
    role: 'Now: Business Development Manager',
    story:
      'Connected with an amazing mentor who guided me through my career transition. Forever grateful!',
    avatar: '👩🏼',
  },
];

export default function CommunityClient({ initialCategories, initialRecentTopics, hasPrefetched }) {
  const [categories, setCategories] = useState(hasPrefetched ? initialCategories : demoCategories);
  const [recentTopics, setRecentTopics] = useState(
    hasPrefetched ? initialRecentTopics : demoRecentTopics,
  );
  const [loading, setLoading] = useState(!hasPrefetched);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCommunityData = useCallback(async () => {
    try {
      const [catRes, topicsRes] = await Promise.all([
        api('/community/categories'),
        api('/community/topics/recent?limit=5'),
      ]);

      if (catRes.ok && catRes.data?.categories?.length > 0) {
        setCategories(catRes.data.categories);
      }
      if (topicsRes.ok && topicsRes.data?.topics?.length > 0) {
        setRecentTopics(topicsRes.data.topics);
      }
    } catch (err) {
      console.error('Error fetching community data:', err);
      setError('Unable to load community data. Showing demo content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPrefetched) {
      fetchCommunityData();
    }
  }, [hasPrefetched, fetchCommunityData]);

  const categoryColors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'text-blue-600',
      hover: 'hover:bg-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      accent: 'text-purple-600',
      hover: 'hover:bg-purple-100',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      accent: 'text-amber-600',
      hover: 'hover:bg-amber-100',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      accent: 'text-emerald-600',
      hover: 'hover:bg-emerald-100',
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      accent: 'text-cyan-600',
      hover: 'hover:bg-cyan-100',
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      accent: 'text-pink-600',
      hover: 'hover:bg-pink-100',
    },
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  const filteredTopics = recentTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #FFF5FB 0%, #FAFAFF 100%)' }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: accentPink }} />
          <p className="text-slate-600 font-medium">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #FFF5FB 0%, #FAFAFF 100%)' }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${accentPink}30, transparent 70%)`,
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${accentPurple}30, transparent 70%)`,
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-slate-500 hover:text-pink-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-pink-600 font-medium">Community</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/25">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-600 border border-pink-200">
                  Community Forums
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                Connect & Share
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Join conversations, share experiences, and learn from the Ngurra Pathways community.
                Your voice matters here.
              </p>
            </div>

            <Link
              href="/community/new"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-xl hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                boxShadow: '0 8px 20px rgba(233, 30, 140, 0.25)',
              }}
            >
              <Plus className="w-5 h-5" />
              Start New Topic
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <p className="text-amber-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Stories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Success Stories</h2>
            </div>
            <Link
              href="/community/stories"
              className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-pink-200 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${accentPink}15, ${accentPurple}15)`,
                    }}
                  >
                    {story.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{story.name}</h3>
                    <p className="text-sm text-pink-600 font-medium">{story.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  &ldquo;{story.story}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <Link
            href="/community/leaderboard"
            className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl hover:border-pink-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🏆</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                  Employer Leaderboard
                </h3>
                <p className="text-slate-500 text-sm">
                  Discover top employers leading Indigenous employment initiatives
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/community/advisory"
            className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl hover:border-purple-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">⚖️</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Community Advisory Council
                </h3>
                <p className="text-slate-500 text-sm">
                  Meet our First Nations council members guiding platform decisions
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Categories Grid */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const colorClass = categoryColors[category.color] || categoryColors.blue;
              return (
                <Link
                  key={category.id}
                  href={`/community/category/${category.slug || category.id}`}
                  className={`group rounded-2xl p-5 border-2 transition-all duration-300 ${colorClass.bg} ${colorClass.border} ${colorClass.hover}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-pink-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className={colorClass.accent}>{category.topicCount} topics</span>
                        <span className="text-slate-400">{category.postCount} posts</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Discussions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Recent Discussions</h2>
            </div>
            <Link
              href="/community/all"
              className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
            {filteredTopics.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No discussions found</h3>
                <p className="text-slate-500 mb-6">Be the first to start a conversation!</p>
                <Link
                  href="/community/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Start New Topic
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/community/topic/${topic.id}`}
                    className="flex items-center gap-4 p-5 hover:bg-pink-50/50 transition-colors group"
                  >
                    {/* Author Avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${accentPink}15, ${accentPurple}15)`,
                      }}
                    >
                      {topic.authorAvatar || topic.author?.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.isPinned && <Pin className="w-4 h-4 text-pink-500" />}
                        {topic.isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-pink-600 transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                          {topic.categoryName}
                        </span>
                        <span className="flex items-center gap-1">
                          by <span className="font-medium text-slate-700">{topic.author}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getTimeAgo(topic.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{topic.replyCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{topic.viewCount}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-16">
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Have something to share?
                </h3>
                <p className="text-white/80 text-lg">
                  Your experiences and insights can help others on their journey.
                </p>
              </div>
              <Link
                href="/community/new"
                className="flex items-center gap-2 px-8 py-4 bg-white rounded-xl font-bold text-pink-600 hover:bg-pink-50 transition-colors shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Start Discussion
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
