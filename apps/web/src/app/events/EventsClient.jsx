'use client';

import { API_BASE } from '@/lib/apiBase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Clock, Users, Search, Filter,
  Sparkles, Plus, ChevronRight, Video, Loader2
} from 'lucide-react';

const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

const API_URL = API_BASE;

// Fallback mock events data
const mockEvents = [
  {
    id: 1,
    title: 'First Nations Career Fair 2025',
    description: 'Join us for the largest Indigenous career fair in Australia. Connect with over 50 employers committed to Indigenous hiring.',
    date: '2025-02-15',
    time: '9:00 AM - 4:00 PM',
    location: 'Sydney Convention Centre',
    type: 'In Person',
    category: 'Career',
    attendees: 245,
    organizer: 'Ngurra Pathways',
    image: null,
    isFeatured: true
  },
  {
    id: 2,
    title: 'Women in Leadership Workshop',
    description: 'An empowering workshop for First Nations women exploring leadership roles. Learn from successful Indigenous leaders.',
    date: '2025-02-20',
    time: '10:00 AM - 2:00 PM',
    location: 'Online via Zoom',
    type: 'Virtual',
    category: 'Workshop',
    attendees: 89,
    organizer: 'Aboriginal Women Business Network',
    image: null,
    isFeatured: true
  },
  {
    id: 3,
    title: 'Resume Writing Masterclass',
    description: 'Learn how to craft a compelling resume that showcases your skills and cultural strengths.',
    date: '2025-02-22',
    time: '1:00 PM - 3:00 PM',
    location: 'Online',
    type: 'Virtual',
    category: 'Workshop',
    attendees: 56,
    organizer: 'Ngurra Pathways',
    image: null,
    isFeatured: false
  },
  {
    id: 4,
    title: 'Community Networking Night',
    description: 'A relaxed evening to connect with other First Nations professionals in your area.',
    date: '2025-02-28',
    time: '6:00 PM - 9:00 PM',
    location: 'Melbourne CBD',
    type: 'In Person',
    category: 'Networking',
    attendees: 78,
    organizer: 'Victorian Indigenous Chamber',
    image: null,
    isFeatured: false
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
    isFeatured: false
  },
  {
    id: 6,
    title: 'NAIDOC Week Celebrations',
    description: 'Join us for a week of cultural celebrations, workshops, and community gatherings.',
    date: '2025-07-06',
    time: 'All Week',
    location: 'Various Locations',
    type: 'Hybrid',
    category: 'Cultural',
    attendees: 512,
    organizer: 'NAIDOC Committee',
    image: null,
    isFeatured: true
  }
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
        const normalizedEvents = (data.events || data || []).map(event => ({
          id: event.id,
          title: event.title || event.name,
          description: event.description || '',
          date: event.date || event.startDate,
          time: event.time || (event.startTime && event.endTime ? 
            `${event.startTime} - ${event.endTime}` : ''),
          location: event.location || event.venue || '',
          type: event.type || (event.isVirtual ? 'Virtual' : 'In Person'),
          category: event.category || 'General',
          attendees: event.attendees || event._count?.attendees || 0,
          organizer: typeof event.organizer === 'object' ? event.organizer.name : event.organizer,
          image: event.imageUrl || event.bannerImage || null,
          isFeatured: event.isFeatured || false
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
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesType = selectedType === 'All Types' || event.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredEvents = filteredEvents.filter(e => e.isFeatured);
  const upcomingEvents = filteredEvents.filter(e => !e.isFeatured);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-AU', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: accentPink }} />
          <p className="text-slate-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
      {/* Decorative background halos */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 60%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 60%)', filter: 'blur(40px)' }} />
      </div>
      
      <div className="max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-slate-500 hover:text-pink-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-pink-600 font-medium">Events</span>
        </nav>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white border border-slate-200" style={{ boxShadow: '0 4px 12px rgba(233, 30, 140, 0.1)' }}>
              <Calendar className="w-8 h-8" style={{ color: accentPink }} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-1 block">Community</span>
              <h1 className="text-3xl font-bold text-slate-900">Events</h1>
              <p className="text-slate-600">Connect, learn, and grow together</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/events/cultural"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50"
            >
              🎭 Cultural Calendar
            </Link>
            <Link
              href="/events/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`, boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)' }}
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div 
          className="p-6 rounded-2xl mb-8 bg-white"
          style={{ 
            border: '1px solid #E2E8F0',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)'
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 rounded-xl transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6" style={{ color: accentPink }} />
              <h2 className="text-xl font-bold text-slate-900">Featured Events</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-200 bg-white hover:shadow-xl"
                  style={{ 
                    border: '2px solid',
                    borderImage: `linear-gradient(135deg, ${accentPink}, ${accentPurple}) 1`,
                    boxShadow: '0 8px 32px rgba(233, 30, 140, 0.1)'
                  }}
                >
                  <div 
                    className="h-40 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))' }}
                  >
                    <Calendar className="w-16 h-16 text-pink-300" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          background: event.type === 'Virtual' ? 'rgba(16, 185, 129, 0.1)' : event.type === 'Hybrid' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(233, 30, 140, 0.1)',
                          color: event.type === 'Virtual' ? '#10B981' : event.type === 'Hybrid' ? accentPurple : accentPink,
                          border: `1px solid ${event.type === 'Virtual' ? 'rgba(16, 185, 129, 0.3)' : event.type === 'Hybrid' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(233, 30, 140, 0.3)'}`
                        }}
                      >
                        {event.type === 'Virtual' && <Video className="inline w-3 h-3 mr-1" />}
                        {event.type}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-pink-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2 text-slate-500">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: accentPink }} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: accentPink }} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: accentPink }} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: accentPink }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6" style={{ color: accentPurple }} />
            <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white border border-slate-200" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.06)' }}>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No events found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex flex-col md:flex-row gap-4 p-5 rounded-xl transition-all duration-200 bg-white hover:shadow-lg border border-slate-200"
                >
                  <div 
                    className="w-full md:w-32 h-24 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))' }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: accentPink }}>
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(event.date).toLocaleString('en-AU', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          background: event.type === 'Virtual' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(233, 30, 140, 0.1)',
                          color: event.type === 'Virtual' ? '#10B981' : accentPink
                        }}
                      >
                        {event.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1 text-slate-900 group-hover:text-pink-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm mb-2 text-slate-500">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees} attending
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" style={{ color: accentPink }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
