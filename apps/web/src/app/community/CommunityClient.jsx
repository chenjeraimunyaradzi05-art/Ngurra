'use client';

import api from '@/lib/apiClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Users, Sparkles } from 'lucide-react';

const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

/**
 * Community Forums Page - Browse discussion categories and recent topics
 * /community
 */
export default function CommunityClient({ initialCategories = [], initialTopics = [] }) {
    const hasPrefetched = initialCategories.length > 0;
    const [categories, setCategories] = useState(hasPrefetched ? initialCategories : []);
    const [recentTopics, setRecentTopics] = useState(hasPrefetched ? initialTopics : []);
    const [loading, setLoading] = useState(!hasPrefetched);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Skip fetch if we have prefetched data
        if (hasPrefetched) {
            return;
        }
        fetchCommunityData();
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

    const categoryColors = {
        blue: 'border-l-blue-400 bg-blue-50 hover:bg-blue-100',
        purple: 'border-l-purple-400 bg-purple-50 hover:bg-purple-100',
        amber: 'border-l-amber-400 bg-amber-50 hover:bg-amber-100',
        green: 'border-l-emerald-400 bg-emerald-50 hover:bg-emerald-100',
        cyan: 'border-l-cyan-400 bg-cyan-50 hover:bg-cyan-100',
        pink: 'border-l-pink-400 bg-pink-50 hover:bg-pink-100',
    };

    // Demo success stories
    const successStories = [
        {
            id: '1',
            name: 'Sarah M.',
            role: 'Now: Site Supervisor at BuildCo',
            story: 'Started as a trainee through Ngurra Pathways. The mentorship program helped me navigate the construction industry.',
            image: null,
        },
        {
            id: '2',
            name: 'James T.',
            role: 'Now: IT Support Specialist',
            story: 'The TAFE course recommendations matched perfectly with my skills. Landed my dream job within 3 months.',
            image: null,
        },
        {
            id: '3',
            name: 'Emily W.',
            role: 'Now: Business Development Manager',
            story: 'Connected with an amazing mentor who guided me through my career transition. Forever grateful!',
            image: null,
        },
    ];

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)', minHeight: '100vh' }}>
                {/* Breadcrumb skeleton */}
                <nav className="mb-6 text-sm" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 text-slate-400">
                        <li><span className="bg-slate-200 rounded w-20 h-4 inline-block animate-pulse"></span></li>
                        <li><ChevronRight className="w-4 h-4 text-slate-300" /></li>
                        <li><span className="bg-slate-200 rounded w-24 h-4 inline-block animate-pulse"></span></li>
                    </ol>
                </nav>
                <div className="mb-8">
                    <div className="h-8 bg-slate-200 rounded w-48 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded w-80 animate-pulse"></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
            {/* Decorative background halos */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 60%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 60%)', filter: 'blur(40px)' }} />
            </div>
            
            <div className="max-w-6xl mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2">
                        <li><Link href="/" className="text-slate-500 hover:text-pink-600 transition-colors">Home</Link></li>
                        <li><ChevronRight className="w-4 h-4 text-slate-400" /></li>
                        <li className="text-pink-600 font-medium">Community</li>
                    </ol>
                </nav>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2 block">Connect & Share</span>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Forums</h1>
                        <p className="text-slate-600">
                            Connect, share, and learn from the Ngurra Pathways community
                        </p>
                    </div>
                    <Link
                        href="/community/new"
                        className="px-5 py-2.5 rounded-full font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`, boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)' }}
                    >
                        + New Topic
                    </Link>
                </div>

            {/* Success Stories Highlight */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" style={{ color: accentPink }} />
                        <h2 className="text-xl font-semibold text-slate-900">Success Stories</h2>
                    </div>
                    <Link href="/community/stories" className="text-sm font-medium hover:text-pink-600 transition-colors" style={{ color: accentPink }}>
                        View All →
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {successStories.map((story) => (
                        <div key={story.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-lg transition-all" style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})` }}>
                                    {story.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{story.name}</h3>
                                    <p className="text-xs" style={{ color: accentPink }}>{story.role}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 italic">&ldquo;{story.story}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Employer Leaderboard CTA */}
            <section className="mb-12">
                <Link 
                    href="/community/leaderboard"
                    className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-pink-300 hover:shadow-lg transition-all group"
                    style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🏆</span>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-pink-600">Employer Leaderboard</h3>
                            <p className="text-slate-600 text-sm">
                                Discover top employers leading Indigenous employment and reconciliation efforts
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: accentPink }} />
                    </div>
                </Link>
            </section>

            {/* Advisory Council CTA */}
            <section className="mb-12">
                <Link 
                    href="/community/advisory"
                    className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all group"
                    style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">⚖️</span>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-purple-600">Community Advisory Council</h3>
                            <p className="text-slate-600 text-sm">
                                Meet our First Nations council members and see how they guide platform decisions
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: accentPurple }} />
                    </div>
                </Link>
            </section>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Categories Grid */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Categories</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/community/category/${category.slug || category.id}`}
                            className={`border-l-4 rounded-2xl p-4 transition-all focus:ring-2 focus:ring-pink-500 outline-none ${categoryColors[category.color] || 'border-l-slate-300 bg-white'}`}
                            style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{category.icon}</span>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1 text-slate-900">{category.name}</h3>
                                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                        {category.description}
                                    </p>
                                    <div className="flex gap-4 text-xs text-slate-400">
                                        <span>{category.topicCount} topics</span>
                                        <span>{category.postCount} posts</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Topics */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Recent Discussions</h2>
                    <Link 
                        href="/community/all"
                        className="text-sm font-medium hover:text-pink-600 transition-colors"
                        style={{ color: accentPink }}
                    >
                        View All →
                    </Link>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}>
                    {recentTopics.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No discussions yet. Be the first to start a topic!
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
            className="flex items-center gap-4 p-4 hover:bg-pink-50/50 transition-colors"
        >
            {/* Author Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #E91E8C, #8B5CF6)' }}>
                {topic.author?.charAt(0) || '?'}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {topic.isPinned && (
                        <span className="text-pink-500 text-xs">📌</span>
                    )}
                    {topic.isLocked && (
                        <span className="text-slate-400 text-xs">🔒</span>
                    )}
                    <h3 className="font-medium truncate text-slate-900">{topic.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs">
                        {topic.categoryName}
                    </span>
                    <span>by {topic.author}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="text-right text-sm text-slate-400 hidden sm:block">
                <div>{topic.replyCount} replies</div>
                <div>{topic.viewCount} views</div>
            </div>
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
