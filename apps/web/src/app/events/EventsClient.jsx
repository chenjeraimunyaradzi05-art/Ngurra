'use client';

import { API_BASE } from '@/lib/apiBase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Sparkles,
  Plus,
  ChevronRight,
  Video,
  Globe,
  Star,
  ArrowRight,
} from 'lucide-react';

const API_URL = API_BASE;

// Fallback mock events data
const mockEvents = [
  {
    id: 1,
    title: 'First Nations Career Fair 2025',
    description:
      'Join us for the largest Indigenous career fair in Australia. Connect with over 50 employers committed to Indigenous hiring.',
    date: '2025-02-15',
    time: '9:00 AM - 4:00 PM',
    location: 'Sydney Convention Centre',
    type: 'In Person',
    category: 'Career',
    attendees: 245,
    organizer: 'Ngurra Pathways',
    image: null,
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Women in Leadership Workshop',
    description:
      'An empowering workshop for First Nations women exploring leadership roles. Learn from successful Indigenous leaders.',
    date: '2025-02-20',
    time: '10:00 AM - 2:00 PM',
    location: 'Online via Zoom',
    type: 'Virtual',
    category: 'Workshop',
    attendees: 89,
    organizer: 'Aboriginal Women Business Network',
    image: null,
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Resume Writing Masterclass',
    description:
      'Learn how to craft a compelling resume that showcases your skills and cultural strengths.',
    date: '2025-02-22',
    time: '1:00 PM - 3:00 PM',
    location: 'Online',
    type: 'Virtual',
    category: 'Workshop',
    attendees: 56,
    organizer: 'Ngurra Pathways',
    image: null,
    isFeatured: false,
  },
  {
    id: 4,
    title: 'Community Networking Night',
    description:
      'A relaxed evening to connect with other First Nations professionals in your area.',
    date: '2025-02-28',
    time: '6:00 PM - 9:00 PM',
    location: 'Melbourne CBD',
    type: 'In Person',
    category: 'Networking',
    attendees: 78,
    organizer: 'Victorian Indigenous Chamber',
    image: null,
    isFeatured: false,
  },
  {
    id: 5,
    title: 'Tech Industry Mentorship Info Session',
    description: 'Discover opportunities in tech and connect with mentors in the industry.',
    date: '2025-03-05',
    time: '11:00 AM - 12:30 PM',
    location: 'Online',
    type: 'Virtual',
    category: 'Mentorship',
    attendees: 42,
    organizer: 'Indigenous Tech Network',
    image: null,
    isFeatured: false,
  },
  {
    id: 6,
    title: 'NAIDOC Week Celebrations',
    description:
      'Join us for a week of cultural celebrations, workshops, and community gatherings.',
    date: '2025-07-06',
    time: 'All Week',
    location: 'Various Locations',
    type: 'Hybrid',
    category: 'Cultural',
    attendees: 512,
    organizer: 'NAIDOC Committee',
    image: null,
    isFeatured: true,
  },
];

const categories = ['All', 'Career', 'Workshop', 'Networking', 'Mentorship', 'Cultural'];
const eventTypes = ['All Types', 'In Person', 'Virtual', 'Hybrid'];

export default function EventsClient({ initialEvents = [] }) {
  const hasPrefetched = initialEvents.length > 0;
  const [events, setEvents] = useState(hasPrefetched ? initialEvents : []);
  const [loading, setLoading] = useState(!hasPrefetched);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All Types');

  useEffect(() => {
    // Skip fetch if we have prefetched data
    if (hasPrefetched) {
      return;
    }
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/events`);

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        // Normalize API response to expected format
        const normalizedEvents = (data.events || data || []).map((event) => ({
          id: event.id,
          title: event.title || event.name,
          description: event.description || '',
          date: event.date || event.startDate,
          time:
            event.time ||
            (event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : ''),
          location: event.location || event.venue || '',
          type: event.type || (event.isVirtual ? 'Virtual' : 'In Person'),
          category: event.category || 'General',
          attendees: event.attendees || event._count?.attendees || 0,
          organizer: typeof event.organizer === 'object' ? event.organizer.name : event.organizer,
          image: event.imageUrl || event.bannerImage || null,
          isFeatured: event.isFeatured || false,
        }));

        setEvents(normalizedEvents.length > 0 ? normalizedEvents : mockEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        // Fallback to mock data
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesType = selectedType === 'All Types' || event.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredEvents = filteredEvents.filter((e) => e.isFeatured);
  const upcomingEvents = filteredEvents.filter((e) => !e.isFeatured);

  const getShortDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { day: 'TBA', month: '' };
      return {
        day: date.getDate(),
        month: date.toLocaleString('en-AU', { month: 'short' }).toUpperCase(),
      };
    } catch {
      return { day: 'TBA', month: '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center animate-pulse">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-indigo-200 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-indigo-300" />
            <span className="text-white font-medium">Events</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Community Events</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Discover Events</h1>
              <p className="text-xl text-indigo-100">
                Connect, learn, and grow with First Nations professionals and community members at
                our curated events.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/events/cultural"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
              >
                🎭 Cultural Calendar
              </Link>
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters Card */}
        <div className="-mt-8 mb-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by event name, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[150px]">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 appearance-none cursor-pointer transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Event Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 appearance-none cursor-pointer transition-all"
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Events</h2>
              </div>
              <span className="text-sm text-slate-500">{featuredEvents.length} featured</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.map((event) => {
                const dateInfo = getShortDate(event.date);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    </div>

                    {/* Event Image/Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-white/30" />
                      </div>
                      {/* Date Badge */}
                      <div className="absolute bottom-4 right-4 bg-white rounded-xl px-4 py-2 text-center shadow-lg">
                        <div className="text-2xl font-bold text-indigo-600">{dateInfo.day}</div>
                        <div className="text-xs font-medium text-slate-500">{dateInfo.month}</div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            event.type === 'Virtual'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : event.type === 'Hybrid'
                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                : 'bg-sky-50 text-sky-600 border border-sky-200'
                          }`}
                        >
                          {event.type === 'Virtual' && <Video className="w-3 h-3" />}
                          {event.type === 'In Person' && <MapPin className="w-3 h-3" />}
                          {event.type === 'Hybrid' && <Globe className="w-3 h-3" />}
                          {event.type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm mb-4 text-slate-500 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>{event.time || 'Time TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span className="truncate">{event.location || 'Location TBA'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm group-hover:gap-3 transition-all">
                          View Details <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            </div>
            <span className="text-sm text-slate-500">{upcomingEvents.length} events</span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No events found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your filters or check back later</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedType('All Types');
                }}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const dateInfo = getShortDate(event.date);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Date Column */}
                    <div className="flex-shrink-0 w-full md:w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-indigo-600">{dateInfo.day}</div>
                      <div className="text-sm font-medium text-slate-500">{dateInfo.month}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.type === 'Virtual'
                              ? 'bg-emerald-50 text-emerald-600'
                              : event.type === 'Hybrid'
                                ? 'bg-purple-50 text-purple-600'
                                : 'bg-sky-50 text-sky-600'
                          }`}
                        >
                          {event.type === 'Virtual' && <Video className="w-3 h-3" />}
                          {event.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {event.time || 'Time TBA'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {event.location || 'Location TBA'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-end md:justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm group-hover:bg-indigo-100 transition-colors">
                        <span className="hidden md:inline">View</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
