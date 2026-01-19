import { API_BASE } from '@/lib/apiBase';
import MentorshipClient from './MentorshipClient';

// SEO Metadata for Mentorship Page
export const metadata = {
  title: 'Indigenous Mentorship Program',
  description: 'Connect with experienced First Nations mentors for career guidance. Our culturally-safe mentorship program supports Indigenous professionals at all career stages.',
  keywords: ['Indigenous mentorship', 'First Nations mentors', 'Aboriginal career guidance', 'Indigenous professional development'],
  openGraph: {
    title: 'Indigenous Mentorship Program | Ngurra Pathways',
    description: 'Connect with experienced First Nations mentors for career guidance.',
    url: 'https://ngurrapathways.com.au/mentorship',
  },
  alternates: {
    canonical: '/mentorship',
  },
};

// Seed mentors shown when API is unavailable
const SEED_MENTORS = [
    {
        id: '1',
        name: 'Aunty Donna Meehan',
        avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop',
        title: 'Senior Executive | Dharawal Nation',
        expertise: ['Leadership', 'Corporate Strategy', 'Cultural Governance'],
        industry: 'Corporate',
        location: 'Sydney, NSW',
        rating: 4.9,
        reviews: 47,
        sessions: 156,
        bio: 'Former CEO of Indigenous Business Australia with 25+ years experience.',
        availability: ['Mon', 'Wed', 'Fri'],
        languages: ['English', 'Dharawal'],
        price: 'Free',
        verified: true
    },
    {
        id: '2',
        name: 'Jarrah Williams',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        title: 'Software Engineer @ Atlassian | Yawuru',
        expertise: ['Software Development', 'Tech Careers', 'Resume Building'],
        industry: 'Technology',
        location: 'Melbourne, VIC',
        rating: 4.8,
        reviews: 32,
        sessions: 89,
        bio: 'From remote Kimberley community to Big Tech.',
        availability: ['Tue', 'Thu', 'Sat'],
        languages: ['English'],
        price: 'Free',
        verified: true
    },
    {
        id: '3',
        name: 'Dr. Chelsea Bond',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        title: 'Associate Professor @ UQ | Munanjahli & Yugambeh',
        expertise: ['Academia', 'Research', 'PhD Supervision', 'Health'],
        industry: 'Education',
        location: 'Brisbane, QLD',
        rating: 5.0,
        reviews: 58,
        sessions: 234,
        bio: 'Supervised 20+ PhD students, 15 First Nations scholars.',
        availability: ['Mon', 'Tue', 'Wed'],
        languages: ['English'],
        price: 'Free',
        verified: true
    },
    {
        id: '4',
        name: 'Marcus Gooda',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        title: 'Mining Operations Manager | Pitjantjatjara',
        expertise: ['Mining', 'FIFO Lifestyle', 'Heavy Equipment', 'Safety'],
        industry: 'Resources',
        location: 'Perth, WA',
        rating: 4.7,
        reviews: 29,
        sessions: 67,
        bio: '15 years in mining operations.',
        availability: ['Wed', 'Sat', 'Sun'],
        languages: ['English', 'Pitjantjatjara'],
        price: 'Free',
        verified: true
    },
    {
        id: '5',
        name: 'Tanya Day',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        title: 'Registered Nurse & Midwife | Yorta Yorta',
        expertise: ['Nursing', 'Midwifery', 'Healthcare Careers', 'TAFE Pathways'],
        industry: 'Healthcare',
        location: 'Adelaide, SA',
        rating: 4.9,
        reviews: 41,
        sessions: 112,
        bio: 'Helping aspiring nurses and healthcare workers.',
        availability: ['Mon', 'Thu', 'Fri'],
        languages: ['English'],
        price: 'Free',
        verified: true
    },
    {
        id: '6',
        name: 'Dean Parkin',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        title: 'Entrepreneur & Business Coach | Quandamooka',
        expertise: ['Entrepreneurship', 'Business Development', 'Funding', 'Grants'],
        industry: 'Business',
        location: 'Gold Coast, QLD',
        rating: 4.8,
        reviews: 36,
        sessions: 98,
        bio: 'Founded 3 successful businesses.',
        availability: ['Tue', 'Wed', 'Thu'],
        languages: ['English'],
        price: 'Free',
        verified: true
    }
];

/**
 * Mentorship Landing Page (Server Component)
 * Pre-fetches featured mentors at request time for fast first paint.
 */
export default async function MentorshipPage() {
    let initialMentors = [];

    try {
        // Use 127.0.0.1 to avoid Windows IPv6 localhost issues
        const serverApiBase = String(API_BASE || '')
            .replace('http://localhost', 'http://127.0.0.1')
            .replace('https://localhost', 'https://127.0.0.1');

        const res = await fetch(`${serverApiBase}/mentorship/top-mentors?limit=6`, {
            cache: 'no-store',
        });

        if (res.ok) {
            const data = await res.json();
            if (data.mentors && data.mentors.length > 0) {
                initialMentors = data.mentors.map((m) => ({
                    id: m.id,
                    name: m.name || 'Mentor',
                    avatar: m.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
                    title: m.title || m.expertise || 'Professional Mentor',
                    expertise: Array.isArray(m.expertise) ? m.expertise : m.expertise ? [m.expertise] : ['Mentorship'],
                    industry: m.industry || 'Business',
                    location: m.location || 'Australia',
                    rating: parseFloat(m.rating) || 4.5,
                    reviews: m.reviews || m.sessionCount || 0,
                    sessions: m.sessionCount || 0,
                    bio: m.bio || 'Experienced mentor ready to help.',
                    availability: m.availability || ['Mon', 'Wed', 'Fri'],
                    languages: m.languages || ['English'],
                    price: m.price || 'Free',
                    verified: m.verified !== undefined ? m.verified : true,
                }));
            }
        }
    } catch {
        // Fallback to seed mentors on any error
    }

    // Use seed mentors if API returned nothing
    if (initialMentors.length === 0) {
        initialMentors = SEED_MENTORS;
    }

    return <MentorshipClient initialMentors={initialMentors} />;
}
