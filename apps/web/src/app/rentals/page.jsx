'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_FILTERS = {
  suburb: '',
  state: '',
  minRent: '',
  maxRent: '',
  bedrooms: '',
  status: 'ACTIVE',
};

export default function RentalsPage() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdListingIds, setCreatedListingIds] = useState(() => new Set());
  const [inquiryMessages, setInquiryMessages] = useState({});
  const [sendingInquiryIds, setSendingInquiryIds] = useState(() => new Set());
  const [ownerInquiries, setOwnerInquiries] = useState([]);
  const [loadingOwnerInquiries, setLoadingOwnerInquiries] = useState(false);
  const [seekerProfile, setSeekerProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSeekerForm, setShowSeekerForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    budgetMin: '',
    budgetMax: '',
    preferredSuburbs: '',
    preferredStates: '',
    propertyTypes: '',
    bedroomsMin: '',
    bathroomsMin: '',
    notes: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    suburb: '',
    state: '',
    postcode: '',
    weeklyRent: '',
    bedrooms: '',
    bathrooms: '',
    availableFrom: '',
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.suburb) params.set('suburb', filters.suburb);
    if (filters.state) params.set('state', filters.state);
    if (filters.minRent) params.set('minRent', filters.minRent);
    if (filters.maxRent) params.set('maxRent', filters.maxRent);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.status) params.set('status', filters.status);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError(null);
      try {
        const { ok, data } = await api(`/rentals?${queryParams}`);
        if (!ok) throw new Error(data?.error || 'Failed to load rentals');
        setListings(data?.listings || []);
        setTotal(data?.total ?? 0);
      } catch (err) {
        setError(err?.message || 'Failed to load rentals');
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [queryParams]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadProfile() {
      try {
        const { ok, data } = await api('/rentals/seekers/profile');
        if (!ok) throw new Error(data?.error || 'Failed to load profile');
        setSeekerProfile(data?.profile || null);
        if (data?.profile) {
          setProfileForm({
            budgetMin: data.profile.budgetMin ?? '',
            budgetMax: data.profile.budgetMax ?? '',
            preferredSuburbs: (data.profile.preferredSuburbs || []).join(', '),
            preferredStates: (data.profile.preferredStates || []).join(', '),
            propertyTypes: (data.profile.propertyTypes || []).join(', '),
            bedroomsMin: data.profile.bedroomsMin ?? '',
            bathroomsMin: data.profile.bathroomsMin ?? '',
            notes: data.profile.notes ?? '',
          });
        }
      } catch (err) {
        setError(err?.message || 'Failed to load profile');
      }
    }

    async function loadOwnerInquiries() {
      setLoadingOwnerInquiries(true);
      try {
        const { ok, data } = await api('/rentals/inquiries/owner');
        if (!ok) throw new Error(data?.error || 'Failed to load inquiries');
        setOwnerInquiries(data?.inquiries || []);
      } catch (err) {
        setError(err?.message || 'Failed to load inquiries');
      } finally {
        setLoadingOwnerInquiries(false);
      }
    }

    loadProfile();
    loadOwnerInquiries();
  }, [isAuthenticated]);

  async function handleCreateListing(e) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setCreating(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        suburb: form.suburb || undefined,
        state: form.state || undefined,
        postcode: form.postcode || undefined,
        weeklyRent: form.weeklyRent ? Number(form.weeklyRent) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : undefined,
      };

      const { ok, data } = await api('/rentals', { method: 'POST', body: payload });
      if (!ok) throw new Error(data?.error || 'Failed to create listing');

      if (data?.listing) {
        setListings((prev) => [data.listing, ...prev]);
        setCreatedListingIds((prev) => new Set(prev).add(data.listing.id));
      }

      setForm({
        title: '',
        description: '',
        suburb: '',
        state: '',
        postcode: '',
        weeklyRent: '',
        bedrooms: '',
        bathrooms: '',
        availableFrom: '',
      });
    } catch (err) {
      setError(err?.message || 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish(listingId) {
    try {
      const { ok, data } = await api(`/rentals/${listingId}/publish`, { method: 'PATCH' });
      if (!ok) throw new Error(data?.error || 'Failed to publish listing');

      setListings((prev) =>
        prev.map((listing) => (listing.id === listingId ? data.listing : listing)),
      );
    } catch (err) {
      setError(err?.message || 'Failed to publish listing');
    }
  }

  async function handleSendInquiry(listingId) {
    if (!isAuthenticated) return;
    setSendingInquiryIds((prev) => new Set(prev).add(listingId));
    setError(null);
    try {
      const message = inquiryMessages[listingId] || undefined;
      const { ok, data } = await api('/rentals/inquiries', {
        method: 'POST',
        body: { rentalListingId: listingId, message },
      });
      if (!ok) throw new Error(data?.error || 'Failed to send inquiry');

      setInquiryMessages((prev) => ({ ...prev, [listingId]: '' }));
      setOwnerInquiries((prev) => (data?.inquiry ? [data.inquiry, ...prev] : prev));
    } catch (err) {
      setError(err?.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiryIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }

  async function handleUpdateInquiry(inquiryId, status) {
    setError(null);
    try {
      const { ok, data } = await api(`/rentals/inquiries/${inquiryId}`, {
        method: 'PATCH',
        body: { status },
      });
      if (!ok) throw new Error(data?.error || 'Failed to update inquiry');

      setOwnerInquiries((prev) =>
        prev.map((inquiry) => (inquiry.id === inquiryId ? data.inquiry : inquiry)),
      );
    } catch (err) {
      setError(err?.message || 'Failed to update inquiry');
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSavingProfile(true);
    setError(null);
    try {
      const payload = {
        budgetMin: profileForm.budgetMin ? Number(profileForm.budgetMin) : undefined,
        budgetMax: profileForm.budgetMax ? Number(profileForm.budgetMax) : undefined,
        preferredSuburbs: profileForm.preferredSuburbs
          ? profileForm.preferredSuburbs
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        preferredStates: profileForm.preferredStates
          ? profileForm.preferredStates
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        propertyTypes: profileForm.propertyTypes
          ? profileForm.propertyTypes
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        bedroomsMin: profileForm.bedroomsMin ? Number(profileForm.bedroomsMin) : undefined,
        bathroomsMin: profileForm.bathroomsMin ? Number(profileForm.bathroomsMin) : undefined,
        notes: profileForm.notes || undefined,
      };

      const { ok, data } = await api('/rentals/seekers/profile', { method: 'POST', body: payload });
      if (!ok) throw new Error(data?.error || 'Failed to save profile');
      setSeekerProfile(data?.profile || null);
    } catch (err) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-teal-700 text-white">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full mb-4">
              Housing Hub
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Find Your Safe Haven
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
              Trauma-informed housing listings with guardian-vetted agents and supportive pathways
              to secure accommodation.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg"
                  >
                    {showCreateForm ? 'Hide Form' : '+ List Property'}
                  </button>
                  <Link
                    href="/rentals/owner"
                    className="px-6 py-3 bg-white/10 border border-white/30 font-semibold rounded-lg hover:bg-white/20 transition-all"
                  >
                    Owner Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-6 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg"
                >
                  Sign in to List Property
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold">{total}</div>
              <div className="text-sm text-white/70">Listings</div>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-3xl sm:text-4xl font-bold">100%</div>
              <div className="text-sm text-white/70">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold">24/7</div>
              <div className="text-sm text-white/70">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Create Listing Form (Collapsible) */}
      {isAuthenticated && showCreateForm && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--color-border)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Create New Listing</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Fill in the details to list your property
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <form className="grid gap-6" onSubmit={handleCreateListing}>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Listing Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Cozy 2BR Apartment in Surry Hills"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your property, amenities, and any special features..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Suburb
                  </label>
                  <input
                    value={form.suburb}
                    onChange={(e) => setForm((prev) => ({ ...prev, suburb: e.target.value }))}
                    placeholder="e.g., Surry Hills"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    State
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  >
                    <option value="">Select state</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Postcode
                  </label>
                  <input
                    value={form.postcode}
                    onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))}
                    placeholder="e.g., 2010"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Weekly Rent ($)
                  </label>
                  <input
                    type="number"
                    value={form.weeklyRent}
                    onChange={(e) => setForm((prev) => ({ ...prev, weeklyRent: e.target.value }))}
                    placeholder="e.g., 550"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={form.availableFrom}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, availableFrom: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 rounded-xl font-medium text-[var(--color-text-secondary)] hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all shadow-lg"
                >
                  {creating ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Filter Listings</h2>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              Reset all filters
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Location
              </label>
              <input
                value={filters.suburb}
                onChange={(e) => setFilters((prev) => ({ ...prev, suburb: e.target.value }))}
                placeholder="Enter suburb"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              >
                <option value="">All states</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="WA">WA</option>
                <option value="SA">SA</option>
                <option value="TAS">TAS</option>
                <option value="ACT">ACT</option>
                <option value="NT">NT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Budget ($/week)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minRent}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minRent: e.target.value }))}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
                />
                <input
                  type="number"
                  value={filters.maxRent}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxRent: e.target.value }))}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {loading
              ? 'Loading...'
              : `${total} ${total === 1 ? 'Property' : 'Properties'} Available`}
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowSeekerForm(!showSeekerForm)}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
            >
              {showSeekerForm ? 'Hide Preferences' : 'Set Preferences'}
            </button>
          )}
        </div>

        {/* Seeker Profile Mini Form */}
        {isAuthenticated && showSeekerForm && (
          <div className="mb-8 bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <h3 className="font-semibold text-[var(--color-text)] mb-4">
              {seekerProfile ? 'Update Your Housing Preferences' : 'Your Housing Preferences'}
            </h3>
            <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleSaveProfile}>
              <input
                value={profileForm.budgetMin}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="Min budget ($)"
                className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              />
              <input
                value={profileForm.budgetMax}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="Max budget ($)"
                className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              />
              <input
                value={profileForm.preferredSuburbs}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, preferredSuburbs: e.target.value }))
                }
                placeholder="Preferred suburbs"
                className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all"
              >
                {savingProfile ? 'Saving...' : seekerProfile ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        )}

        {/* Listings */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[var(--color-border)]">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              No Listings Found
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Try adjusting your filters or check back later
            </p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-6 py-2.5 rounded-lg font-medium text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-teal-100 to-teal-200">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                    🏠
                  </div>
                  {/* Status badge */}
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      listing.status === 'ACTIVE'
                        ? 'bg-green-500 text-white'
                        : listing.status === 'DRAFT'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                    }`}
                  >
                    {listing.status === 'ACTIVE' ? 'Available' : listing.status}
                  </span>
                  {/* Price badge */}
                  {listing.weeklyRent && (
                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-sm font-bold bg-white/95 text-[var(--color-text)] shadow-sm">
                      ${listing.weeklyRent}/wk
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-[var(--color-text)] text-lg mb-1 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {[listing.suburb, listing.state].filter(Boolean).join(', ') || 'Location TBA'}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
                    {listing.bedrooms && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        {listing.bedrooms} bed
                      </span>
                    )}
                    {listing.bathrooms && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                        {listing.bathrooms} bath
                      </span>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                      {listing.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <Link
                      href={`/rentals/${listing.id}`}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      View Details →
                    </Link>
                    {listing.status === 'DRAFT' && createdListingIds.has(listing.id) && (
                      <button
                        onClick={() => handlePublish(listing.id)}
                        className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>

                {/* Inquiry Form */}
                {isAuthenticated && listing.status === 'ACTIVE' && (
                  <div className="px-5 pb-5">
                    <div className="bg-[var(--color-surface)] rounded-xl p-4">
                      <textarea
                        value={inquiryMessages[listing.id] || ''}
                        onChange={(e) =>
                          setInquiryMessages((prev) => ({ ...prev, [listing.id]: e.target.value }))
                        }
                        placeholder="Send a message to the owner..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-sm resize-none"
                      />
                      <button
                        onClick={() => handleSendInquiry(listing.id)}
                        disabled={sendingInquiryIds.has(listing.id)}
                        className="mt-2 w-full py-2 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all text-sm"
                      >
                        {sendingInquiryIds.has(listing.id) ? 'Sending...' : 'Send Inquiry'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Owner Inquiries Section */}
      {isAuthenticated && (loadingOwnerInquiries || ownerInquiries.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Your Inquiries</h2>
              <Link
                href="/rentals/seekers"
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
              >
                Browse Seekers →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loadingOwnerInquiries ? (
                <div className="col-span-full text-center py-8 text-[var(--color-text-secondary)]">
                  Loading inquiries...
                </div>
              ) : ownerInquiries.length === 0 ? (
                <div className="col-span-full text-center py-8 text-[var(--color-text-secondary)]">
                  No inquiries yet
                </div>
              ) : (
                ownerInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        {inquiry.rentalListing?.title || 'Listing'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inquiry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : inquiry.status === 'DECLINED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">
                      {inquiry.message || 'No message provided'}
                    </p>
                    {inquiry.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateInquiry(inquiry.id, 'APPROVED')}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateInquiry(inquiry.id, 'DECLINED')}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
