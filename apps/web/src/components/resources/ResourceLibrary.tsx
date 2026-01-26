'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../Button';
import api from '@/lib/apiClient';
import { toCloudinaryAutoUrl } from '@/lib/cloudinary';

/**
 * ResourceLibrary - Educational and career resources
 *
 * Features:
 * - Browse resources by category
 * - Download documents
 * - Video tutorials
 * - Cultural resources
 * - Career guides
 * - Bookmark and save resources
 */

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'article' | 'template' | 'guide' | 'toolkit';
  category: 'career' | 'education' | 'culture' | 'business' | 'health' | 'community' | 'technology';
  format?: 'pdf' | 'doc' | 'video' | 'web' | 'zip';
  url?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // for videos
  fileSize?: number; // bytes
  author?: {
    id: string;
    name: string;
    organization?: string;
  };
  tags: string[];
  isFeatured?: boolean;
  isIndigenousResource?: boolean;
  culturalContext?: string;
  viewCount: number;
  downloadCount: number;
  rating?: number;
  ratingCount?: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ResourceCollection interface available for future use

function normalizeResourceCategory(category: string | undefined): Resource['category'] {
  const c = String(category || '').toLowerCase();
  if (c.includes('culture') || c.includes('cultural')) return 'culture';
  if (c.includes('educ') || c.includes('training') || c.includes('course')) return 'education';
  if (c.includes('health') || c.includes('wellness')) return 'health';
  if (c.includes('business') || c.includes('finance') || c.includes('grant')) return 'business';
  if (c.includes('community')) return 'community';
  if (c.includes('tech') || c.includes('digital') || c.includes('software')) return 'technology';
  return 'career';
}

function normalizeResourceType(type: string | undefined): Resource['type'] {
  const t = String(type || '').toLowerCase();
  if (t.includes('video') || t.includes('webinar')) return 'video';
  if (t.includes('template')) return 'template';
  if (t.includes('toolkit')) return 'toolkit';
  if (t.includes('article')) return 'article';
  if (t.includes('guide') || t.includes('course') || t.includes('ebook')) return 'guide';
  return 'document';
}

function mapApiResourceToUi(r: any): Resource {
  const publishedAt = r.publishedAt || r.createdAt || new Date().toISOString();
  const updatedAt = r.updatedAt || publishedAt;
  return {
    id: String(r.id),
    title: r.title,
    description: r.description || '',
    type: normalizeResourceType(r.type),
    category: normalizeResourceCategory(r.category),
    format: undefined,
    url: r.url || r.contentUrl || undefined,
    downloadUrl: r.downloadUrl || r.url || undefined,
    thumbnailUrl: r.thumbnailUrl || r.thumbnail || undefined,
    duration: r.duration || undefined,
    fileSize: r.fileSize || undefined,
    author: r.author
      ? {
          id: String(r.author.id ?? 'author'),
          name: r.author.name || 'Ngurra Pathways',
          organization: r.author.organization,
        }
      : undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    isFeatured: !!r.isFeatured,
    isIndigenousResource: !!r.isIndigenous || !!r.isIndigenousResource,
    culturalContext: r.culturalContext,
    viewCount: Number(r.viewCount ?? r.views ?? 0),
    downloadCount: Number(r.downloadCount ?? r.downloads ?? 0),
    rating: r.rating,
    ratingCount: r.ratingCount,
    isBookmarked: !!r.isBookmarked,
    createdAt: new Date(publishedAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
  };
}

// API functions
const resourcesApi = {
  async getResources(params?: {
    category?: string;
    type?: string;
    search?: string;
    featured?: boolean;
  }): Promise<{ resources: Resource[] }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.featured) searchParams.set('featured', 'true');

    const response = await api(`/resources?${searchParams.toString()}`);
    if (!response.ok) return { resources: [] };

    const data = response.data;
    return { resources: (data?.resources || []).map(mapApiResourceToUi) };
  },

  async getResource(id: string): Promise<Resource> {
    const response = await api(`/resources/${id}`);
    if (!response.ok || !response.data) throw new Error('Failed to load resource');
    return mapApiResourceToUi(response.data);
  },

  async getBookmarked(): Promise<{ resources: Resource[] }> {
    const response = await api('/resources/bookmarked');
    if (!response.ok) return { resources: [] };

    const data = response.data;
    // Handle both array and object response formats
    const items = Array.isArray(data?.resources) ? data.resources : Array.isArray(data) ? data : [];

    return { resources: items.map(mapApiResourceToUi) };
  },

  async bookmarkResource(id: string): Promise<void> {
    await api(`/resources/${id}/bookmark`, { method: 'POST' });
  },

  async unbookmarkResource(id: string): Promise<void> {
    await api(`/resources/${id}/bookmark`, { method: 'DELETE' });
  },

  async rateResource(id: string, rating: number): Promise<void> {
    await api(`/resources/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
  },

  async trackDownload(id: string): Promise<void> {
    await api(`/resources/${id}/download`, { method: 'POST' });
  },
};

// Resource type config
const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  document: { icon: '📄', label: 'Document', color: 'blue' },
  video: { icon: '🎥', label: 'Video', color: 'red' },
  article: { icon: '📰', label: 'Article', color: 'green' },
  template: { icon: '📋', label: 'Template', color: 'purple' },
  guide: { icon: '📖', label: 'Guide', color: 'orange' },
  toolkit: { icon: '🧰', label: 'Toolkit', color: 'teal' },
};

// Category config
const categoryConfig: Record<string, { icon: string; label: string; description: string }> = {
  career: {
    icon: '💼',
    label: 'Career',
    description: 'Resume templates, interview tips, career planning',
  },
  education: {
    icon: '🎓',
    label: 'Education',
    description: 'Study guides, courses, certifications',
  },
  culture: {
    icon: '🎨',
    label: 'Culture',
    description: 'Indigenous knowledge, cultural practices, language resources',
  },
  business: {
    icon: '📊',
    label: 'Business',
    description: 'Business planning, grants, procurement',
  },
  health: {
    icon: '💚',
    label: 'Health & Wellbeing',
    description: 'Mental health, wellness, self-care',
  },
  community: {
    icon: '👥',
    label: 'Community',
    description: 'Community building, leadership, volunteering',
  },
  technology: {
    icon: '💻',
    label: 'Technology',
    description: 'Digital skills, software tutorials, tech careers',
  },
};

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

// Star rating component
function StarRating({
  rating: _rating,
  count,
  interactive = false,
  onRate,
}: {
  rating?: number;
  count?: number;
  interactive?: boolean;
  onRate?: (_value: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const displayRating = hoverRating !== null ? hoverRating : _rating || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <svg
            className={`w-4 h-4 ${
              star <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {count !== undefined && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  );
}

// Resource Card Component
function ResourceCard({
  resource,
  onView,
  onBookmark,
  onDownload,
}: {
  resource: Resource;
  onView: () => void;
  onBookmark: () => void;
  onDownload: () => void;
}) {
  const typeInfo = typeConfig[resource.type] || typeConfig.document;
  const categoryInfo = categoryConfig[resource.category] || categoryConfig.career;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onView}
    >
      {/* Thumbnail */}
      {resource.thumbnailUrl ? (
        <div className="relative h-36 bg-gray-100 dark:bg-gray-900">
          <img
            src={toCloudinaryAutoUrl(resource.thumbnailUrl)}
            alt=""
            className="w-full h-full object-cover"
          />
          {resource.type === 'video' && resource.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
              {formatDuration(resource.duration)}
            </span>
          )}
          {resource.isFeatured && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
              Featured
            </span>
          )}
        </div>
      ) : (
        <div
          className={`h-24 bg-gradient-to-br from-${typeInfo.color}-400 to-${typeInfo.color}-600 flex items-center justify-center`}
        >
          <span className="text-4xl">{typeInfo.icon}</span>
        </div>
      )}

      <div className="p-4">
        {/* Type & Category */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-400`}
          >
            {typeInfo.label}
          </span>
          <span className="text-xs text-gray-500">
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          {resource.isIndigenousResource && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
              🤝
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>

        {/* Author */}
        {resource.author && (
          <p className="text-xs text-gray-400 mt-2">
            By {resource.author.name}
            {resource.author.organization && ` · ${resource.author.organization}`}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {resource.rating !== undefined && (
              <StarRating rating={resource.rating} count={resource.ratingCount} />
            )}
            <span>{resource.viewCount.toLocaleString()} views</span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                resource.isBookmarked
                  ? 'text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg
                className={`w-5 h-5 ${resource.isBookmarked ? 'fill-current' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
            {resource.downloadUrl && (
              <button
                onClick={onDownload}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Resource Detail Modal
function ResourceDetailModal({
  resource,
  onClose,
  onBookmark,
  onDownload,
  onRate,
}: {
  resource: Resource;
  onClose: () => void;
  onBookmark: () => void;
  onDownload: () => void;
  onRate: (_value: number) => void;
}) {
  const typeInfo = typeConfig[resource.type] || typeConfig.document;
  const categoryInfo = categoryConfig[resource.category] || categoryConfig.career;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-400`}
            >
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span className="text-sm text-gray-500">
              {categoryInfo.icon} {categoryInfo.label}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Video Player */}
          {resource.type === 'video' && resource.url && (
            <div className="mb-6 aspect-video bg-black rounded-xl overflow-hidden">
              <video
                src={resource.url}
                controls
                className="w-full h-full"
                poster={resource.thumbnailUrl}
              />
            </div>
          )}

          {/* Thumbnail for non-video */}
          {resource.type !== 'video' && resource.thumbnailUrl && (
            <div className="mb-6 h-48 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={toCloudinaryAutoUrl(resource.thumbnailUrl)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {resource.title}
          </h1>

          {/* Author */}
          {resource.author && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <span>By {resource.author.name}</span>
              {resource.author.organization && (
                <>
                  <span>·</span>
                  <span>{resource.author.organization}</span>
                </>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {resource.viewCount.toLocaleString()} views
            </div>
            {resource.downloadCount > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {resource.downloadCount.toLocaleString()} downloads
              </div>
            )}
            {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
            {resource.duration && <span>{formatDuration(resource.duration)}</span>}
          </div>

          {/* Cultural Context */}
          {resource.culturalContext && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500 mb-6">
              <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                Cultural Context
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {resource.culturalContext}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            {resource.description.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Rate this resource</h3>
            <StarRating
              rating={resource.rating}
              count={resource.ratingCount}
              interactive
              onRate={onRate}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(resource.updatedAt).toLocaleDateString('en-AU')}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBookmark}>
              <svg
                className={`w-4 h-4 mr-2 ${resource.isBookmarked ? 'fill-current text-yellow-500' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {resource.isBookmarked ? 'Saved' : 'Save'}
            </Button>
            {resource.downloadUrl && (
              <Button onClick={onDownload}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </Button>
            )}
            {resource.url && resource.type !== 'video' && (
              <Button onClick={() => window.open(resource.url, '_blank')}>View Resource</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function ResourceLibrary() {
  useAuth(); // Check auth status but don't need the user object

  const [resources, setResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [view, setView] = useState<'browse' | 'saved'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ category?: string; type?: string }>({});

  const loadResources = useCallback(async () => {
    setIsLoading(true);

    // Safety timeout to prevent infinite spinner
    const timeoutId = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        console.warn('Resource loading timed out - forcing completion');
        setIsLoading(false);
      }
    }, 12000);

    try {
      const [resourcesRes, bookmarkedRes] = await Promise.all([
        resourcesApi.getResources({
          ...filters,
          search: searchQuery || undefined,
        }),
        resourcesApi.getBookmarked(),
      ]);
      setResources(resourcesRes.resources || []);
      setBookmarkedResources(bookmarkedRes.resources || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
      // Ensure we at least show empty state rather than spinning forever
      setResources([]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleBookmark = async (resource: Resource) => {
    try {
      if (resource.isBookmarked) {
        await resourcesApi.unbookmarkResource(resource.id);
      } else {
        await resourcesApi.bookmarkResource(resource.id);
      }
      // Update local state
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, isBookmarked: !r.isBookmarked } : r)),
      );
      if (selectedResource?.id === resource.id) {
        setSelectedResource((prev) =>
          prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null,
        );
      }
      await loadResources(); // Refresh bookmarked list
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.downloadUrl) {
      await resourcesApi.trackDownload(resource.id);
      window.open(resource.downloadUrl, '_blank');
    }
  };

  const handleRate = async (resource: Resource, rating: number) => {
    try {
      await resourcesApi.rateResource(resource.id, rating);
      setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, rating } : r)));
    } catch (error) {
      console.error('Failed to rate resource:', error);
    }
  };

  const displayedResources = view === 'saved' ? bookmarkedResources : resources;
  const featuredResources = resources.filter((r) => r.isFeatured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

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
            <a href="/" className="text-indigo-200 hover:text-white transition-colors">
              Home
            </a>
            <svg
              className="w-4 h-4 text-indigo-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Resources</span>
          </nav>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Career Development</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Resource Library</h1>
            <p className="text-xl text-indigo-100">
              Career guides, templates, tutorials, and cultural resources to support your
              professional journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Card */}
        <div className="-mt-8 mb-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by title, description..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filters.category || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, category: e.target.value || undefined }))
                  }
                  className="px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 appearance-none cursor-pointer transition-all min-w-[160px]"
                >
                  <option value="">All Categories</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.type || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value || undefined }))
                  }
                  className="px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-slate-900 appearance-none cursor-pointer transition-all min-w-[140px]"
                >
                  <option value="">All Types</option>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setView('browse')}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all ${
              view === 'browse'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            Browse All
          </button>
          <button
            onClick={() => setView('saved')}
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all ${
              view === 'saved'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            Saved ({bookmarkedResources.length})
          </button>
        </div>

        {/* Featured Resources */}
        {view === 'browse' &&
          !filters.category &&
          !filters.type &&
          !searchQuery &&
          featuredResources.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Resources</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredResources.slice(0, 3).map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={() => setSelectedResource(resource)}
                    onBookmark={() => handleBookmark(resource)}
                    onDownload={() => handleDownload(resource)}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Category Quick Links */}
        {view === 'browse' && !filters.category && !searchQuery && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFilters((prev) => ({ ...prev, category: key }))}
                  className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all text-left"
                >
                  <span className="text-4xl mb-3 block">{config.icon}</span>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {config.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{config.description}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Resources Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {view === 'saved'
                ? 'Saved Resources'
                : filters.category
                  ? categoryConfig[filters.category]?.label
                  : 'All Resources'}
            </h2>
          </div>

          {displayedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onView={() => setSelectedResource(resource)}
                  onBookmark={() => handleBookmark(resource)}
                  onDownload={() => handleDownload(resource)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-slate-900">
                {view === 'saved' ? 'No saved resources' : 'No resources found'}
              </h3>
              <p className="text-slate-500 mt-2">
                {view === 'saved'
                  ? 'Save resources to access them later'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onBookmark={() => handleBookmark(selectedResource)}
          onDownload={() => handleDownload(selectedResource)}
          onRate={(rating) => handleRate(selectedResource, rating)}
        />
      )}
    </div>
  );
}

export default ResourceLibrary;
