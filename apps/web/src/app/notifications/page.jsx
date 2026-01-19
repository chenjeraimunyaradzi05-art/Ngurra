'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Sparkles, Settings } from 'lucide-react';

// Feminine theme constants
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

/**
 * Notifications Page
 * Social networking notifications for feed activity
 */
export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    // Social Interactions
    { id: 1, type: 'like', read: false, time: '2m ago', 
      user: { name: 'Sarah M.', avatar: '👩🏽' },
      content: 'liked your post about career development',
      link: '/feed' },
    { id: 2, type: 'comment', read: false, time: '15m ago',
      user: { name: 'James K.', avatar: '👨🏿' },
      content: 'commented on your post: "Great insights! Thanks for sharing..."',
      link: '/feed' },
    { id: 3, type: 'mention', read: false, time: '1h ago',
      user: { name: 'Lisa P.', avatar: '👩🏻' },
      content: 'mentioned you in a comment',
      link: '/feed' },
    // Connections
    { id: 4, type: 'connection_request', read: false, time: '2h ago',
      user: { name: 'David W.', avatar: '👨🏽', trustLevel: 'established' },
      content: 'wants to connect with you',
      link: '/profile/david-w' },
    { id: 5, type: 'connection_accepted', read: true, time: '3h ago',
      user: { name: 'Elder Mary T.', avatar: '👩🏽', trustLevel: 'verified' },
      content: 'accepted your connection request',
      link: '/profile/mary-t' },
    // Groups
    { id: 6, type: 'group_invite', read: true, time: '5h ago',
      group: { name: 'First Nations Tech Careers', icon: '💻' },
      content: 'You\'ve been invited to join',
      link: '/groups/1' },
    { id: 7, type: 'group_mention', read: true, time: '1d ago',
      user: { name: 'Sarah M.', avatar: '👩🏽' },
      group: { name: 'Women in STEM', icon: '👩‍🔬' },
      content: 'mentioned you in Women in STEM',
      link: '/groups/2' },
    // Organizations
    { id: 8, type: 'org_update', read: true, time: '1d ago',
      org: { name: 'First Nations Dev Corp', icon: '🏢' },
      content: 'posted a new job: Senior Developer',
      link: '/organizations/1' },
    // System/Safety
    { id: 9, type: 'safety', read: true, time: '2d ago',
      content: 'Your safety mode has been upgraded to Enhanced',
      link: '/settings/safety' },
    { id: 10, type: 'milestone', read: true, time: '3d ago',
      content: 'Congratulations! You\'ve reached 100 connections 🎉',
      link: '/profile' }
  ]);

  const filters = [
    { id: 'all', label: 'All', icon: '🔔' },
    { id: 'social', label: 'Social', icon: '❤️' },
    { id: 'connections', label: 'Connections', icon: '👥' },
    { id: 'groups', label: 'Groups', icon: '💬' },
    { id: 'organizations', label: 'Organizations', icon: '🏢' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'love': return '💕';
      case 'support': return '🤗';
      case 'celebrate': return '🎉';
      case 'insightful': return '💡';
      case 'curious': return '🤔';
      case 'comment': return '💬';
      case 'mention': return '@';
      case 'connection_request': return '👋';
      case 'connection_accepted': return '✓';
      case 'follow': return '👀';
      case 'group_invite': return '📨';
      case 'group_mention': return '💬';
      case 'group_post': return '📝';
      case 'org_update': return '📢';
      case 'org_job': return '💼';
      case 'safety': return '🛡️';
      case 'milestone': return '🏆';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like': case 'love': return 'text-scarlet';
      case 'support': return 'text-pink-blush';
      case 'celebrate': case 'milestone': return 'text-gold';
      case 'insightful': return 'text-light-blue';
      case 'curious': return 'text-purple-royal';
      case 'comment': case 'mention': case 'group_mention': return 'text-light-blue';
      case 'connection_request': case 'connection_accepted': return 'text-emerald';
      case 'group_invite': return 'text-purple-royal';
      case 'org_update': case 'org_job': return 'text-gold';
      case 'safety': return 'text-pink-blush';
      default: return 'text-white';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'social') return ['like', 'love', 'support', 'celebrate', 'insightful', 'curious', 'comment', 'mention'].includes(n.type);
    if (activeFilter === 'connections') return ['connection_request', 'connection_accepted', 'follow'].includes(n.type);
    if (activeFilter === 'groups') return ['group_invite', 'group_mention', 'group_post'].includes(n.type);
    if (activeFilter === 'organizations') return ['org_update', 'org_job'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const trustBadges = {
    verified: { icon: '✓', color: 'text-emerald' },
    trusted: { icon: '⭐', color: 'text-gold' },
    established: { icon: '💎', color: 'text-purple-royal' }
  };

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
      {/* Decorative Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-40"
          style={{ background: `radial-gradient(circle, ${accentPink}33 0%, transparent 70%)`, filter: 'blur(40px)' }}
        />
        <div 
          className="absolute top-1/3 -left-40 w-80 h-80 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${accentPurple}33 0%, transparent 70%)`, filter: 'blur(40px)' }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/feed" className="p-2 rounded-full hover:bg-white/60 transition-colors text-slate-600">
              ← 
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-600" />
                <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
              </div>
              {unreadCount > 0 && (
                <p className="text-slate-500 text-sm">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeFilter === filter.id
                  ? 'text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-pink-300'
              }`}
              style={activeFilter === filter.id ? {
                background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
              } : {}}
            >
              <span>{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center" style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}>
              <span className="text-4xl mb-4 block">🔔</span>
              <p className="text-slate-500">No notifications in this category</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <Link 
                key={notification.id}
                href={notification.link}
                onClick={() => markAsRead(notification.id)}
              >
                <div 
                  className={`bg-white border rounded-xl p-4 hover:border-pink-300 transition-colors cursor-pointer ${
                    !notification.read ? 'border-pink-200 bg-pink-50/50' : 'border-slate-200'
                  }`}
                  style={{ boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon/Avatar */}
                    <div className="relative">
                      {notification.user ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-2xl border-2 border-pink-200">
                          {notification.user.avatar}
                        </div>
                      ) : notification.group ? (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl border-2 border-purple-200">
                          {notification.group.icon}
                        </div>
                      ) : notification.org ? (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center text-2xl border-2 border-blue-200">
                          {notification.org.icon}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-2xl border-2 border-pink-200">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      {/* Type badge */}
                      {notification.user && (
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm border border-slate-200 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800">
                        {notification.user && (
                          <span className="font-medium">
                            {notification.user.name}
                            {notification.user.trustLevel && (
                              <span className={`ml-1 ${trustBadges[notification.user.trustLevel]?.color}`}>
                                {trustBadges[notification.user.trustLevel]?.icon}
                              </span>
                            )}
                          </span>
                        )}
                        {notification.group && !notification.user && (
                          <span className="font-medium">{notification.group.name}</span>
                        )}
                        {notification.org && (
                          <span className="font-medium">{notification.org.name}</span>
                        )}
                        {' '}
                        <span className="text-slate-600">{notification.content}</span>
                      </p>
                      <p className="text-slate-400 text-sm mt-1">{notification.time}</p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: accentPink }} />
                    )}
                  </div>
                  
                  {/* Action buttons for connection requests */}
                  {notification.type === 'connection_request' && !notification.read && (
                    <div className="flex gap-2 mt-3 ml-15">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="px-4 py-1.5 rounded-full text-sm text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)` }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="px-4 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  
                  {/* Action buttons for group invites */}
                  {notification.type === 'group_invite' && !notification.read && (
                    <div className="flex gap-2 mt-3 ml-15">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="px-4 py-1.5 rounded-full text-sm text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${accentPurple} 0%, ${accentPink} 100%)` }}
                      >
                        Join Group
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="px-4 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-pink-600 hover:text-pink-700 font-medium">
              Load older notifications
            </button>
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <Link href="/settings/notifications" className="inline-flex items-center gap-2 text-slate-500 hover:text-pink-600 text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Notification Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
