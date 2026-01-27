'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  Search,
  Users,
  Star,
  MapPin,
  Award,
  ArrowRight,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Filter,
  X,
} from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Platform theme colors - consistent with globals.css
const colors = {
  primary: '#21808D', // teal-500
  primaryHover: '#1D7480', // teal-600
  primaryLight: 'rgba(33, 128, 141, 0.08)',
  gold: '#D4AF37',
  goldLight: 'rgba(212, 175, 55, 0.1)',
  emerald: '#10B981',
  amber: '#F59E0B',
  slate: '#64748B',
  text: '#13343B', // slate-900
  textSecondary: '#626C71', // slate-500
};

// Helper to check if URL is a Cloudinary public ID
function isCloudinaryPublicId(url) {
  if (!url) return false;
  return !url.startsWith('http') && !url.startsWith('/');
}

// Categories with platform-aligned styling
const categories = [
  { id: 'all', label: 'All Mentors', icon: '✨', color: colors.primary },
  { id: 'Technology', label: 'Technology', icon: '💻', color: '#6366F1' },
  { id: 'Business', label: 'Business', icon: '💼', color: '#8B5CF6' },
  { id: 'Healthcare', label: 'Healthcare', icon: '🏥', color: '#EC4899' },
  { id: 'Education', label: 'Education', icon: '🎓', color: '#F59E0B' },
  { id: 'Trades', label: 'Trades', icon: '🔧', color: '#EF4444' },
  { id: 'Creative', label: 'Creative', icon: '🎨', color: '#14B8A6' },
  { id: 'Government', label: 'Government', icon: '🏛️', color: '#6B7280' },
];

// Seed mentors
const seedMentors = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    title: 'Senior Software Engineer',
    expertise: ['Software Development', 'Career Transitions', 'Tech Leadership'],
    industry: 'Technology',
    location: 'Sydney, NSW',
    rating: 4.9,
    reviews: 47,
    sessions: 156,
    bio: 'Helping First Nations people break into tech for over 10 years. Passionate about mentoring the next generation of Indigenous tech leaders.',
    availability: ['Mon', 'Wed', 'Fri'],
    languages: ['English', 'Wiradjuri'],
    price: 'Free',
    verified: true,
  },
  {
    id: '2',
    name: 'James Kamilaroi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    title: 'Business Development Manager',
    expertise: ['Indigenous Business', 'Networking', 'Sales'],
    industry: 'Business',
    location: 'Melbourne, VIC',
    rating: 4.8,
    reviews: 35,
    sessions: 89,
    bio: 'Founder of two successful Indigenous businesses. Happy to share my journey and help you navigate the business world.',
    availability: ['Tue', 'Thu'],
    languages: ['English'],
    price: 'Free',
    verified: true,
  },
  {
    id: '3',
    name: 'Dr. Emily Noongar',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    title: 'Healthcare Administrator',
    expertise: ['Healthcare Careers', 'Leadership', 'Policy'],
    industry: 'Healthcare',
    location: 'Perth, WA',
    rating: 5.0,
    reviews: 28,
    sessions: 67,
    bio: 'Working to increase Indigenous representation in healthcare leadership. Let me help you find your path in health services.',
    availability: ['Mon', 'Wed', 'Sat'],
    languages: ['English', 'Noongar'],
    price: 'Free',
    verified: true,
  },
  {
    id: '4',
    name: 'David Murri',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    title: 'Construction Project Manager',
    expertise: ['Construction', 'Trades', 'Project Management'],
    industry: 'Trades',
    location: 'Brisbane, QLD',
    rating: 4.7,
    reviews: 42,
    sessions: 134,
    bio: 'Started as an apprentice, now managing million-dollar projects. Keen to help others climb the ladder in construction.',
    availability: ['Wed', 'Fri', 'Sun'],
    languages: ['English'],
    price: 'Free',
    verified: true,
  },
  {
    id: '5',
    name: 'Lisa Bundjalung',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    title: 'Creative Director',
    expertise: ['Design', 'Branding', 'Creative Careers'],
    industry: 'Creative',
    location: 'Sydney, NSW',
    rating: 4.9,
    reviews: 31,
    sessions: 78,
    bio: 'Award-winning designer blending contemporary design with Indigenous storytelling. Mentoring creatives to find their unique voice.',
    availability: ['Tue', 'Thu', 'Sat'],
    languages: ['English', 'Bundjalung'],
    price: 'Free',
    verified: true,
  },
  {
    id: '6',
    name: 'Michael Yolngu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    title: 'Education Policy Advisor',
    expertise: ['Education', 'Policy', 'Indigenous Rights'],
    industry: 'Government',
    location: 'Darwin, NT',
    rating: 4.8,
    reviews: 23,
    sessions: 56,
    bio: 'Working at the intersection of education policy and Indigenous community needs. Happy to guide you through government careers.',
    availability: ['Mon', 'Thu'],
    languages: ['English', 'Yolngu Matha'],
    price: 'Free',
    verified: true,
  },
];

// Upcoming circles
const upcomingCircles = [
  {
    id: '1',
    title: 'Breaking into Tech',
    mentor: 'James Kamilaroi',
    mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
    date: 'Thu, 30 Jan',
    time: '5:00 PM AEDT',
    spots: 4,
    total: 12,
  },
  {
    id: '2',
    title: 'Indigenous Business 101',
    mentor: 'David Murri',
    mentorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop',
    date: 'Mon, 3 Feb',
    time: '6:00 PM AEDT',
    spots: 6,
    total: 15,
  },
  {
    id: '3',
    title: 'Healthcare Career Paths',
    mentor: 'Dr. Emily Noongar',
    mentorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop',
    date: 'Sat, 1 Feb',
    time: '10:00 AM AEDT',
    spots: 3,
    total: 10,
  },
];

// Image component wrapper
function Image({ src, alt, width, height, className, cloudinary, sizes }) {
  if (cloudinary) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
      />
    );
  }
  return <img src={src} alt={alt} width={width} height={height} className={className} />;
}

export default function MentorshipClient({ initialMentors, hasPrefetched }) {
  const [featuredMentors, setFeaturedMentors] = useState(
    hasPrefetched ? initialMentors : seedMentors,
  );
  const [loading, setLoading] = useState(!hasPrefetched);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingData, setBookingData] = useState({ date: '', time: '', message: '' });

  const defaultAvatar =
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop';

  useEffect(() => {
    if (hasPrefetched) return;
    fetchFeaturedMentors();
  }, [hasPrefetched]);

  async function fetchFeaturedMentors() {
    try {
      const res = await fetch(`${API_URL}/mentorship/top-mentors?limit=6`);
      if (res.ok) {
        const data = await res.json();
        if (data.mentors && data.mentors.length > 0) {
          const normalizedMentors = data.mentors.map((m) => ({
            id: m.id,
            name: m.name || 'Mentor',
            avatar: m.avatar || defaultAvatar,
            title: m.title || m.expertise || 'Professional Mentor',
            expertise: Array.isArray(m.expertise)
              ? m.expertise
              : m.expertise
                ? [m.expertise]
                : ['Mentorship'],
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
          setFeaturedMentors(normalizedMentors);
        }
      }
    } catch (err) {
      console.error('Failed to fetch featured mentors:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMentors = featuredMentors.filter((mentor) => {
    const matchesCategory = activeCategory === 'all' || mentor.industry === activeCategory;
    const matchesSearch =
      !searchQuery ||
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setBookingStep(1);
  };

  const handleConfirmBooking = () => {
    setBookingStep(3);
    setTimeout(() => {
      setSelectedMentor(null);
      setBookingStep(0);
      setBookingData({ date: '', time: '', message: '' });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full animate-spin border-4 border-transparent border-t-[#21808D]"
              style={{ animationDuration: '1s' }}
            />
            <div
              className="absolute inset-2 rounded-full animate-spin border-4 border-transparent border-t-[#D4AF37]"
              style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#21808D]" />
            </div>
          </div>
          <p className="text-[var(--color-text-secondary)] font-medium">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${colors.primaryLight}, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${colors.goldLight}, transparent 70%)` }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-primary)] font-medium">Mentorship</span>
          </nav>

          {/* Hero Content */}
          <div className="max-w-4xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-4 bg-[var(--color-secondary)] border border-[var(--color-border)]">
              <Heart className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-[var(--color-text)] font-medium">
                First Nations Mentorship Program
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-4 leading-tight">
              Connect with Mentors Who{' '}
              <span className="text-[var(--color-primary)]">Understand Your Journey</span>
            </h1>

            <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl leading-relaxed">
              Get guidance from experienced First Nations professionals who share your background
              and can help you navigate your career path with cultural understanding.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">150+</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Active Mentors</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">2,500+</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Sessions Completed
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">4.9★</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Average Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">85%</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Career Advancement
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search by name, expertise, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus-ring)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] transition-all"
                />
              </div>
              <button
                onClick={() => {}}
                className="px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* How It Works */}
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-card-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                  How It Works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text)] text-sm">
                        Find Your Mentor
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Browse by industry & expertise
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text)] text-sm">
                        Book a Session
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Schedule 45-60min video calls
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text)] text-sm">
                        Grow Together
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Build lasting relationships
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Become a Mentor CTA */}
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#1a6b76] rounded-2xl p-5 text-white">
                <Heart className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Share Your Experience</h3>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">
                  Help the next generation of Indigenous professionals by becoming a mentor.
                </p>
                <Link
                  href="/mentor/signup"
                  className="block text-center py-2.5 rounded-xl text-sm font-bold bg-white text-[var(--color-primary)] hover:bg-white/90 transition-colors"
                >
                  Become a Mentor
                </Link>
              </div>

              {/* Success Story */}
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-card-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-bold text-[var(--color-text)]">Success Story</span>
                </div>
                <blockquote className="text-sm italic text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                  &quot;My mentor James helped me land my first tech job. From remote community to
                  software engineer in 18 months!&quot;
                </blockquote>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#D4AF37]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">Kirra M.</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      Software Engineer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6 order-1 lg:order-2">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {activeCategory === 'all' ? 'Featured Mentors' : `${activeCategory} Mentors`}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="space-y-4">
              {filteredMentors.map((mentor) => (
                <article
                  key={mentor.id}
                  className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-card-border)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Image
                        src={mentor.avatar || defaultAvatar}
                        alt={mentor.name || 'Mentor'}
                        width={80}
                        height={80}
                        cloudinary={isCloudinaryPublicId(mentor.avatar)}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-[var(--color-card-border)] group-hover:border-[var(--color-primary)] transition-colors"
                        sizes="80px"
                      />
                      {mentor.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-[var(--color-text)] text-lg truncate">
                          {mentor.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-[var(--color-text)]">
                            {mentor.rating}
                          </span>
                          <span className="text-[var(--color-text-secondary)]">
                            ({mentor.reviews})
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] mb-2 truncate">
                        {mentor.title}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {mentor.expertise?.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-secondary)] text-[var(--color-text)] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                        {mentor.bio}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-card-border-inner)]">
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {mentor.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            {mentor.sessions} sessions
                          </span>
                          <span className="text-emerald-600 font-semibold">{mentor.price}</span>
                        </div>
                        <button
                          onClick={() => handleBookSession(mentor)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {filteredMentors.length === 0 && (
                <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-card-border)]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-secondary)] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[var(--color-text-secondary)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">No mentors found</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* View All Link */}
            {filteredMentors.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/mentorship/browse"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-[var(--color-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary-hover)] border border-[var(--color-border)]"
                >
                  View All 150+ Mentors
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Group Mentorship Circles */}
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-card-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-primary)]" />
                  Group Mentorship Circles
                </h3>
                <div className="space-y-3">
                  {upcomingCircles.map((circle) => (
                    <div
                      key={circle.id}
                      className="p-4 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-card-border-inner)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <img
                          src={circle.mentorAvatar}
                          alt={circle.mentor}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--color-text)] text-sm truncate">
                            {circle.title}
                          </h4>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            with {circle.mentor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {circle.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {circle.time}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
                          {circle.spots} spots
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/mentorship/circles"
                  className="block mt-4 text-center py-2.5 rounded-xl text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-colors"
                >
                  View All Circles →
                </Link>
              </div>

              {/* CareerTrackers Sponsor */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold uppercase dark:bg-emerald-900/50 dark:text-emerald-400">
                    Sponsored
                  </span>
                </div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  CareerTrackers Program
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4 leading-relaxed">
                  Paid internships with Australia&apos;s top companies. Mentorship included.
                  Applications now open for 2025.
                </p>
                <Link
                  href="/partners/careertrackers"
                  className="block text-center py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-card-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                  This Month
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-[var(--color-secondary)]">
                    <div className="text-2xl font-bold text-[var(--color-primary)]">127</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      Sessions Booked
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[var(--color-secondary)]">
                    <div className="text-2xl font-bold text-[#D4AF37]">23</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">New Mentors</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setSelectedMentor(null);
            setBookingStep(0);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {bookingStep === 1 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src={selectedMentor.avatar || defaultAvatar}
                      alt={selectedMentor.name || 'Mentor'}
                      width={56}
                      height={56}
                      cloudinary={isCloudinaryPublicId(selectedMentor.avatar)}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-[var(--color-card-border)]"
                    />
                    <div>
                      <h3 className="font-bold text-[var(--color-text)]">{selectedMentor.name}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {selectedMentor.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMentor(null);
                      setBookingStep(0);
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--color-secondary)] text-[var(--color-text-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h4 className="font-bold text-[var(--color-text)] mb-4">Book a Session</h4>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      Preferred Time
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      What would you like to discuss?
                    </label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      rows={3}
                      placeholder="Introduce yourself and share your goals..."
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMentor(null);
                      setBookingStep(0);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <h4 className="font-bold text-[var(--color-text)] mb-6">Confirm Booking</h4>
                <div className="rounded-xl p-5 mb-6 bg-[var(--color-secondary)] border border-[var(--color-card-border)]">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Mentor</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {selectedMentor.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Date</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {new Date(bookingData.date).toLocaleDateString('en-AU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Time</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {bookingData.time}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[var(--color-card-border-inner)]">
                      <span className="text-[var(--color-text-secondary)]">Price</span>
                      <span className="font-bold text-emerald-600">Free</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-bold text-xl mb-2 text-emerald-600">Booking Confirmed!</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  You&apos;ll receive a confirmation email with the meeting link shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          className="relative overflow-hidden rounded-2xl p-8 md:p-12"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, #1a6b76 50%, #D4AF37 100%)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Give Back?
              </h3>
              <p className="text-white/90 text-lg max-w-lg">
                Share your experience and help guide the next generation of Indigenous professionals
                on their career journey.
              </p>
            </div>
            <Link
              href="/mentor/signup"
              className="flex items-center gap-2 px-8 py-4 bg-white rounded-xl font-bold text-[var(--color-primary)] hover:bg-white/90 transition-colors shadow-lg whitespace-nowrap"
            >
              <Heart className="w-5 h-5" />
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
