import { API_BASE } from '@/lib/apiBase';
import CommunityClient from './CommunityClient';

// SEO Metadata for Community Page
export const metadata = {
  title: 'Indigenous Community Forums',
  description: 'Join the Ngurra Pathways community. Connect with other First Nations professionals, share experiences, and support each other on your career journey.',
  keywords: ['Indigenous community', 'First Nations forums', 'Aboriginal networking', 'Indigenous professionals'],
  openGraph: {
    title: 'Indigenous Community Forums | Ngurra Pathways',
    description: 'Join the Ngurra Pathways community and connect with First Nations professionals.',
    url: 'https://ngurrapathways.com.au/community',
  },
  alternates: {
    canonical: '/community',
  },
};

// Demo categories
const DEMO_CATEGORIES = [
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
];

// Demo recent topics
const DEMO_TOPICS = [
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
];

/**
 * Community Page (Server Component)
 * Pre-fetches forum categories and topics at request time for fast first paint.
 */
export default async function CommunityPage() {
    let initialCategories = [];
    let initialTopics = [];

    try {
        // Use 127.0.0.1 to avoid Windows IPv6 localhost issues
        const serverApiBase = String(API_BASE || '')
            .replace('http://localhost', 'http://127.0.0.1')
            .replace('https://localhost', 'https://127.0.0.1');

        const [catRes, topicsRes] = await Promise.all([
            fetch(`${serverApiBase}/community/categories`, { cache: 'no-store' }).catch(() => null),
            fetch(`${serverApiBase}/community/topics/recent`, { cache: 'no-store' }).catch(() => null),
        ]);

        if (catRes?.ok) {
            const catData = await catRes.json();
            const cats = catData?.categories || catData || [];
            if (cats.length > 0) {
                initialCategories = cats;
            }
        }

        if (topicsRes?.ok) {
            const topicsData = await topicsRes.json();
            const topics = topicsData?.topics || topicsData || [];
            if (topics.length > 0) {
                initialTopics = topics;
            }
        }
    } catch {
        // Fallback to demo data on any error
    }

    // Use demo data if API returned nothing
    if (initialCategories.length === 0) {
        initialCategories = DEMO_CATEGORIES;
    }
    if (initialTopics.length === 0) {
        initialTopics = DEMO_TOPICS;
    }

    return <CommunityClient initialCategories={initialCategories} initialTopics={initialTopics} />;
}
