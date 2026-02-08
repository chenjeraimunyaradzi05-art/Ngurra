'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/**
 * User Profile Page
 * View user profiles with social networking features
 */
export default function UserProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [connectionStatus, setConnectionStatus] = useState('none'); // none, pending, connected

  // Community member profile — representative data at real institutions
  const user = {
    id: params.id,
    name: 'Community Member',
    headline: 'CareerTrackers Alumni | Software Engineer at Canva | Mentor',
    avatar: '👩🏽',
    coverImage: null,
    location: 'Sydney, NSW',
    trustLevel: 'verified',
    connectionCount: 214,
    followerCount: 387,
    postCount: 24,
    bio: 'Started through a CareerTrackers internship, completed a Bachelor of IT at UTS, and now building products at Canva. Passionate about mentoring the next generation of First Nations technologists.',
    currentRole: 'Software Engineer at Canva',
    education: 'Bachelor of Information Technology, University of Technology Sydney',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Community Building', 'Mentoring'],
    interests: ['Technology', 'Indigenous Business', 'Education', 'Career Development'],
    badges: ['Tech Pioneer', 'Community Helper', 'Mentor'],
    isVerified: true,
    safetyMode: 'enhanced',
    dmPolicy: 'connections'
  };

  const trustBadges = {
    verified: { icon: '✓', color: 'text-emerald', bg: 'bg-emerald/20', label: 'Verified Member' },
    trusted: { icon: '⭐', color: 'text-gold', bg: 'bg-gold/20', label: 'Trusted Member' },
    established: { icon: '💎', color: 'text-purple-royal', bg: 'bg-purple-royal/20', label: 'Established Member' },
    basic: { icon: '👤', color: 'text-white/60', bg: 'bg-white/10', label: 'Member' },
    new: { icon: '🌱', color: 'text-light-blue', bg: 'bg-light-blue/20', label: 'New Member' }
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝', count: user.postCount },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'connections', label: 'Connections', icon: '👥', count: user.connectionCount },
    { id: 'groups', label: 'Groups', icon: '💬' },
    { id: 'media', label: 'Media', icon: '🖼️' }
  ];

  const mockPosts = [
    {
      id: 1,
      content: "Just finished mentoring a group of CareerTrackers interns on their first React project. Seeing the next generation of First Nations developers build with confidence is incredible 🌟 #CareerTrackers #FirstNationsInTech",
      likes: 156,
      comments: 34,
      time: '5 hours ago',
      hasImage: true
    },
    {
      id: 2,
      content: "Huge shout-out to the team at Canva for supporting Indigenous STEM pathways. Our RAP commitments are turning into real action — proud to be part of this work 💪",
      likes: 234,
      comments: 45,
      time: '2 days ago'
    },
    {
      id: 3,
      content: "Applications are open for the 2026 BHP Indigenous Apprenticeship Program in the Pilbara. If you know someone keen on a trades career, share this post!",
      likes: 189,
      comments: 67,
      time: '1 week ago'
    }
  ];

  const mockConnections = [
    { id: 1, name: 'Community Member', role: 'Program Manager at CareerTrackers', avatar: '👨🏿', trustLevel: 'trusted' },
    { id: 2, name: 'Community Member', role: 'Nurse at Royal Darwin Hospital', avatar: '👩🏽', trustLevel: 'verified' },
    { id: 3, name: 'Community Member', role: 'Engineer at Rio Tinto', avatar: '👨🏽', trustLevel: 'established' },
    { id: 4, name: 'Community Member', role: 'HR Advisor at Telstra', avatar: '👩🏻', trustLevel: 'trusted' }
  ];

  const mockGroups = [
    { id: 1, name: 'First Nations in Tech', members: 1247, icon: '💻' },
    { id: 2, name: 'Indigenous Women in STEM', members: 3456, icon: '👩‍🔬' },
    { id: 3, name: 'FIFO Workers Community', members: 892, icon: '⛏️' }
  ];

  const handleConnect = () => {
    if (connectionStatus === 'none') {
      setConnectionStatus('pending');
    } else if (connectionStatus === 'pending') {
      setConnectionStatus('none');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Celestial Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#151530] to-[#1a1a2e]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,215,0,0.15) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Cover Image */}
      <div className="h-48 md:h-56 bg-gradient-to-r from-purple-royal via-pink-blush/30 to-gold relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.3) 2px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Link 
          href="/feed" 
          className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          ←
        </Link>
        
        {/* More Options */}
        <button className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors">
          ⋮
        </button>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 max-w-4xl -mt-20 relative z-10">
        <div className="royal-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-royal to-pink-blush flex items-center justify-center text-6xl border-4 border-[#1a1a2e] shadow-lg">
                {user.avatar}
              </div>
              {/* Trust Badge */}
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-sm font-medium ${trustBadges[user.trustLevel].bg} ${trustBadges[user.trustLevel].color} flex items-center gap-1`}>
                {trustBadges[user.trustLevel].icon} {trustBadges[user.trustLevel].label}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                  <p className="text-white/70">{user.headline}</p>
                  <p className="text-white/50 text-sm mt-1">📍 {user.location}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleConnect}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald/20 text-emerald border border-emerald/30'
                        : connectionStatus === 'pending'
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'btn-cta-royal'
                    }`}
                  >
                    {connectionStatus === 'connected' ? '✓ Connected' : 
                     connectionStatus === 'pending' ? '⏳ Pending' : 'Connect'}
                  </button>
                  <button className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                    💬 Message
                  </button>
                  <button className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                    ⋮
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                <button className="text-center hover:opacity-80 transition-opacity">
                  <p className="text-xl font-bold text-gold">{user.connectionCount}</p>
                  <p className="text-sm text-white/60">Connections</p>
                </button>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <p className="text-xl font-bold text-purple-royal">{user.followerCount}</p>
                  <p className="text-sm text-white/60">Followers</p>
                </button>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <p className="text-xl font-bold text-emerald">{user.postCount}</p>
                  <p className="text-sm text-white/60">Posts</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-gold to-rose-gold text-black'
                  : 'bg-black/30 border border-white/10 text-white/70 hover:text-white hover:border-white/30'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count && <span className="opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'posts' && (
              <>
                {mockPosts.map(post => (
                  <div key={post.id} className="royal-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{user.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.name}</span>
                          <span className="text-emerald">✓</span>
                          <span className="text-white/40 text-sm">{post.time}</span>
                        </div>
                        <p className="text-white/80 mt-2">{post.content}</p>
                        
                        {post.hasImage && (
                          <div className="mt-3 aspect-video rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-4xl opacity-30">🖼️</span>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
                          <button className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors">
                            <span>❤️</span> {post.likes}
                          </button>
                          <button className="flex items-center gap-2 text-white/60 hover:text-light-blue transition-colors">
                            <span>💬</span> {post.comments}
                          </button>
                          <button className="flex items-center gap-2 text-white/60 hover:text-emerald transition-colors">
                            <span>↗️</span> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'about' && (
              <>
                <div className="royal-card p-6">
                  <h3 className="font-semibold text-white mb-4">Bio</h3>
                  <p className="text-white/70">{user.bio}</p>
                </div>
                
                <div className="royal-card p-6">
                  <h3 className="font-semibold text-white mb-4">Experience</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-light-blue/20 flex items-center justify-center text-2xl">
                      💼
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.currentRole.split(' at ')[0]}</p>
                      <p className="text-white/60">{user.currentRole.split(' at ')[1]}</p>
                      <p className="text-white/40 text-sm mt-1">Current</p>
                    </div>
                  </div>
                </div>
                
                <div className="royal-card p-6">
                  <h3 className="font-semibold text-white mb-4">Education</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-royal/20 flex items-center justify-center text-2xl">
                      🎓
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.education}</p>
                    </div>
                  </div>
                </div>
                
                <div className="royal-card p-6">
                  <h3 className="font-semibold text-white mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-white">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="royal-card p-6">
                  <h3 className="font-semibold text-white mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map(interest => (
                      <span key={interest} className="px-3 py-1 rounded-full text-sm bg-gold/10 border border-gold/20 text-gold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-4">
                {mockConnections.map(connection => (
                  <div key={connection.id} className="royal-card p-4 flex items-center gap-4">
                    <div className="text-3xl">{connection.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{connection.name}</span>
                        {connection.trustLevel !== 'basic' && connection.trustLevel !== 'new' && (
                          <span className={`text-sm ${trustBadges[connection.trustLevel].color}`}>
                            {trustBadges[connection.trustLevel].icon}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{connection.role}</p>
                    </div>
                    <button className="px-4 py-2 rounded-full text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-4">
                {mockGroups.map(group => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="royal-card p-4 flex items-center gap-4 hover:border-gold/30 transition-colors cursor-pointer">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-royal/30 to-pink-blush/30 flex items-center justify-center text-2xl">
                        {group.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{group.name}</h3>
                        <p className="text-white/60 text-sm">{group.members.toLocaleString()} members</p>
                      </div>
                      <span className="text-white/40">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="royal-card p-6">
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square rounded-lg bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-white/20 text-2xl">🖼️</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="royal-card p-4">
              <h3 className="font-semibold text-white mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.map(badge => (
                  <span key={badge} className="px-3 py-1 rounded-full text-sm bg-gold/10 text-gold">
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Mutual Connections */}
            <div className="royal-card p-4">
              <h3 className="font-semibold text-white mb-4">Mutual Connections</h3>
              <div className="flex -space-x-2 mb-2">
                {['👨🏿', '👩🏽', '👨🏻', '👩🏻'].map((avatar, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-royal/30 to-pink-blush/30 flex items-center justify-center text-lg border-2 border-[#1a1a2e]">
                    {avatar}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm text-white border-2 border-[#1a1a2e]">
                  +12
                </div>
              </div>
              <p className="text-sm text-white/60">16 mutual connections</p>
            </div>

            {/* Safety Note - Only show if safety mode is enhanced/maximum */}
            {(user.safetyMode === 'enhanced' || user.safetyMode === 'maximum') && (
              <div className="p-4 rounded-xl bg-pink-blush/10 border border-pink-blush/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-pink-blush">🛡️</span>
                  <span className="font-medium text-pink-blush text-sm">Safety Protected</span>
                </div>
                <p className="text-sm text-white/60">
                  This member has enhanced safety features enabled. Please be respectful in all interactions.
                </p>
              </div>
            )}

            {/* Report/Block */}
            <div className="royal-card p-4">
              <p className="text-sm text-white/40 mb-3">Having issues?</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                  🚫 Block
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                  🚨 Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
