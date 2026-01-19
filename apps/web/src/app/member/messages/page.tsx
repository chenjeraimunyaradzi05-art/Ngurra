/**
 * Messages & Inbox Page
 * 
 * Messaging center for member communications.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from '@/components/ui/OptimizedImage';
import { isCloudinaryPublicId } from '@/lib/cloudinary';

// Types
interface Message {
  id: string;
  content: string;
  sentAt: Date;
  isRead: boolean;
  isFromMe: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'EMPLOYER' | 'MENTOR' | 'MEMBER';
    company?: string;
    isOnline: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
  type: 'DIRECT' | 'JOB_INQUIRY' | 'MENTORSHIP';
  jobId?: string;
  jobTitle?: string;
}

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'Sarah Mitchell',
      role: 'EMPLOYER',
      company: 'BHP',
      isOnline: true,
    },
    lastMessage: {
      id: 'm1',
      content: "Hi! We've reviewed your application for the Senior Engineer role and would love to discuss further.",
      sentAt: new Date('2024-06-13T14:30:00'),
      isRead: false,
      isFromMe: false,
    },
    unreadCount: 2,
    type: 'JOB_INQUIRY',
    jobId: 'job1',
    jobTitle: 'Senior Software Engineer',
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'Dr. Emily Torres',
      role: 'MENTOR',
      isOnline: false,
    },
    lastMessage: {
      id: 'm2',
      content: "Looking forward to our session on Friday. Don't forget to bring your career goals list!",
      sentAt: new Date('2024-06-12T10:15:00'),
      isRead: true,
      isFromMe: false,
    },
    unreadCount: 0,
    type: 'MENTORSHIP',
  },
  {
    id: '3',
    participant: {
      id: 'user3',
      name: 'James Pearce',
      role: 'MEMBER',
      isOnline: true,
    },
    lastMessage: {
      id: 'm3',
      content: "Thanks for connecting! It would be great to chat about your experience in the mining industry.",
      sentAt: new Date('2024-06-11T16:45:00'),
      isRead: true,
      isFromMe: true,
    },
    unreadCount: 0,
    type: 'DIRECT',
  },
  {
    id: '4',
    participant: {
      id: 'user4',
      name: 'Indigenous Business Australia',
      role: 'EMPLOYER',
      company: 'IBA',
      isOnline: false,
    },
    lastMessage: {
      id: 'm4',
      content: "Congratulations! We're pleased to extend an offer for the Community Engagement Officer position.",
      sentAt: new Date('2024-06-10T09:00:00'),
      isRead: true,
      isFromMe: false,
    },
    unreadCount: 0,
    type: 'JOB_INQUIRY',
    jobId: 'job2',
    jobTitle: 'Community Engagement Officer',
  },
];

// Mock messages for selected conversation
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1a',
      content: "Hi there! Thank you for applying to the Senior Software Engineer position at BHP.",
      sentAt: new Date('2024-06-12T10:00:00'),
      isRead: true,
      isFromMe: false,
    },
    {
      id: 'm1b',
      content: "Thank you for considering my application! I'm very excited about this opportunity.",
      sentAt: new Date('2024-06-12T14:30:00'),
      isRead: true,
      isFromMe: true,
    },
    {
      id: 'm1c',
      content: "We've reviewed your application for the Senior Engineer role and would love to discuss further. Would you be available for a call this week?",
      sentAt: new Date('2024-06-13T14:30:00'),
      isRead: false,
      isFromMe: false,
    },
    {
      id: 'm1d',
      content: "Also, we noticed your experience with Indigenous community projects - this aligns well with our RAP initiatives.",
      sentAt: new Date('2024-06-13T14:32:00'),
      isRead: false,
      isFromMe: false,
    },
  ],
};

// Role colors
const ROLE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  EMPLOYER: { bg: 'bg-blue-900/50', text: 'text-blue-400', label: 'Employer' },
  MENTOR: { bg: 'bg-purple-900/50', text: 'text-purple-400', label: 'Mentor' },
  MEMBER: { bg: 'bg-slate-700', text: 'text-slate-400', label: 'Member' },
};

const TYPE_ICONS: Record<string, string> = {
  DIRECT: '💬',
  JOB_INQUIRY: '💼',
  MENTORSHIP: '🎓',
};

// Helper functions
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Conversation Item Component
function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: Conversation; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const roleConfig = ROLE_CONFIG[conversation.participant.role];
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left transition-colors ${
        isSelected 
          ? 'bg-slate-700' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
            {conversation.participant.avatarUrl ? (
              <Image
                src={conversation.participant.avatarUrl}
                alt={conversation.participant.name}
                width={48}
                height={48}
                cloudinary={isCloudinaryPublicId(conversation.participant.avatarUrl || '')}
              />
            ) : (
              <span className="text-lg font-bold text-slate-400">
                {conversation.participant.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          {conversation.participant.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium truncate ${
              conversation.unreadCount > 0 ? 'text-white' : 'text-slate-300'
            }`}>
              {conversation.participant.name}
            </span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatTime(conversation.lastMessage.sentAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {conversation.participant.company && (
              <span className="text-xs text-slate-500">{conversation.participant.company}</span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded ${roleConfig.bg} ${roleConfig.text}`}>
              {roleConfig.label}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className={`text-sm truncate ${
              conversation.unreadCount > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
            }`}>
              {conversation.lastMessage.isFromMe && (
                <span className="text-slate-500">You: </span>
              )}
              {conversation.lastMessage.content}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 w-5 h-5 bg-green-500 rounded-full text-xs text-white flex items-center justify-center flex-shrink-0">
                {conversation.unreadCount}
              </span>
            )}
          </div>

          {conversation.jobTitle && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-slate-600">{TYPE_ICONS.JOB_INQUIRY}</span>
              <span className="text-xs text-slate-500 truncate">{conversation.jobTitle}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${message.isFromMe ? 'order-2' : 'order-1'}`}>
        <div className={`px-4 py-2 rounded-2xl ${
          message.isFromMe 
            ? 'bg-green-600 text-white rounded-br-md' 
            : 'bg-slate-700 text-slate-200 rounded-bl-md'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <p className={`text-xs text-slate-500 mt-1 ${message.isFromMe ? 'text-right' : 'text-left'}`}>
          {formatMessageTime(message.sentAt)}
          {message.isFromMe && message.isRead && (
            <span className="ml-1">✓✓</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'employers' | 'mentors'>('all');

  useEffect(() => {
    const loadConversations = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setConversations(mockConversations);
      setLoading(false);
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedId && mockMessages[selectedId]) {
      setMessages(mockMessages[selectedId]);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'unread') return conv.unreadCount > 0;
    if (filter === 'employers') return conv.participant.role === 'EMPLOYER';
    if (filter === 'mentors') return conv.participant.role === 'MENTOR';
    return true;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedId) return;
    
    const message: Message = {
      id: `m${Date.now()}`,
      content: newMessage.trim(),
      sentAt: new Date(),
      isRead: false,
      isFromMe: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-sm text-slate-400">{totalUnread} unread messages</p>
            )}
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium">
            + New Message
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900">
          {/* Filters */}
          <div className="p-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'employers', label: 'Employers' },
                { key: 'mentors', label: 'Mentors' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === item.key
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedId === conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-slate-500">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">
                        {selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {selectedConversation.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedConversation.participant.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.participant.isOnline ? 'Online' : 'Offline'}
                      {selectedConversation.participant.company && ` · ${selectedConversation.participant.company}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConversation.jobTitle && (
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-xs">
                      💼 {selectedConversation.jobTitle}
                    </span>
                  )}
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-green-500 outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-medium text-white mt-4">Select a conversation</h3>
                <p className="text-slate-400 mt-2">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
