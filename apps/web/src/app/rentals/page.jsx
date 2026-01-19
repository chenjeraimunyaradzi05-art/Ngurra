"use client";

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

/* CSS Variables inline for feminine theme accents */
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

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

      setListings((prev) => prev.map((listing) => (listing.id === listingId ? data.listing : listing)));
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
        prev.map((inquiry) => (inquiry.id === inquiryId ? data.inquiry : inquiry))
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
          ? profileForm.preferredSuburbs.split(',').map((item) => item.trim()).filter(Boolean)
          : undefined,
        preferredStates: profileForm.preferredStates
          ? profileForm.preferredStates.split(',').map((item) => item.trim()).filter(Boolean)
          : undefined,
        propertyTypes: profileForm.propertyTypes
          ? profileForm.propertyTypes.split(',').map((item) => item.trim()).filter(Boolean)
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
    <div className="min-h-screen">
      {/* === HERO SECTION (hub-section pattern) === */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8" style={{
        background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)',
      }}>
        {/* Radial gradient halos */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 15% 30%, rgba(236, 72, 153, 0.2), transparent 55%), radial-gradient(circle at 85% 0%, rgba(99, 102, 241, 0.18), transparent 40%)',
        }} />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-8 items-start">
            {/* Left content */}
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-600">
                Housing security
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Find safe rentals, co-living sanctuaries and purchase-ready homes
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                Athena Housing Hub blends trauma-aware listings, guardian-vetted agents and mortgage copilots so you can explore new addresses without repeating the same story.
              </p>

              {/* Stats row (hub-section__signals) */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-slate-900">{total}</span>
                  <span className="text-sm text-slate-500">active listings</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-slate-900">3</span>
                  <span className="text-sm text-slate-500">focus locations</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-slate-900">2</span>
                  <span className="text-sm text-slate-500">pathways</span>
                </div>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/rentals/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)', boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)' }}
                >
                  Update housing preferences
                </Link>
                <Link
                  href="/rentals/owner"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-pink-50"
                  style={{ borderColor: accentPink, color: accentPink }}
                >
                  Owner dashboard
                </Link>
              </div>
            </div>

            {/* Right card (hub-intro-card) */}
            <div className="rounded-3xl border border-pink-200 bg-white/90 backdrop-blur-sm p-6 shadow-xl" style={{ boxShadow: '0 35px 75px rgba(15, 23, 42, 0.1)' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-3">Guardian rituals</p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-pink-400 flex-shrink-0" />
                  Listings screened for safety language + privacy settings.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                  Agents pledge trauma-aware comms and flexible inspections.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                  Mortgage copilots keep deposit math and grant rules in one place.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border border-red-300 bg-red-50 text-red-800 rounded-xl px-4 py-3">
            {error}
          </div>
        </div>
      )}

      {/* === FILTER PANEL (housing-filter-panel) === */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Filter housing listings">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600">Filter listings</p>
            <span className="text-sm text-slate-500">{total} listings available</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1">
              <label htmlFor="filter-suburb" className="text-sm font-medium text-slate-700">Location</label>
              <input
                id="filter-suburb"
                value={filters.suburb}
                onChange={(e) => setFilters((prev) => ({ ...prev, suburb: e.target.value }))}
                placeholder="Suburb"
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="filter-state" className="text-sm font-medium text-slate-700">State</label>
              <input
                id="filter-state"
                value={filters.state}
                onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="State"
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="filter-budget" className="text-sm font-medium text-slate-700">Budget</label>
              <div className="flex gap-2">
                <input
                  value={filters.minRent}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minRent: e.target.value }))}
                  placeholder="Min"
                  className="w-1/2 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <input
                  value={filters.maxRent}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxRent: e.target.value }))}
                  placeholder="Max"
                  className="w-1/2 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="filter-bedrooms" className="text-sm font-medium text-slate-700">Bedrooms</label>
              <input
                id="filter-bedrooms"
                value={filters.bedrooms}
                onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
                placeholder="Bedrooms"
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="filter-status" className="text-sm font-medium text-slate-700">For</label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg text-white font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)', boxShadow: '0 4px 12px rgba(233, 30, 140, 0.2)' }}
                onClick={() => {/* filters auto-apply */}}
              >
                Show matches
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Reset filters
            </button>
            <span className="text-slate-400">Tip: Use suburb + bedrooms for quick narrowing.</span>
          </div>
        </div>
      </section>

      {/* === TOOLS SECTION (Create Listing + Seeker Profile) === */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Listing Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-2">Owner tools</p>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create Listing</h2>
            {!isAuthenticated ? (
              <div className="text-sm text-slate-500 py-4">Sign in to create a rental listing.</div>
            ) : (
              <form className="grid gap-4" onSubmit={handleCreateListing}>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Listing title"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.suburb}
                    onChange={(e) => setForm((prev) => ({ ...prev, suburb: e.target.value }))}
                    placeholder="Suburb"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={form.state}
                    onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={form.postcode}
                    onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))}
                    placeholder="Postcode"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={form.weeklyRent}
                    onChange={(e) => setForm((prev) => ({ ...prev, weeklyRent: e.target.value }))}
                    placeholder="Weekly rent (AUD)"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={form.bedrooms}
                    onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="Bedrooms"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={form.bathrooms}
                    onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="Bathrooms"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                </div>
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => setForm((prev) => ({ ...prev, availableFrom: e.target.value }))}
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <button
                  disabled={creating}
                  className="mt-2 px-4 py-2.5 rounded-lg text-white font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)', boxShadow: '0 4px 12px rgba(233, 30, 140, 0.2)' }}
                >
                  {creating ? 'Creating...' : 'Create Listing'}
                </button>
              </form>
            )}
          </div>

          {/* Seeker Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 mb-1">Housing concierge</p>
                <h2 className="text-xl font-bold text-slate-900">Seeker Profile</h2>
              </div>
              <Link href="/rentals/profile" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                Manage →
              </Link>
            </div>
            {!isAuthenticated ? (
              <div className="text-sm text-slate-500 py-4">Sign in to save a seeker profile.</div>
            ) : (
              <form className="grid gap-4" onSubmit={handleSaveProfile}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={profileForm.budgetMin}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                    placeholder="Budget min"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={profileForm.budgetMax}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, budgetMax: e.target.value }))}
                    placeholder="Budget max"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                </div>
                <input
                  value={profileForm.preferredSuburbs}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, preferredSuburbs: e.target.value }))}
                  placeholder="Preferred suburbs (comma separated)"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <input
                  value={profileForm.preferredStates}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, preferredStates: e.target.value }))}
                  placeholder="Preferred states (comma separated)"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <input
                  value={profileForm.propertyTypes}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, propertyTypes: e.target.value }))}
                  placeholder="Property types (comma separated)"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={profileForm.bedroomsMin}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bedroomsMin: e.target.value }))}
                    placeholder="Min bedrooms"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                  <input
                    value={profileForm.bathroomsMin}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bathroomsMin: e.target.value }))}
                    placeholder="Min bathrooms"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  />
                </div>
                <textarea
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes for owners"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                />
                <button
                  disabled={savingProfile}
                  className="mt-2 px-4 py-2.5 rounded-lg font-semibold border-2 transition-all hover:bg-pink-50"
                  style={{ borderColor: accentPink, color: accentPink }}
                >
                  {savingProfile ? 'Saving...' : seekerProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* === OWNER INQUIRIES SECTION === */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-1">Manage responses</p>
              <h2 className="text-xl font-bold text-slate-900">Owner Inquiries</h2>
            </div>
            <Link href="/rentals/seekers" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              Browse seekers →
            </Link>
          </div>
          {!isAuthenticated ? (
            <div className="text-sm text-slate-500 py-4">Sign in to manage inquiries.</div>
          ) : loadingOwnerInquiries ? (
            <div className="text-sm text-slate-500 py-4">Loading inquiries...</div>
          ) : ownerInquiries.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <p className="text-slate-500">No inquiries yet.</p>
              <p className="text-sm text-slate-400 mt-1">When seekers reach out, their messages will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ownerInquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500">Listing: {inquiry.rentalListing?.title || 'Listing'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                      background: inquiry.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.12)' : inquiry.status === 'DECLINED' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(148, 163, 184, 0.2)',
                      color: inquiry.status === 'APPROVED' ? '#059669' : inquiry.status === 'DECLINED' ? '#DC2626' : '#475569',
                    }}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{inquiry.message || 'No message provided.'}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateInquiry(inquiry.id, 'APPROVED')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateInquiry(inquiry.id, 'DECLINED')}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === LISTINGS GRID (housing-card-grid pattern) === */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Housing listings">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 mb-1">Browse properties</p>
            <h2 className="text-2xl font-bold text-slate-900">Available Listings</h2>
          </div>
          <span className="text-sm text-slate-500">Showing {listings.length} of {total}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading listings...</div>
          ) : listings.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-lg font-semibold text-slate-600">No listings found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting filters or create a new listing.</p>
            </div>
          ) : (
            listings.map((listing) => (
              <article key={listing.id} className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg transition-all hover:shadow-xl hover:-translate-y-1" style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
                {/* Card media area */}
                <div className="relative h-40 bg-gradient-to-br from-pink-100 to-purple-100">
                  {/* Status pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)' }}>
                    {listing.status === 'ACTIVE' ? 'Rent' : listing.status}
                  </span>
                  {/* Verified badge */}
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-700 border border-slate-200">
                    Community listing
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-pink-600 transition">{listing.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{[listing.suburb, listing.state].filter(Boolean).join(', ') || 'Location not set'}</p>
                  <p className="text-lg font-bold text-slate-900 mb-3">
                    {listing.weeklyRent ? `$${listing.weeklyRent} / week` : 'Price on application'}
                  </p>

                  {/* Stats row (housing-card__stats) */}
                  <ul className="flex gap-4 text-sm text-slate-600 mb-4">
                    <li><strong className="text-slate-900">{listing.bedrooms ?? '—'}</strong> Bedrooms</li>
                    <li><strong className="text-slate-900">{listing.bathrooms ?? '—'}</strong> Bathrooms</li>
                    <li><strong className="text-slate-900">—</strong> Car</li>
                  </ul>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{listing.description || 'No description provided.'}</p>

                  {/* Card footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {/* Agent avatars placeholder */}
                      <div className="w-8 h-8 rounded-full bg-pink-200 border-2 border-white" />
                    </div>
                    <Link
                      href={`/rentals/${listing.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all hover:bg-pink-50"
                      style={{ borderColor: accentPink, color: accentPink }}
                    >
                      View details
                    </Link>
                  </div>
                </div>

                {/* Inquiry section for authenticated users */}
                {isAuthenticated && listing.status === 'ACTIVE' && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <textarea
                      value={inquiryMessages[listing.id] || ''}
                      onChange={(e) =>
                        setInquiryMessages((prev) => ({ ...prev, [listing.id]: e.target.value }))
                      }
                      placeholder="Send an inquiry to the owner..."
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm min-h-[70px] focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                    />
                    <button
                      onClick={() => handleSendInquiry(listing.id)}
                      disabled={sendingInquiryIds.has(listing.id)}
                      className="mt-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition"
                    >
                      {sendingInquiryIds.has(listing.id) ? 'Sending...' : 'Send inquiry'}
                    </button>
                  </div>
                )}

                {listing.status === 'DRAFT' && createdListingIds.has(listing.id) && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <button
                      onClick={() => handlePublish(listing.id)}
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                      Publish listing →
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {/* === MORTGAGE TOOLS CTA SECTION === */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-8 items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">Deposit copilots</p>
            <h2 className="text-3xl font-bold text-slate-900">Mortgage tools sized for women-led households</h2>
            <p className="text-lg text-slate-600 max-w-xl">
              Run repayment scenarios, surface grant eligibility and keep your deposit gap front-and-centre. Every calculation remembers your preferences so support teams can pick up right where you left off.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/rentals/mortgage"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #8B5CF6 100%)', boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)' }}
              >
                Launch mortgage calculator
              </Link>
              <Link
                href="/rentals/profile"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-pink-50"
                style={{ borderColor: accentPink, color: accentPink }}
              >
                Sync housing profile
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 p-6 text-white shadow-xl" style={{ boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 mb-3">What you get</p>
            <ul className="space-y-3 text-slate-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-pink-400 flex-shrink-0" />
                Deposit tracker that flags sponsor-ready gaps.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                Interest rate comparisons with ethical finance partners.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                Grant bundles that update when states refresh rules.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
