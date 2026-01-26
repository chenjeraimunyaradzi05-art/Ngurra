'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';
import api from '@/lib/apiClient';

/**
 * Connections Page
 * Manage connections, followers, and following
 */
export default function ConnectionsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback mock data
  const mockConnections = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Software Developer',
      company: 'First Nations Dev Corp',
      avatar: '👩🏽',
      trustLevel: 'verified',
      mutualConnections: 23,
    },
    {
      id: 2,
      name: 'James K.',
      role: 'Community Manager',
      company: 'Indigenous Business Network',
      avatar: '👨🏿',
      trustLevel: 'trusted',
      mutualConnections: 15,
    },
    {
      id: 3,
      name: 'Elder Mary T.',
      role: 'Cultural Advisor',
      company: 'Community Council',
      avatar: '👩🏽',
      trustLevel: 'verified',
      mutualConnections: 45,
    },
    {
      id: 4,
      name: 'David Williams',
      role: 'Project Manager',
      company: 'Tech Solutions',
      avatar: '👨🏽',
      trustLevel: 'established',
      mutualConnections: 8,
    },
    {
      id: 5,
      name: 'Lisa Park',
      role: 'HR Manager',
      company: 'Inclusive Hiring Co',
      avatar: '👩🏻',
      trustLevel: 'trusted',
      mutualConnections: 12,
    },
    {
      id: 6,
      name: 'Michael Chen',
      role: 'Data Analyst',
      company: 'Analytics Firm',
      avatar: '👨🏻',
      trustLevel: 'basic',
      mutualConnections: 3,
    },
  ];

  const mockFollowers = [
    {
      id: 7,
      name: 'Emma Wilson',
      role: 'Student',
      company: 'University of Sydney',
      avatar: '👩🏼',
      trustLevel: 'new',
      isFollowingBack: false,
    },
    {
      id: 8,
      name: 'Tom Brown',
      role: 'Career Changer',
      avatar: '👨🏽',
      trustLevel: 'basic',
      isFollowingBack: true,
    },
    {
      id: 9,
      name: 'Jessica Lee',
      role: 'Trainee Developer',
      company: 'Tech Bootcamp',
      avatar: '👩🏻',
      trustLevel: 'basic',
      isFollowingBack: false,
    },
  ];

  const mockPending = [
    {
      id: 10,
      name: 'Alex Johnson',
      role: 'Recruiter',
      company: 'Talent Agency',
      avatar: '👨🏼',
      trustLevel: 'established',
      type: 'received',
      time: '2 days ago',
    },
    {
      id: 11,
      name: 'Nina Patel',
      role: 'Community Leader',
      avatar: '👩🏽',
      trustLevel: 'trusted',
      type: 'received',
      time: '3 days ago',
    },
    {
      id: 12,
      name: 'Robert Kim',
      role: 'Mentor',
      company: 'Career Mentors',
      avatar: '👨🏻',
      trustLevel: 'verified',
      type: 'sent',
      time: '1 week ago',
    },
  ];

  const [connections, setConnections] = useState(mockConnections);
  const [followers, setFollowers] = useState(mockFollowers);
  const [following, setFollowing] = useState(mockConnections.slice(0, 4));
  const [pending, setPending] = useState(mockPending);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    connections: mockConnections.length,
    followers: mockFollowers.length,
    following: 4,
    pending: mockPending.length,
  });

  const tabs = [
    { id: 'connections', label: 'Connections', count: counts.connections },
    { id: 'followers', label: 'Followers', count: counts.followers },
    { id: 'following', label: 'Following', count: counts.following },
    { id: 'pending', label: 'Pending', count: counts.pending },
  ];

  const applyMockData = useCallback(() => {
    setConnections(mockConnections);
    setFollowers(mockFollowers);
    setFollowing(mockConnections.slice(0, 4));
    setPending(mockPending);
    setCounts({
      connections: mockConnections.length,
      followers: mockFollowers.length,
      following: 4,
      pending: mockPending.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConnections = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      applyMockData();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use apiClient so auth + refresh + timeouts are handled consistently.
      // Keep the page responsive by skipping retries here.
      const requestOptions = { timeout: 5000, skipRetry: true };

      const [connRes, followersRes, followingRes, requestsRes] = await Promise.all([
        api('/connections', requestOptions),
        api('/connections/followers', requestOptions),
        api('/connections/following', requestOptions),
        api('/connections/requests', requestOptions),
      ]);

      if (connRes.ok) {
        const mapped = (connRes.data?.connections || []).map((c) => ({
          id: c.id,
          name: c.name || c.email || c.userId || 'Unknown',
          role: c.role || c.headline || '',
          company: c.company || '',
          avatar: c.avatar || '👤',
          trustLevel: c.trustLevel || 'basic',
          mutualConnections: c.mutualConnections || 0,
        }));
        setConnections(mapped.length > 0 ? mapped : mockConnections);
        setCounts((prev) => ({ ...prev, connections: mapped.length || mockConnections.length }));
      } else {
        setConnections(mockConnections);
        setCounts((prev) => ({ ...prev, connections: mockConnections.length }));
      }

      if (followersRes.ok) {
        const mapped = (followersRes.data?.followers || []).map((f) => ({
          id: f.id,
          name: f.name || f.email || f.userId || 'Unknown',
          role: f.role || f.headline || '',
          company: f.company || '',
          avatar: f.avatar || '👤',
          trustLevel: f.trustLevel || 'basic',
          isFollowingBack: !!f.isFollowingBack,
        }));
        setFollowers(mapped.length > 0 ? mapped : mockFollowers);
        setCounts((prev) => ({ ...prev, followers: mapped.length || mockFollowers.length }));
      } else {
        setFollowers(mockFollowers);
        setCounts((prev) => ({ ...prev, followers: mockFollowers.length }));
      }

      if (followingRes.ok) {
        const mapped = (followingRes.data?.following || []).map((f) => ({
          id: f.id,
          name: f.name || f.email || f.userId || f.followingId || 'Unknown',
          role: f.role || f.headline || '',
          company: f.company || '',
          avatar: f.avatar || '👤',
          trustLevel: f.trustLevel || 'basic',
        }));
        setFollowing(mapped.length > 0 ? mapped : mockConnections.slice(0, 4));
        setCounts((prev) => ({ ...prev, following: mapped.length || 4 }));
      } else {
        setFollowing(mockConnections.slice(0, 4));
        setCounts((prev) => ({ ...prev, following: 4 }));
      }

      if (requestsRes.ok) {
        const received = (requestsRes.data?.received || []).map((p) => ({
          id: p.id,
          name: p.name || p.email || p.userId || 'Unknown',
          role: p.role || p.headline || '',
          company: p.company || '',
          avatar: p.avatar || '👤',
          trustLevel: p.trustLevel || 'basic',
          type: 'received',
          time: p.time || 'Recently',
        }));
        const sent = (requestsRes.data?.sent || []).map((p) => ({
          id: p.id,
          name: p.name || p.email || p.userId || 'Unknown',
          role: p.role || p.headline || '',
          company: p.company || '',
          avatar: p.avatar || '👤',
          trustLevel: p.trustLevel || 'basic',
          type: 'sent',
          time: p.time || 'Recently',
        }));
        const merged = [...received, ...sent];
        setPending(merged.length > 0 ? merged : mockPending);
        setCounts((prev) => ({ ...prev, pending: merged.length || mockPending.length }));
      } else {
        setPending(mockPending);
        setCounts((prev) => ({ ...prev, pending: mockPending.length }));
      }
    } catch (err) {
      console.error('Connections fetch error:', err);
      applyMockData();
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyMockData, authLoading, isAuthenticated]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const trustBadges = {
    verified: { icon: '✓', color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Verified' },
    trusted: { icon: '⭐', color: 'text-sky-500', bg: 'bg-sky-100', label: 'Trusted' },
    established: {
      icon: '💎',
      color: 'text-indigo-500',
      bg: 'bg-indigo-100',
      label: 'Established',
    },
    basic: { icon: '👤', color: 'text-slate-400', bg: 'bg-slate-100', label: 'Member' },
    new: { icon: '🌱', color: 'text-sky-400', bg: 'bg-sky-100', label: 'New' },
  };

  // Theme colors
  const accentPrimary = '#4F46E5';
  const accentSecondary = '#0EA5E9';

  const getDataForTab = () => {
    switch (activeTab) {
      case 'connections':
        return connections;
      case 'followers':
        return followers;
      case 'following':
        return following;
      case 'pending':
        return pending;
      default:
        return [];
    }
  };

  const filteredData = getDataForTab().filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen pt-24 pb-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)' }}
    >
      {/* Decorative halos */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentPrimary}22 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentSecondary}22 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="container mx-auto px-4 max-w-3xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/feed"
              className="p-2 rounded-full hover:bg-white/80 transition-colors text-slate-600 bg-white border border-slate-200"
            >
              ←
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">My Network</h1>
          </div>

          <Link
            href="/connections/find"
            className="px-4 py-2 rounded-full text-white font-medium text-sm transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentSecondary} 100%)`,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            Find People
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? {
                      background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentSecondary} 100%)`,
                      color: 'white',
                    }
                  : { background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }
              }
            >
              {tab.label}
              <span className={`ml-2 ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {/* People List */}
        {authLoading || loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 rounded-full animate-spin border-4 border-indigo-200 border-t-indigo-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div
                className="bg-white border border-slate-200 rounded-xl p-8 text-center"
                style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
              >
                <span className="text-4xl mb-4 block">👥</span>
                <p className="text-slate-500">
                  {searchQuery ? 'No results found' : `No ${activeTab} yet`}
                </p>
              </div>
            ) : (
              filteredData.map((person) => (
                <div
                  key={person.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
                  style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Link href={`/profile/${person.id}`} className="block">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%)',
                        }}
                      >
                        {person.avatar}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${person.id}`}
                          className="font-medium text-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          {person.name}
                        </Link>
                        {person.trustLevel &&
                          trustBadges[person.trustLevel] &&
                          person.trustLevel !== 'basic' &&
                          person.trustLevel !== 'new' && (
                            <span className={`text-sm ${trustBadges[person.trustLevel].color}`}>
                              {trustBadges[person.trustLevel].icon}
                            </span>
                          )}
                      </div>
                      <p className="text-slate-500 text-sm truncate">{person.role}</p>
                      {person.company && (
                        <p className="text-slate-400 text-sm truncate">{person.company}</p>
                      )}
                      {person.mutualConnections && (
                        <p className="text-slate-400 text-xs mt-1">
                          {person.mutualConnections} mutual connections
                        </p>
                      )}
                      {person.type && (
                        <p className="text-slate-400 text-xs mt-1">
                          {person.type === 'received' ? 'Request received' : 'Request sent'} •{' '}
                          {person.time}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {activeTab === 'connections' && (
                        <>
                          <Link
                            href={`/messages?user=${person.id}`}
                            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                          >
                            💬
                          </Link>
                          <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            ⋮
                          </button>
                        </>
                      )}

                      {activeTab === 'followers' && (
                        <button
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                          style={
                            person.isFollowingBack
                              ? { background: '#F1F5F9', color: '#64748B' }
                              : {
                                  background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentSecondary} 100%)`,
                                  color: 'white',
                                }
                          }
                        >
                          {person.isFollowingBack ? 'Following' : 'Follow Back'}
                        </button>
                      )}

                      {activeTab === 'following' && (
                        <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          Following
                        </button>
                      )}

                      {activeTab === 'pending' && person.type === 'received' && (
                        <>
                          <button
                            className="px-4 py-2 rounded-full text-sm font-medium text-white"
                            style={{
                              background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentSecondary} 100%)`,
                            }}
                          >
                            Accept
                          </button>
                          <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            Decline
                          </button>
                        </>
                      )}

                      {activeTab === 'pending' && person.type === 'sent' && (
                        <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* People You May Know - Only show on connections tab */}
        {activeTab === 'connections' && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">People You May Know</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 101,
                  name: 'Rachel Green',
                  role: 'UX Designer',
                  avatar: '👩🏼',
                  mutualConnections: 7,
                },
                {
                  id: 102,
                  name: 'Marcus Johnson',
                  role: 'Career Coach',
                  avatar: '👨🏿',
                  mutualConnections: 12,
                },
                {
                  id: 103,
                  name: 'Amy Wong',
                  role: 'Tech Lead',
                  avatar: '👩🏻',
                  mutualConnections: 5,
                },
                {
                  id: 104,
                  name: 'Daniel Torres',
                  role: 'Entrepreneur',
                  avatar: '👨🏽',
                  mutualConnections: 9,
                },
              ].map((person) => (
                <div
                  key={person.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                  style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%)',
                      }}
                    >
                      {person.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{person.name}</p>
                      <p className="text-slate-500 text-sm truncate">{person.role}</p>
                      <p className="text-slate-400 text-xs">{person.mutualConnections} mutual</p>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-full text-sm text-white font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentSecondary} 100%)`,
                      }}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Friends */}
        <div
          className="mt-8 bg-white border border-slate-200 rounded-xl p-6 text-center"
          style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
        >
          <span className="text-3xl mb-3 block">📧</span>
          <h3 className="font-semibold text-slate-800 mb-2">Grow Your Network</h3>
          <p className="text-slate-500 text-sm mb-4">
            Invite friends and colleagues to join the community
          </p>
          <button className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Invite Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
