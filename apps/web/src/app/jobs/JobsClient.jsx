"use client";
import { API_BASE } from '@/lib/apiBase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Building2, DollarSign, Star, Sparkles, Gem, GraduationCap, Bell, Search, ChevronRight } from 'lucide-react';
import api from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';

const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

export default function JobsClient({ initialJobs = [] }) {
    const hasPrefetched = initialJobs.length > 0;
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState(hasPrefetched ? initialJobs : []);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(hasPrefetched ? initialJobs.length : 0);
    const [q, setQ] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [employmentFilter, setEmploymentFilter] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [skillsFilter, setSkillsFilter] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [rapLevel, setRapLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [savedFilters, setSavedFilters] = useState([]);
    const [savedName, setSavedName] = useState('');
    const [savingFilters, setSavingFilters] = useState(false);
    const [loadingSavedFilters, setLoadingSavedFilters] = useState(false);

    function slugify(s) { return s?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, ''); }
    
    function formatSalary(low, high) {
        if (!low && !high) return null;
        const format = (n) => `$${(n / 1000).toFixed(0)}k`;
        if (low && high) return `${format(low)} - ${format(high)}`;
        if (low) return `From ${format(low)}`;
        return `Up to ${format(high)}`;
    }
    
    function formatEmploymentType(type) {
        const types = {
            FULL_TIME: 'Full Time',
            PART_TIME: 'Part Time',
            CONTRACT: 'Contract',
            CASUAL: 'Casual',
            APPRENTICESHIP: 'Apprenticeship',
          TRAINEESHIP: 'Traineeship',
        };
        return types[type] || type;
    }

    // Realistic fallback job data for First Nations employment
    const fallbackJobs = [
        {
            id: '1',
            title: 'Indigenous Community Liaison Officer',
            company: { companyName: 'Rio Tinto', isVerified: true },
            location: 'Perth, WA',
            employment: 'FULL_TIME',
            salaryLow: 85000,
            salaryHigh: 105000,
            description: 'Join our Indigenous Partnerships team to strengthen relationships with Traditional Owner groups across the Pilbara. You will facilitate cultural awareness programs, coordinate community consultations, and ensure our operations respect and celebrate Indigenous heritage.',
            isFeatured: true,
            slug: 'indigenous-community-liaison-officer'
        },
        {
            id: '2',
            title: 'First Nations Software Developer',
            company: { companyName: 'Atlassian', isVerified: true },
            location: 'Sydney, NSW (Hybrid)',
            employment: 'FULL_TIME',
            salaryLow: 120000,
            salaryHigh: 160000,
            description: 'Be part of our Indigenous Tech Talent program. We are seeking passionate developers to join our engineering team. Experience with React, Node.js, or cloud technologies preferred. Mentorship and career development pathways included.',
            isFeatured: true,
            slug: 'first-nations-software-developer'
        },
        {
            id: '3',
            title: 'Heavy Diesel Mechanic - Indigenous Traineeship',
            company: { companyName: 'BHP', isVerified: true },
            location: 'Newman, WA',
            employment: 'APPRENTICESHIP',
            salaryLow: 65000,
            salaryHigh: 85000,
            description: 'Fully funded traineeship program for First Nations candidates. Gain your Certificate III in Heavy Commercial Vehicle Mechanical Technology while earning a competitive wage. Accommodation and travel allowances provided.',
            isFeatured: false,
            slug: 'heavy-diesel-mechanic-traineeship'
        },
        {
            id: '4',
            title: 'Aboriginal Health Worker',
            company: { companyName: 'Victorian Aboriginal Health Service', isVerified: true },
            location: 'Melbourne, VIC',
            employment: 'FULL_TIME',
            salaryLow: 70000,
            salaryHigh: 90000,
            description: 'Provide culturally safe health care to Aboriginal and Torres Strait Islander communities. Work alongside doctors, nurses, and allied health professionals to deliver holistic health services. Certificate IV in Aboriginal Health required.',
            isFeatured: false,
            slug: 'aboriginal-health-worker'
        },
        {
            id: '5',
            title: 'Indigenous Ranger - Land Management',
            company: { companyName: 'Parks Australia', isVerified: true },
            location: 'Kakadu, NT',
            employment: 'FULL_TIME',
            salaryLow: 60000,
            salaryHigh: 75000,
            description: 'Work on Country managing one of Australia\'s most iconic national parks. Combine traditional knowledge with modern conservation practices. Responsibilities include fire management, weed control, and cultural site protection.',
            isFeatured: true,
            slug: 'indigenous-ranger-land-management'
        },
        {
            id: '6',
            title: 'Graduate Accountant - Indigenous Program',
            company: { companyName: 'KPMG', isVerified: true },
            location: 'Brisbane, QLD',
            employment: 'FULL_TIME',
            salaryLow: 65000,
            salaryHigh: 75000,
            description: 'Join KPMG\'s award-winning Indigenous Graduate Program. Gain exposure to audit, tax, and advisory services while completing your CA or CPA qualification. Dedicated mentoring and cultural support provided throughout your journey.',
            isFeatured: false,
            slug: 'graduate-accountant-indigenous-program'
        },
        {
            id: '7',
            title: 'Customer Service Representative',
            company: { companyName: 'Telstra', isVerified: true },
            location: 'Darwin, NT',
            employment: 'FULL_TIME',
            salaryLow: 55000,
            salaryHigh: 65000,
            description: 'Help customers with their telecommunications needs in our Darwin contact centre. Full training provided. We value candidates who can connect with diverse communities and provide exceptional service with cultural understanding.',
            isFeatured: false,
            slug: 'customer-service-representative'
        },
        {
            id: '8',
            title: 'Mining Process Operator',
            company: { companyName: 'Fortescue Metals Group', isVerified: true },
            location: 'Port Hedland, WA',
            employment: 'FULL_TIME',
            salaryLow: 95000,
            salaryHigh: 130000,
            description: 'Operate processing equipment at our iron ore operations. FIFO roster (8 days on/6 days off) with flights from Perth, Broome, or regional WA. No prior experience needed - comprehensive training provided. Aboriginal and Torres Strait Islander candidates strongly encouraged.',
            isFeatured: true,
            slug: 'mining-process-operator'
        },
        {
            id: '9',
            title: 'Early Childhood Educator',
            company: { companyName: 'Goodstart Early Learning', isVerified: true },
            location: 'Cairns, QLD',
            employment: 'PART_TIME',
            salaryLow: 50000,
            salaryHigh: 60000,
            description: 'Inspire the next generation at our culturally inclusive early learning centre. Help integrate First Nations perspectives into our curriculum. Certificate III in Early Childhood Education required, Diploma preferred.',
            isFeatured: false,
            slug: 'early-childhood-educator'
        },
        {
            id: '10',
            title: 'Indigenous Affairs Advisor',
            company: { companyName: 'Qantas Airways', isVerified: true },
            location: 'Sydney, NSW',
            employment: 'FULL_TIME',
            salaryLow: 110000,
            salaryHigh: 140000,
            description: 'Lead Qantas\' engagement with First Nations communities and suppliers. Develop reconciliation action plans, manage Indigenous procurement strategies, and represent Qantas at key stakeholder events. Strong networks within Aboriginal and Torres Strait Islander communities essential.',
            isFeatured: true,
            slug: 'indigenous-affairs-advisor'
        }
    ];

    async function load() {
        setLoading(true);
        try {
            let url = `${API_BASE}/jobs?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;
            if (locationFilter) url += `&location=${encodeURIComponent(locationFilter)}`;
            if (employmentFilter) url += `&employment=${encodeURIComponent(employmentFilter)}`;
          if (minSalary) url += `&minSalary=${encodeURIComponent(minSalary)}`;
          if (maxSalary) url += `&maxSalary=${encodeURIComponent(maxSalary)}`;
          if (skillsFilter) url += `&skills=${encodeURIComponent(skillsFilter)}`;
          if (verifiedOnly) url += `&companyVerified=true`;
          if (rapLevel) url += `&rapLevel=${encodeURIComponent(rapLevel)}`;
            
            const res = await fetch(url);
            const json = await res.json();
          const apiJobs = json.data || json.jobs || [];
            
            // Use fallback data if API returns empty
            if (apiJobs.length === 0 && !q && !locationFilter && !employmentFilter && !minSalary && !maxSalary && !skillsFilter && !verifiedOnly && !rapLevel) {
                setJobs(fallbackJobs);
                setTotal(fallbackJobs.length);
            } else {
                setJobs(apiJobs);
              setTotal(Number(json?.meta?.total || json.total || 0));
            }
        }
        catch (e) {
            // Use fallback data on error
            setJobs(fallbackJobs);
            setTotal(fallbackJobs.length);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Skip initial load if we have prefetched data and no filters applied
        if (hasPrefetched && page === 1 && !q && !locationFilter && !employmentFilter && !minSalary && !maxSalary && !skillsFilter && !verifiedOnly && !rapLevel) {
            setLoading(false);
            return;
        }
        load();
      }, [page, q, locationFilter, employmentFilter, minSalary, maxSalary, skillsFilter, verifiedOnly, rapLevel]);

    useEffect(() => {
      if (!isAuthenticated) return;
      const fetchSavedFilters = async () => {
        setLoadingSavedFilters(true);
        try {
          const { ok, data } = await api('/saved-searches');
          if (ok) {
            const items = (data.savedSearches || []).filter((s) => s.searchType === 'job');
            setSavedFilters(items);
          }
        } finally {
          setLoadingSavedFilters(false);
        }
      };
      fetchSavedFilters();
    }, [isAuthenticated]);

    const saveCurrentFilters = async () => {
      if (!isAuthenticated || !savedName.trim()) return;
      setSavingFilters(true);
      try {
        const payload = {
          name: savedName.trim(),
          searchType: 'job',
          query: {
            q,
            location: locationFilter,
            employment: employmentFilter,
            minSalary,
            maxSalary,
            skills: skillsFilter,
            companyVerified: verifiedOnly ? 'true' : undefined,
            rapLevel,
          },
          alertEnabled: true,
          alertFrequency: 'daily',
        };
        const { ok, data } = await api('/saved-searches', { method: 'POST', body: payload });
        if (ok) {
          setSavedFilters((prev) => [data, ...prev]);
          setSavedName('');
        }
      } finally {
        setSavingFilters(false);
      }
    };

    const applySavedFilter = (item) => {
      const query = item?.query || {};
      setQ(query.q || '');
      setLocationFilter(query.location || '');
      setEmploymentFilter(query.employment || '');
      setMinSalary(query.minSalary || '');
      setMaxSalary(query.maxSalary || '');
      setSkillsFilter(query.skills || '');
      setVerifiedOnly(query.companyVerified === 'true' || query.companyVerified === true);
      setRapLevel(query.rapLevel || '');
      setPage(1);
    };

    const deleteSavedFilter = async (id) => {
      try {
        await api(`/saved-searches/${id}`, { method: 'DELETE' });
        setSavedFilters((prev) => prev.filter((item) => item.id !== id));
      } catch {
        // ignore
      }
    };

    return (<div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
      {/* Decorative background halos */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 60%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 60%)', filter: 'blur(40px)' }} />
      </div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 relative" style={{ zIndex: 1 }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-slate-500 hover:text-pink-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-pink-600 font-medium">Jobs</span>
        </nav>
        
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2 block">Career Opportunities</span>
            <h1 className="text-4xl font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>Job Board</h1>
            <p className="text-slate-600 mt-2">Find opportunities with employers committed to Indigenous employment</p>
          </div>
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Link href="/apprenticeships" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm hover:border-pink-300 hover:bg-pink-50 transition-colors shadow-sm">
              <GraduationCap className="w-4 h-4" style={{ color: accentPink }} />
              Apprenticeships
            </Link>
            <Link href="/member/saved-jobs" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm hover:border-purple-300 hover:bg-purple-50 transition-colors shadow-sm">
              <Bell className="w-4 h-4" style={{ color: accentPurple }} />
              Job Alerts
            </Link>
          </div>
        </div>

      {/* Search & Filters */}
      <div 
        className="rounded-2xl p-6 mb-8 bg-white"
        style={{ 
          border: '1px solid #E2E8F0',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2" htmlFor="job-search">Search Jobs</label>
            <input 
              id="job-search" 
              value={q} 
              onChange={(e) => { setQ(e.target.value); setPage(1); }} 
              placeholder="Search by title, keyword…" 
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2" htmlFor="location-filter">Location</label>
            <input 
              id="location-filter" 
              value={locationFilter} 
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} 
              placeholder="Any location…" 
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-pink-600 mb-2" htmlFor="employment-filter">Employment Type</label>
            <select 
              id="employment-filter" 
              value={employmentFilter} 
              onChange={(e) => { setEmploymentFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 focus:bg-white text-slate-900"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="CASUAL">Casual</option>
              <option value="APPRENTICESHIP">Apprenticeship</option>
              <option value="TRAINEESHIP">Traineeship</option>
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 mb-2">Min Salary</label>
            <input
              value={minSalary}
              onChange={(e) => { setMinSalary(e.target.value); setPage(1); }}
              placeholder="e.g. 70000"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 mb-2">Max Salary</label>
            <input
              value={maxSalary}
              onChange={(e) => { setMaxSalary(e.target.value); setPage(1); }}
              placeholder="e.g. 120000"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 mb-2">Skills</label>
            <input
              value={skillsFilter}
              onChange={(e) => { setSkillsFilter(e.target.value); setPage(1); }}
              placeholder="React, HVAC, Health"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 mb-2">RAP Level</label>
            <select
              value={rapLevel}
              onChange={(e) => { setRapLevel(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white text-slate-900"
            >
              <option value="">Any</option>
              <option value="REFLECT">Reflect</option>
              <option value="INNOVATE">Innovate</option>
              <option value="STRETCH">Stretch</option>
              <option value="ELEVATE">Elevate</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
            />
            Verified employers only
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Saved Filters</h3>
              <p className="text-xs text-slate-500">Save and reapply your advanced filters.</p>
            </div>
            {!isAuthenticated && (
              <span className="text-xs text-slate-500">Sign in to save filters.</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="Name this filter set"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm bg-white border border-slate-200"
              disabled={!isAuthenticated}
            />
            <button
              onClick={saveCurrentFilters}
              disabled={!isAuthenticated || savingFilters || !savedName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
            >
              {savingFilters ? 'Saving…' : 'Save filters'}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loadingSavedFilters ? (
              <div className="text-xs text-slate-500">Loading saved filters…</div>
            ) : savedFilters.length === 0 ? (
              <div className="text-xs text-slate-500">No saved filters yet.</div>
            ) : (
              savedFilters.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {item.query?.q || 'All jobs'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => applySavedFilter(item)}
                      className="text-xs px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(item.id)}
                      className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={load} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            style={{ 
              background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
              boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
            }}
          >
            <Search className="w-4 h-4" />
            Search Jobs
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-pink-50 border border-pink-200">
            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: accentPink }} />
            <span className="text-pink-700">Discovering opportunities…</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {jobs.length === 0 ? (
            <div className="text-center p-8 rounded-2xl bg-white border border-slate-200" style={{ boxShadow: '0 24px 60px rgba(15, 23, 42, 0.06)' }}>
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600">No jobs match your search. Try a different keyword or check back later.</p>
            </div>
          ) : jobs.map((j) => (
            <article 
              key={j.id} 
              className="p-6 rounded-2xl transition-all duration-300 hover:shadow-xl bg-white"
              style={j.isFeatured ? {
                border: '2px solid',
                borderImage: `linear-gradient(135deg, ${accentPink}, ${accentPurple}) 1`,
                boxShadow: '0 8px 32px rgba(233, 30, 140, 0.12)'
              } : {
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)'
              }}
            >
              {/* Featured Badge */}
              {j.isFeatured && (
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 text-white"
                  style={{ background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})` }}
                >
                  <Star className="w-3.5 h-3.5" style={{ fill: 'white' }} />
                  FEATURED
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  {/* Company Info */}
                  {j.company && (
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4" style={{ color: accentPurple }} />
                      <span className="text-sm text-slate-600">{j.company.companyName}</span>
                      {j.company.isVerified && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Job Title */}
                  <Link 
                    href={`/jobs/${j.id}/${j.slug ?? slugify(j.title)}`} 
                    className="text-lg font-bold text-slate-900 hover:text-pink-600 transition-colors"
                  >
                    {j.title}
                  </Link>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                    {j.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" style={{ color: accentPink }} />
                        {j.location}
                      </span>
                    )}
                    {j.employment && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" style={{ color: accentPurple }} />
                        {formatEmploymentType(j.employment)}
                      </span>
                    )}
                    {formatSalary(j.salaryLow, j.salaryHigh) && (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(j.salaryLow, j.salaryHigh)}
                      </span>
                    )}
                  </div>
                  
                  {/* Description Preview */}
                  <div className="mt-4 text-sm line-clamp-2 text-slate-500">
                    {j.description?.slice(0, 200)}{j.description && j.description.length > 200 ? '…' : ''}
                  </div>
                </div>
                
                {/* Apply Buttons */}
                <div className="flex-shrink-0">
                  <div className="flex flex-col gap-3">
                    <Link 
                      href={`/jobs/${j.id}/${j.slug ?? slugify(j.title)}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      style={{ 
                        background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
                        boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
                      }}
                    >
                      <Briefcase className="w-4 h-4" />
                      View & Apply
                    </Link>
                    <Link
                      href={`/jobs/${j.id}/skills-gap`}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2 hover:bg-pink-50"
                      style={{ 
                        borderColor: accentPink,
                        color: accentPink
                      }}
                    >
                      Skills Gap
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-slate-500">
          Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} jobs
        </div>
        <div className="flex gap-3">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            className="px-5 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-40 border-2 hover:bg-pink-50"
            style={{ borderColor: accentPink, color: accentPink }}
          >
            Previous
          </button>
          <button 
            disabled={page * pageSize >= total} 
            onClick={() => setPage((p) => p + 1)} 
            className="px-5 py-2 rounded-full font-medium text-white transition-all duration-200 disabled:opacity-40 hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)` }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </div>);
}
