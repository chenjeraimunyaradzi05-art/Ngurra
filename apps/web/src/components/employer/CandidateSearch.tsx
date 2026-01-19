'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../Button';
import { toCloudinaryAutoUrl } from '@/lib/cloudinary';

/**
 * CandidateSearch - Employer candidate search and discovery
 * 
 * Features:
 * - Advanced search filters
 * - Saved searches
 * - Candidate profiles
 * - Shortlist management
 */

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  headline: string;
  location: string;
  isIndigenous: boolean;
  skills: string[];
  experience: string;
  education: string;
  availability: string;
  lastActive: string;
  matchScore: number;
  isBookmarked: boolean;
  isContacted: boolean;
}

interface SearchFilters {
  query: string;
  location: string;
  radius: number;
  skills: string[];
  experience: string;
  education: string;
  availability: string;
  industries: string[];
  indigenousOnly: boolean;
  remoteOk: boolean;
  relocateOk: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  candidateCount: number;
  createdAt: string;
}

interface Shortlist {
  id: string;
  name: string;
  candidateCount: number;
  jobId?: string;
  jobTitle?: string;
}

const SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS',
  'Project Management', 'Data Analysis', 'Communication', 'Leadership',
  'Customer Service', 'Microsoft Office', 'Accounting', 'Marketing',
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Education', 'Government', 'Mining',
  'Agriculture', 'Tourism', 'Arts & Culture', 'Community Services',
  'Professional Services', 'Construction', 'Retail',
];

// API functions
const searchApi = {
  async searchCandidates(filters: SearchFilters, page: number): Promise<{ candidates: Candidate[]; total: number }> {
    const res = await fetch('/api/employer/candidates/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ filters, page }),
    });
    if (!res.ok) throw new Error('Failed to search candidates');
    return res.json();
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    const res = await fetch('/api/employer/candidates/saved-searches', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch saved searches');
    return res.json();
  },

  async saveSearch(name: string, filters: SearchFilters): Promise<SavedSearch> {
    const res = await fetch('/api/employer/candidates/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, filters }),
    });
    if (!res.ok) throw new Error('Failed to save search');
    return res.json();
  },

  async deleteSavedSearch(id: string): Promise<void> {
    const res = await fetch(`/api/employer/candidates/saved-searches/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete search');
  },

  async getShortlists(): Promise<Shortlist[]> {
    const res = await fetch('/api/employer/candidates/shortlists', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch shortlists');
    return res.json();
  },

  async addToShortlist(shortlistId: string, candidateId: string): Promise<void> {
    const res = await fetch(`/api/employer/candidates/shortlists/${shortlistId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ candidateId }),
    });
    if (!res.ok) throw new Error('Failed to add to shortlist');
  },

  async bookmarkCandidate(candidateId: string): Promise<void> {
    const res = await fetch(`/api/employer/candidates/${candidateId}/bookmark`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to bookmark');
  },

  async contactCandidate(candidateId: string, message: string): Promise<void> {
    const res = await fetch(`/api/employer/candidates/${candidateId}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to contact');
  },
};

// Search Filters Panel
function FiltersPanel({
  filters,
  onChange,
  onSearch,
  onReset,
}: {
  filters: SearchFilters;
  onChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills);

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    onChange({ skills: newSkills });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>

      <div className="space-y-4">
        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Keywords
          </label>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Skills, job titles, keywords..."
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="City, State, or Postcode"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="10"
              max="500"
              value={filters.radius}
              onChange={(e) => onChange({ radius: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-16">{filters.radius} km</span>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Experience Level
          </label>
          <select
            value={filters.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">Any experience</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior (6-10 years)</option>
            <option value="executive">Executive (10+ years)</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={(e) => onChange({ availability: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">Any availability</option>
            <option value="immediate">Immediately available</option>
            <option value="2weeks">Within 2 weeks</option>
            <option value="1month">Within 1 month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.indigenousOnly}
              onChange={(e) => onChange({ indigenousOnly: e.target.checked })}
              className="w-4 h-4 rounded text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Indigenous candidates only
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remoteOk}
              onChange={(e) => onChange({ remoteOk: e.target.checked })}
              className="w-4 h-4 rounded text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Open to remote work
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.relocateOk}
              onChange={(e) => onChange({ relocateOk: e.target.checked })}
              className="w-4 h-4 rounded text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Willing to relocate
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={onSearch} className="flex-1">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

// Candidate Card
function CandidateCard({
  candidate,
  onBookmark,
  onContact,
  onAddToShortlist,
}: {
  candidate: Candidate;
  onBookmark: () => void;
  onContact: () => void;
  onAddToShortlist: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {candidate.avatar ? (
            <img src={toCloudinaryAutoUrl(candidate.avatar)} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-400">👤</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {candidate.firstName} {candidate.lastName}
                </h4>
                {candidate.isIndigenous && (
                  <span className="text-sm" title="Indigenous Australian">🌏</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.headline}</p>
              <p className="text-sm text-gray-500">📍 {candidate.location}</p>
            </div>

            {/* Match Score */}
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  candidate.matchScore >= 80
                    ? 'text-green-600'
                    : candidate.matchScore >= 60
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {candidate.matchScore}%
              </div>
              <div className="text-xs text-gray-500">match</div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="text-xs text-gray-500">+{candidate.skills.length - 5} more</span>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>💼 {candidate.experience}</span>
            <span>🎓 {candidate.education}</span>
            <span>⏰ {candidate.availability}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400">
              Active {candidate.lastActive}
              {candidate.isContacted && ' • Contacted'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onBookmark}
                className={`p-2 rounded-lg ${
                  candidate.isBookmarked
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                }`}
              >
                {candidate.isBookmarked ? '⭐' : '☆'}
              </button>
              <button
                onClick={onAddToShortlist}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                📋
              </button>
              <Button size="sm" onClick={onContact}>
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Saved Searches Sidebar
function SavedSearchesSidebar({
  searches,
  onLoad,
  onDelete,
}: {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Saved Searches</h4>
      {searches.length === 0 ? (
        <p className="text-sm text-gray-500">No saved searches yet</p>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <button onClick={() => onLoad(search)} className="text-left flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{search.name}</p>
                <p className="text-xs text-gray-500">{search.candidateCount} candidates</p>
              </button>
              <button onClick={() => onDelete(search.id)} className="text-gray-400 hover:text-red-500">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Contact Modal
function ContactModal({
  isOpen,
  candidate,
  onClose,
  onSend,
}: {
  isOpen: boolean;
  candidate: Candidate | null;
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Contact {candidate.firstName}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Send a message to express your interest in this candidate
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 mb-4"
          placeholder="Hello, I came across your profile and would love to discuss an opportunity..."
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSend(message)} disabled={!message.trim()} className="flex-1">
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}

// Save Search Modal
function SaveSearchModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Save Search
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 mb-4"
          placeholder="Search name..."
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => { onSave(name); setName(''); }} disabled={!name.trim()} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function CandidateSearch() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    radius: 50,
    skills: [],
    experience: '',
    education: '',
    availability: '',
    industries: [],
    indigenousOnly: false,
    remoteOk: false,
    relocateOk: false,
  });
  const [contactCandidate, setContactCandidate] = useState<Candidate | null>(null);
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  const loadSavedSearches = useCallback(async () => {
    try {
      const data = await searchApi.getSavedSearches();
      setSavedSearches(data);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, []);

  const loadShortlists = useCallback(async () => {
    try {
      const data = await searchApi.getShortlists();
      setShortlists(data);
    } catch (error) {
      console.error('Failed to load shortlists:', error);
    }
  }, []);

  useEffect(() => {
    loadSavedSearches();
    loadShortlists();
  }, [loadSavedSearches, loadShortlists]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const { candidates: results, total } = await searchApi.searchCandidates(filters, page);
      setCandidates(results);
      setTotalResults(total);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      location: '',
      radius: 50,
      skills: [],
      experience: '',
      education: '',
      availability: '',
      industries: [],
      indigenousOnly: false,
      remoteOk: false,
      relocateOk: false,
    });
  };

  const handleSaveSearch = async (name: string) => {
    try {
      await searchApi.saveSearch(name, filters);
      loadSavedSearches();
      setShowSaveSearch(false);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    handleSearch();
  };

  const handleBookmark = async (candidateId: string) => {
    try {
      await searchApi.bookmarkCandidate(candidateId);
      setCandidates(candidates.map(c =>
        c.id === candidateId ? { ...c, isBookmarked: !c.isBookmarked } : c
      ));
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const handleContact = async (message: string) => {
    if (!contactCandidate) return;
    try {
      await searchApi.contactCandidate(contactCandidate.id, message);
      setCandidates(candidates.map(c =>
        c.id === contactCandidate.id ? { ...c, isContacted: true } : c
      ));
      setContactCandidate(null);
    } catch (error) {
      console.error('Failed to contact:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Candidates</h1>
          <p className="text-gray-500 mt-1">Search and discover qualified talent</p>
        </div>
        {candidates.length > 0 && (
          <Button variant="outline" onClick={() => setShowSaveSearch(true)}>
            💾 Save Search
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <FiltersPanel
            filters={filters}
            onChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
            onSearch={handleSearch}
            onReset={handleResetFilters}
          />
          <SavedSearchesSidebar
            searches={savedSearches}
            onLoad={handleLoadSearch}
            onDelete={async (id) => {
              await searchApi.deleteSavedSearch(id);
              loadSavedSearches();
            }}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Search for candidates
              </h3>
              <p className="text-gray-500">
                Use the filters to find qualified candidates that match your requirements
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Found <strong>{totalResults}</strong> candidates
                </p>
                <select className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-sm">
                  <option>Best Match</option>
                  <option>Most Recent</option>
                  <option>Experience</option>
                </select>
              </div>

              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onBookmark={() => handleBookmark(candidate.id)}
                    onContact={() => setContactCandidate(candidate)}
                    onAddToShortlist={() => {/* TODO */}}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalResults > 20 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); handleSearch(); }}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {page} of {Math.ceil(totalResults / 20)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(totalResults / 20)}
                    onClick={() => { setPage(p => p + 1); handleSearch(); }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={!!contactCandidate}
        candidate={contactCandidate}
        onClose={() => setContactCandidate(null)}
        onSend={handleContact}
      />

      <SaveSearchModal
        isOpen={showSaveSearch}
        onClose={() => setShowSaveSearch(false)}
        onSave={handleSaveSearch}
      />
    </div>
  );
}

export default CandidateSearch;
