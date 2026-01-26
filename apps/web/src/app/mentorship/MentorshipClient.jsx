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
  Loader2,
} from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Theme colors
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

// Helper to check if URL is a Cloudinary public ID
function isCloudinaryPublicId(url) {
  if (!url) return false;
  return !url.startsWith('http') && !url.startsWith('/');
}

// Categories
const categories = [
  { id: 'all', label: 'All Mentors', icon: '🌟' },
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'Business', label: 'Business', icon: '💼' },
  { id: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'Education', label: 'Education', icon: '🎓' },
  { id: 'Trades', label: 'Trades', icon: '🔧' },
  { id: 'Creative', label: 'Creative', icon: '🎨' },
  { id: 'Government', label: 'Government', icon: '🏛️' },
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
    mentor: 'Sarah Mitchell',
    date: 'This Thursday, 5pm',
    spots: 4,
  },
  {
    id: '2',
    title: 'Indigenous Business 101',
    mentor: 'James Kamilaroi',
    date: 'Next Monday, 6pm',
    spots: 6,
  },
  {
    id: '3',
    title: 'Healthcare Career Paths',
    mentor: 'Dr. Emily Noongar',
    date: 'Saturday, 10am',
    spots: 3,
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #FFF5FB 0%, #FAFAFF 100%)' }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: accentPink }} />
          <p className="text-slate-600 font-medium">Loading mentors...</p>
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
            <span className="text-pink-600 font-medium">Mentorship</span>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 bg-pink-50 border border-pink-200">
              <Heart className="w-4 h-4" style={{ color: accentPink }} />
              <span className="text-pink-600 font-semibold">First Nations Mentorship Program</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              <span className="text-slate-900">Connect with Mentors Who </span>
              <span style={{ color: accentPink }}>Understand Your Journey</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Get guidance from experienced First Nations professionals who share your background
              and can help you navigate your career path with cultural understanding.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg">
                <div className="text-3xl font-bold" style={{ color: accentPink }}>
                  150+
                </div>
                <div className="text-sm text-slate-500">Active Mentors</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg">
                <div className="text-3xl font-bold" style={{ color: accentPurple }}>
                  2,500+
                </div>
                <div className="text-sm text-slate-500">Sessions Completed</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg">
                <div className="text-3xl font-bold text-emerald-500">4.9★</div>
                <div className="text-sm text-slate-500">Average Rating</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg">
                <div className="text-3xl font-bold text-amber-500">85%</div>
                <div className="text-sm text-slate-500">Career Advancement</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search mentors by name, expertise, or industry..."
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg sticky top-24">
              {/* Categories */}
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Categories
              </h3>
              <div className="space-y-1 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeCategory === cat.id
                        ? 'bg-pink-50 text-pink-600 border border-pink-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Become a Mentor CTA */}
              <div className="pt-5 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Share Your Experience</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Help the next generation by becoming a mentor.
                </p>
                <Link
                  href="/mentor/signup"
                  className="block text-center py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                  }}
                >
                  Become a Mentor
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-pink-50 border border-pink-100">
                    🔍
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: accentPink }}>
                    1. Find
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Browse by industry & expertise</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-purple-50 border border-purple-100">
                    📅
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: accentPurple }}>
                    2. Book
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Schedule 45-60min sessions</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl bg-emerald-50 border border-emerald-100">
                    🚀
                  </div>
                  <h3 className="text-sm font-bold text-emerald-600">3. Grow</h3>
                  <p className="text-xs text-slate-500 mt-1">Build lasting relationships</p>
                </div>
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {activeCategory === 'all' ? 'Featured Mentors' : `${activeCategory} Mentors`}
              </h2>
              <span className="text-sm text-slate-500 font-medium">
                {filteredMentors.length} mentors
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl hover:border-pink-200 transition-all duration-300"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={mentor.avatar || defaultAvatar}
                        alt={mentor.name || 'Mentor'}
                        width={64}
                        height={64}
                        cloudinary={isCloudinaryPublicId(mentor.avatar)}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-200"
                        sizes="64px"
                      />
                      {mentor.verified && (
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{mentor.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{mentor.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-slate-900">{mentor.rating}</span>
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
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {mentor.location}
                      </span>
                      <span className="text-emerald-600 font-semibold">{mentor.price}</span>
                    </div>
                    <button
                      onClick={() => handleBookSession(mentor)}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                      }}
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}

              {filteredMentors.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No mentors found</h3>
                  <p className="text-slate-500 text-sm mb-4">Try adjusting your filters</p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* View All Link */}
            <div className="text-center mt-8">
              <Link
                href="/mentorship/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                View All 150+ Mentors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <div className="space-y-5 sticky top-24">
              {/* Mentorship Circles */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: accentPink }} />
                  Group Mentorship Circles
                </h3>
                <div className="space-y-3">
                  {upcomingCircles.map((circle) => (
                    <div
                      key={circle.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-pink-200 transition-colors"
                    >
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">{circle.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">with {circle.mentor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-pink-600 font-medium">{circle.date}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          {circle.spots} spots left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/mentorship/circles"
                  className="block mt-4 text-center py-2.5 rounded-xl text-sm font-semibold text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  View All Circles →
                </Link>
              </div>

              {/* Sponsor Card */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold uppercase">
                    Sponsored
                  </span>
                </div>
                <h3 className="font-bold text-emerald-900 mb-2">CareerTrackers Program</h3>
                <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
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

              {/* Success Story */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: accentPink }} />
                  Success Story
                </h3>
                <blockquote className="text-sm italic text-slate-700 mb-3 leading-relaxed">
                  &quot;My mentor Jarrah helped me land my first tech job. From a remote community
                  to Google in 18 months!&quot;
                </blockquote>
                <p className="text-xs text-slate-500">— Kirra M., Software Engineer</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => {
            setSelectedMentor(null);
            setBookingStep(0);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {bookingStep === 1 && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src={selectedMentor.avatar || defaultAvatar}
                    alt={selectedMentor.name || 'Mentor'}
                    width={56}
                    height={56}
                    cloudinary={isCloudinaryPublicId(selectedMentor.avatar)}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedMentor.name}</h3>
                    <p className="text-sm text-slate-500">{selectedMentor.title}</p>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 mb-4">Book a Session</h4>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Preferred Time
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
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
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      What would you like to discuss?
                    </label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      rows={3}
                      placeholder="Introduce yourself and share your goals..."
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMentor(null);
                      setBookingStep(0);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                    }}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <h4 className="font-bold text-slate-900 mb-6">Confirm Booking</h4>
                <div className="rounded-xl p-5 mb-6 bg-pink-50 border border-pink-100">
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700">
                      <span className="font-semibold">Mentor:</span> {selectedMentor.name}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">Date:</span>{' '}
                      {new Date(bookingData.date).toLocaleDateString('en-AU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">Time:</span> {bookingData.time}
                    </p>
                    <p className="text-emerald-600 font-semibold">Price: Free</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl bg-emerald-100">
                  ✅
                </div>
                <h4 className="font-bold text-xl mb-2 text-emerald-600">Booking Confirmed!</h4>
                <p className="text-sm text-slate-500">
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
          className="relative overflow-hidden rounded-3xl p-8 md:p-12"
          style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to give back?
              </h3>
              <p className="text-white/80 text-lg">
                Share your experience and help guide the next generation of Indigenous
                professionals.
              </p>
            </div>
            <Link
              href="/mentor/signup"
              className="flex items-center gap-2 px-8 py-4 bg-white rounded-xl font-bold text-pink-600 hover:bg-pink-50 transition-colors shadow-lg"
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
