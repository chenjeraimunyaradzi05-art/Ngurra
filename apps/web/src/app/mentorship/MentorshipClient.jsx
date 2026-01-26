'use client';

import { API_BASE } from '@/lib/apiBase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from '@/components/ui/OptimizedImage';
import { isCloudinaryPublicId } from '@/lib/cloudinary';
import { ChevronRight, Users, Heart, Star, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

const API_URL = API_BASE;

export default function MentorshipClient({ initialMentors = [] }) {
  const hasPrefetched = Array.isArray(initialMentors) && initialMentors.length > 0;
  const [featuredMentors, setFeaturedMentors] = useState(hasPrefetched ? initialMentors : []);
  const [loading, setLoading] = useState(!hasPrefetched);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingData, setBookingData] = useState({ date: '', time: '', message: '' });

  // Realistic seed data for mentors
  const seedMentors = [
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
      bio: 'Former CEO of Indigenous Business Australia with 25+ years experience. Passionate about empowering the next generation of First Nations leaders.',
      availability: ['Mon', 'Wed', 'Fri'],
      languages: ['English', 'Dharawal'],
      price: 'Free',
      verified: true,
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
      bio: 'From remote Kimberley community to Big Tech. I help First Nations youth break into tech with practical guidance and real industry insights.',
      availability: ['Tue', 'Thu', 'Sat'],
      languages: ['English'],
      price: 'Free',
      verified: true,
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
      bio: 'Supervised 20+ PhD students, 15 of them First Nations scholars. Specialist in Indigenous health research and decolonizing methodologies.',
      availability: ['Mon', 'Tue', 'Wed'],
      languages: ['English'],
      price: 'Free',
      verified: true,
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
      bio: '15 years in mining operations. Started as a plant operator, now managing 200+ staff. Happy to share the journey and help you get started.',
      availability: ['Wed', 'Sat', 'Sun'],
      languages: ['English', 'Pitjantjatjara'],
      price: 'Free',
      verified: true,
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
      bio: 'Helping aspiring nurses and healthcare workers find their path. Special focus on supporting mature-age students and career changers.',
      availability: ['Mon', 'Thu', 'Fri'],
      languages: ['English'],
      price: 'Free',
      verified: true,
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
      bio: 'Founded 3 successful businesses. Now helping First Nations entrepreneurs start and scale their ventures with culturally-aligned strategies.',
      availability: ['Tue', 'Wed', 'Thu'],
      languages: ['English'],
      price: 'Free',
      verified: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Mentors', icon: '👥' },
    { id: 'Technology', label: 'Technology', icon: '💻' },
    { id: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'Business', label: 'Business', icon: '💼' },
    { id: 'Education', label: 'Education', icon: '📚' },
    { id: 'Resources', label: 'Mining & Resources', icon: '⛏️' },
    { id: 'Corporate', label: 'Corporate', icon: '🏢' },
  ];

  const upcomingCircles = [
    {
      id: '1',
      title: 'Breaking into Tech',
      mentor: 'Jarrah Williams',
      date: 'Jan 15, 2025',
      spots: 3,
      total: 10,
    },
    {
      id: '2',
      title: 'PhD Journey Support',
      mentor: 'Dr. Chelsea Bond',
      date: 'Jan 18, 2025',
      spots: 5,
      total: 8,
    },
    {
      id: '3',
      title: 'Women in Leadership',
      mentor: 'Aunty Donna Meehan',
      date: 'Jan 22, 2025',
      spots: 2,
      total: 12,
    },
  ];

  useEffect(() => {
    // Skip fetch if we already have pre-fetched mentors from server
    if (!hasPrefetched) {
      fetchFeaturedMentors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Default placeholder avatar for mentors without one
  const defaultAvatar =
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop';

  async function fetchFeaturedMentors() {
    try {
      const res = await fetch(`${API_URL}/mentorship/top-mentors?limit=6`);
      if (res.ok) {
        const data = await res.json();
        if (data.mentors && data.mentors.length > 0) {
          // Normalize API mentors to match expected structure
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
        } else {
          setFeaturedMentors(seedMentors);
        }
      } else {
        setFeaturedMentors(seedMentors);
      }
    } catch (err) {
      console.error('Failed to fetch featured mentors:', err);
      setFeaturedMentors(seedMentors);
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
    // In production, this would call the API
    setBookingStep(3); // Success step
    setTimeout(() => {
      setSelectedMentor(null);
      setBookingStep(0);
      setBookingData({ date: '', time: '', message: '' });
    }, 3000);
  };

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
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-indigo-200 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-indigo-300" />
            <span className="text-white font-medium">Mentorship</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6">
              <Heart className="w-4 h-4" />
              First Nations Mentorship Program
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Connect with Mentors Who Understand Your Journey
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Get guidance from experienced First Nations professionals who share your background
              and can help you navigate your career path.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">150+</div>
                <div className="text-sm text-indigo-200">Active Mentors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">2,500+</div>
                <div className="text-sm text-indigo-200">Sessions Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">4.9★</div>
                <div className="text-sm text-indigo-200">Average Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">85%</div>
                <div className="text-sm text-indigo-200">Career Advancement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="rounded-2xl p-5 mb-4 sticky top-20 bg-white border border-slate-200 shadow-sm">
              {/* Search */}
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Categories */}
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] mb-3 text-indigo-600">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                      activeCategory === cat.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Become a Mentor CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold mb-2 text-slate-900">Share Your Experience</h3>
                <p className="text-xs mb-3 text-slate-500">
                  Help the next generation by becoming a mentor.
                </p>
                <Link
                  href="/mentor/signup"
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:shadow-lg transition-all"
                >
                  Become a Mentor
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
            {/* How It Works */}
            <div className="rounded-2xl p-6 mb-6 bg-white border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-slate-900">How It Works</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl bg-indigo-100">
                    🔍
                  </div>
                  <h3 className="text-sm font-semibold text-indigo-600">1. Find</h3>
                  <p className="text-xs text-slate-500">Browse by industry & expertise</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl bg-sky-100">
                    📅
                  </div>
                  <h3 className="text-sm font-semibold text-sky-600">2. Book</h3>
                  <p className="text-xs text-slate-500">Schedule 45-60min sessions</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl bg-emerald-100">
                    🚀
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-600">3. Grow</h3>
                  <p className="text-xs text-slate-500">Build lasting relationships</p>
                </div>
              </div>
            </div>

            {/* Mentors Grid */}
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {activeCategory === 'all' ? 'Featured Mentors' : `${activeCategory} Mentors`}
              <span className="text-sm font-normal ml-2 text-slate-400">
                ({filteredMentors.length})
              </span>
            </h2>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl p-4 bg-slate-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 rounded w-3/4 mb-2 bg-slate-200" />
                        <div className="h-3 rounded w-1/2 bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="group rounded-2xl p-5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="relative">
                        <Image
                          src={mentor.avatar || defaultAvatar}
                          alt={mentor.name || 'Mentor'}
                          width={64}
                          height={64}
                          cloudinary={isCloudinaryPublicId(mentor.avatar || defaultAvatar)}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100"
                          sizes="64px"
                        />
                        {mentor.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white bg-indigo-600 ring-2 ring-white">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {mentor.name}
                        </h3>
                        <p className="text-sm truncate text-slate-500">{mentor.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                            <Star className="w-4 h-4 fill-current" /> {mentor.rating}
                          </span>
                          <span className="text-xs text-slate-400">({mentor.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {mentor.expertise?.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm mb-4 line-clamp-2 text-slate-600">{mentor.bio}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {mentor.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          {mentor.price}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookSession(mentor)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:shadow-lg transition-all"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))}

                {filteredMentors.length === 0 && (
                  <div className="col-span-2 text-center py-12 rounded-2xl bg-white border border-slate-200">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No mentors found</h3>
                    <p className="text-slate-500 mb-4">
                      Try adjusting your search or category filters
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory('all');
                        setSearchQuery('');
                      }}
                      className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View All Link */}
            <div className="text-center mt-8">
              <Link
                href="/mentorship/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
              >
                View All 150+ Mentors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Mentorship Circles */}
              <div
                className="rounded-xl p-4 bg-white border border-slate-200"
                style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-indigo-900">
                  ⭕ Group Mentorship Circles
                </h3>
                <div className="space-y-3">
                  {upcomingCircles.map((circle) => (
                    <div
                      key={circle.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <h4 className="font-medium text-sm text-slate-900">{circle.title}</h4>
                      <p className="text-xs text-slate-500">with {circle.mentor}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-indigo-600">{circle.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {circle.spots} spots left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/mentorship/circles"
                  className="block mt-3 text-center py-2 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  View All Circles
                </Link>
              </div>

              {/* Partner Sponsor Ad */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    SPONSORED
                  </span>
                </div>
                <h3 className="font-semibold mb-2 text-emerald-900">CareerTrackers Program</h3>
                <p className="text-xs mb-3 text-emerald-800">
                  Paid internships with Australia&apos;s top companies. Mentorship included.
                  Applications now open for 2025.
                </p>
                <Link
                  href="/partners/careertrackers"
                  className="block text-center py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>

              {/* Success Stories */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100">
                <h3 className="text-sm font-semibold mb-3 text-sky-900">💎 Success Story</h3>
                <blockquote className="text-xs italic mb-2 text-slate-700">
                  &quot;My mentor Jarrah helped me land my first tech job. From a remote community
                  to Google in 18 months!&quot;
                </blockquote>
                <p className="text-xs text-slate-500">— Kirra M., Software Engineer</p>
              </div>

              {/* Acknowledgment */}
              <div className="text-center py-3">
                <p className="text-[10px] text-slate-400">
                  <span className="text-indigo-600">✦</span> We acknowledge Traditional Custodians{' '}
                  <span className="text-indigo-600">✦</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => {
            setSelectedMentor(null);
            setBookingStep(0);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {bookingStep === 1 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={selectedMentor.avatar || defaultAvatar}
                    alt={selectedMentor.name || 'Mentor'}
                    width={48}
                    height={48}
                    cloudinary={isCloudinaryPublicId(selectedMentor.avatar || defaultAvatar)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedMentor.name || 'Mentor'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedMentor.title || 'Professional Mentor'}
                    </p>
                  </div>
                </div>

                <h4 className="font-semibold mb-3 text-indigo-900">Book a Session</h4>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs mb-1 block text-slate-500">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block text-slate-500">Preferred Time</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block text-slate-500">
                      What would you like to discuss?
                    </label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      rows={3}
                      placeholder="Introduce yourself and share your goals..."
                      className="w-full px-3 py-2 rounded-lg text-sm resize-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMentor(null);
                      setBookingStep(0);
                    }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <h4 className="font-semibold mb-4 text-indigo-900">Confirm Booking</h4>
                <div className="rounded-lg p-4 mb-4 bg-indigo-50 border border-indigo-100">
                  <p className="text-sm mb-2 text-indigo-900">
                    <strong>Mentor:</strong> {selectedMentor.name || 'Mentor'}
                  </p>
                  <p className="text-sm mb-2 text-indigo-900">
                    <strong>Date:</strong>{' '}
                    {new Date(bookingData.date).toLocaleDateString('en-AU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm mb-2 text-indigo-900">
                    <strong>Time:</strong> {bookingData.time}
                  </p>
                  <p className="text-sm text-emerald-600">
                    <strong>Price:</strong> Free
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="font-semibold text-xl mb-2 text-emerald-600">Booking Confirmed!</h4>
                <p className="text-sm text-slate-500">
                  You&apos;ll receive a confirmation email with the meeting link shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
