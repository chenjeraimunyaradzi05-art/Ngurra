'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';
import {
  Search,
  Filter,
  DollarSign,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Home,
  Heart,
  Sparkles,
  ExternalLink,
  Clock,
  MapPin,
  Loader2,
  Star,
  Award,
} from 'lucide-react';

// Theme colors
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

interface Grant {
  id: string;
  title: string;
  provider: string;
  description: string;
  amount?: string;
  maxAmount?: number;
  minAmount?: number;
  deadline?: string;
  category: string;
  tags?: string[];
  eligibility?: string[];
  applicationUrl?: string;
  isActive: boolean;
  level: 'federal' | 'state' | 'indigenous' | 'private';
  state?: string;
}

// Demo grants data - comprehensive list of real Australian grants
const demoGrants: Grant[] = [
  // Federal Grants
  {
    id: 'fed-1',
    title: 'Indigenous Business Australia (IBA) Business Development Loans',
    provider: 'Indigenous Business Australia',
    description:
      'Finance to help Indigenous Australians start or grow a business. Includes business support services and concessional loan terms.',
    amount: 'Up to $1,000,000',
    maxAmount: 1000000,
    deadline: 'Ongoing',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: [
      'Aboriginal or Torres Strait Islander',
      'Viable business plan',
      'Australian resident',
    ],
    applicationUrl: 'https://iba.gov.au/business/',
    isActive: true,
    level: 'federal',
  },
  {
    id: 'fed-2',
    title: 'Indigenous Advancement Strategy (IAS)',
    provider: 'National Indigenous Australians Agency',
    description:
      'Funding for programs that support Indigenous employment, education, and community development.',
    amount: 'Varies by project',
    deadline: 'Rolling applications',
    category: 'community',
    tags: ['indigenous', 'education', 'employment'],
    eligibility: ['Aboriginal and Torres Strait Islander communities', 'Registered organisations'],
    applicationUrl: 'https://www.niaa.gov.au/indigenous-affairs/grants-and-funding',
    isActive: true,
    level: 'federal',
  },
  {
    id: 'fed-3',
    title: 'Indigenous Skills and Employment Program (ISEP)',
    provider: 'Department of Employment',
    description:
      'Supports Indigenous Australians to get skills and sustainable jobs through tailored employment services.',
    amount: 'Funded services',
    deadline: 'Ongoing',
    category: 'employment',
    tags: ['indigenous', 'employment', 'training'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'Job seekers', '15+ years old'],
    applicationUrl: 'https://www.niaa.gov.au/indigenous-affairs/employment',
    isActive: true,
    level: 'federal',
  },
  {
    id: 'fed-4',
    title: 'ABSTUDY',
    provider: 'Services Australia',
    description:
      'Financial help for Indigenous Australians who are studying or undertaking an Australian Apprenticeship.',
    amount: 'Up to $28,500/year',
    maxAmount: 28500,
    deadline: 'Ongoing',
    category: 'education',
    tags: ['indigenous', 'education'],
    eligibility: [
      'Aboriginal or Torres Strait Islander',
      'Enrolled in approved course',
      'Australian resident',
    ],
    applicationUrl: 'https://www.servicesaustralia.gov.au/abstudy',
    isActive: true,
    level: 'federal',
  },
  {
    id: 'fed-5',
    title: 'Indigenous Home Ownership Program',
    provider: 'Indigenous Business Australia',
    description:
      'Home loans with lower deposit requirements and competitive interest rates for Indigenous Australians.',
    amount: 'Home loans up to market value',
    deadline: 'Ongoing',
    category: 'housing',
    tags: ['indigenous', 'housing'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'Steady income', 'Good credit history'],
    applicationUrl: 'https://iba.gov.au/homes/',
    isActive: true,
    level: 'federal',
  },
  // State Grants - NSW
  {
    id: 'nsw-1',
    title: 'Aboriginal Business Development Program',
    provider: 'NSW Government',
    description:
      'Grants and support services to help Aboriginal businesses start, grow and succeed in NSW.',
    amount: 'Up to $50,000',
    maxAmount: 50000,
    deadline: 'Rolling applications',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: ['Aboriginal-owned business', 'Operating in NSW', 'ABN required'],
    applicationUrl: 'https://www.nsw.gov.au/grants-and-funding',
    isActive: true,
    level: 'state',
    state: 'NSW',
  },
  {
    id: 'nsw-2',
    title: 'Aboriginal Housing Office Grants',
    provider: 'Aboriginal Housing Office NSW',
    description:
      'Housing assistance for Aboriginal people including home ownership and rental assistance.',
    amount: 'Varies',
    deadline: 'Ongoing',
    category: 'housing',
    tags: ['indigenous', 'housing'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'NSW resident'],
    applicationUrl: 'https://www.aho.nsw.gov.au/',
    isActive: true,
    level: 'state',
    state: 'NSW',
  },
  // State Grants - VIC
  {
    id: 'vic-1',
    title: 'Aboriginal Business Development Fund',
    provider: 'Victorian Government',
    description: 'Financial support for Aboriginal businesses to innovate, grow and create jobs.',
    amount: 'Up to $100,000',
    maxAmount: 100000,
    deadline: 'Grant rounds',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: ['Aboriginal-owned (51%+)', 'Victorian business', 'Viable business model'],
    applicationUrl: 'https://business.vic.gov.au/',
    isActive: true,
    level: 'state',
    state: 'VIC',
  },
  {
    id: 'vic-2',
    title: 'Koorie Education Scholarships',
    provider: 'Department of Education Victoria',
    description: 'Scholarships for Aboriginal students pursuing education and training pathways.',
    amount: 'Up to $5,000',
    maxAmount: 5000,
    deadline: 'Annual',
    category: 'education',
    tags: ['indigenous', 'education'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'Victorian resident', 'Enrolled student'],
    applicationUrl: 'https://www.vic.gov.au/koorie-education',
    isActive: true,
    level: 'state',
    state: 'VIC',
  },
  // State Grants - QLD
  {
    id: 'qld-1',
    title: 'Indigenous Business Growth Program',
    provider: 'Queensland Government',
    description: 'Support for Indigenous businesses to scale up and access new markets.',
    amount: 'Up to $25,000',
    maxAmount: 25000,
    deadline: 'Open year-round',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: ['Indigenous ownership 50%+', 'Queensland based', '12+ months trading'],
    applicationUrl: 'https://www.business.qld.gov.au/',
    isActive: true,
    level: 'state',
    state: 'QLD',
  },
  {
    id: 'qld-2',
    title: 'Aboriginal and Torres Strait Islander Housing',
    provider: 'Queensland Department of Housing',
    description:
      'Housing assistance including public housing, home ownership support, and emergency housing.',
    amount: 'Varies by program',
    deadline: 'Ongoing',
    category: 'housing',
    tags: ['indigenous', 'housing'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'Queensland resident'],
    applicationUrl: 'https://www.housing.qld.gov.au/',
    isActive: true,
    level: 'state',
    state: 'QLD',
  },
  // State Grants - WA
  {
    id: 'wa-1',
    title: 'Aboriginal Business Development Program',
    provider: 'Western Australian Government',
    description: 'Grants and business support to help Aboriginal enterprises succeed.',
    amount: 'Up to $75,000',
    maxAmount: 75000,
    deadline: 'Rolling',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: ['Aboriginal-owned', 'WA business', 'Business plan required'],
    applicationUrl:
      'https://www.wa.gov.au/organisation/department-of-primary-industries-and-regional-development',
    isActive: true,
    level: 'state',
    state: 'WA',
  },
  {
    id: 'wa-2',
    title: 'Aboriginal Ranger Program',
    provider: 'WA Parks and Wildlife',
    description:
      'Employment and training opportunities for Aboriginal people in land and sea management.',
    amount: 'Paid employment',
    deadline: 'Ongoing',
    category: 'employment',
    tags: ['indigenous', 'employment', 'environmental'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'Interest in conservation'],
    applicationUrl: 'https://www.dbca.wa.gov.au/',
    isActive: true,
    level: 'state',
    state: 'WA',
  },
  // State Grants - SA
  {
    id: 'sa-1',
    title: 'Aboriginal Economic Participation',
    provider: 'South Australian Government',
    description: 'Programs to increase Aboriginal employment and business opportunities in SA.',
    amount: 'Varies',
    deadline: 'Multiple programs',
    category: 'employment',
    tags: ['indigenous', 'employment', 'business'],
    eligibility: ['Aboriginal or Torres Strait Islander', 'SA resident'],
    applicationUrl: 'https://www.sa.gov.au/',
    isActive: true,
    level: 'state',
    state: 'SA',
  },
  // State Grants - NT
  {
    id: 'nt-1',
    title: 'Indigenous Business Development',
    provider: 'NT Government',
    description:
      'Business support and grants for Aboriginal enterprises in the Northern Territory.',
    amount: 'Up to $50,000',
    maxAmount: 50000,
    deadline: 'Rolling',
    category: 'business',
    tags: ['indigenous', 'business'],
    eligibility: ['Aboriginal-owned', 'NT based'],
    applicationUrl: 'https://nt.gov.au/',
    isActive: true,
    level: 'state',
    state: 'NT',
  },
  // Indigenous Specific
  {
    id: 'ind-1',
    title: 'Many Rivers Microenterprise Program',
    provider: 'Many Rivers',
    description:
      'Free business coaching and small loans for Indigenous entrepreneurs and disadvantaged Australians.',
    amount: 'Loans up to $20,000',
    maxAmount: 20000,
    deadline: 'Ongoing',
    category: 'business',
    tags: ['indigenous', 'business', 'microfinance'],
    eligibility: [
      'Want to start or grow a small business',
      'Limited access to traditional finance',
    ],
    applicationUrl: 'https://mfrm.org.au/',
    isActive: true,
    level: 'indigenous',
  },
  {
    id: 'ind-2',
    title: 'Supply Nation Certified Supplier Program',
    provider: 'Supply Nation',
    description:
      'Certification that connects Indigenous businesses with corporate and government procurement opportunities.',
    amount: 'Business opportunities',
    deadline: 'Ongoing',
    category: 'business',
    tags: ['indigenous', 'business', 'procurement'],
    eligibility: ['51%+ Indigenous owned', 'Registered business', 'ABN/ACN'],
    applicationUrl: 'https://supplynation.org.au/',
    isActive: true,
    level: 'indigenous',
  },
  {
    id: 'ind-3',
    title: 'Yarn Australia Women&apos;s Business Program',
    provider: 'Yarn Australia',
    description: 'Dedicated support for Aboriginal and Torres Strait Islander women in business.',
    amount: 'Training and mentoring',
    deadline: 'Program intakes',
    category: 'business',
    tags: ['indigenous', 'women', 'business'],
    eligibility: ['Aboriginal or Torres Strait Islander woman', 'Business interest'],
    applicationUrl: 'https://yarnaustralia.com/',
    isActive: true,
    level: 'indigenous',
  },
  {
    id: 'ind-4',
    title: 'Deadly Science Equipment Grants',
    provider: 'Deadly Science',
    description:
      'Science equipment and books for schools with high Indigenous student populations.',
    amount: 'Equipment packages',
    deadline: 'Term-based',
    category: 'education',
    tags: ['indigenous', 'education', 'science'],
    eligibility: ['Schools with 10%+ Indigenous students', 'Regional/remote priority'],
    applicationUrl: 'https://deadlyscience.org.au/',
    isActive: true,
    level: 'indigenous',
  },
  {
    id: 'ind-5',
    title: 'CareerTrackers Internship Program',
    provider: 'CareerTrackers',
    description:
      'Paid internships and mentoring for Indigenous university students with Australia&apos;s top employers.',
    amount: 'Paid internships',
    deadline: 'Annual intake',
    category: 'employment',
    tags: ['indigenous', 'employment', 'internship'],
    eligibility: [
      'Aboriginal or Torres Strait Islander',
      'University student',
      'Australian citizen/PR',
    ],
    applicationUrl: 'https://www.careertrackers.org.au/',
    isActive: true,
    level: 'indigenous',
  },
];

const categories = [
  { id: 'all', label: 'All Grants', icon: Sparkles },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'employment', label: 'Employment', icon: Users },
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'community', label: 'Community', icon: Heart },
];

const levels = [
  { id: 'all', label: 'All Sources' },
  { id: 'federal', label: 'Federal Government' },
  { id: 'state', label: 'State Government' },
  { id: 'indigenous', label: 'Indigenous Organisations' },
];

const states = [
  { id: 'all', label: 'All States' },
  { id: 'NSW', label: 'New South Wales' },
  { id: 'VIC', label: 'Victoria' },
  { id: 'QLD', label: 'Queensland' },
  { id: 'WA', label: 'Western Australia' },
  { id: 'SA', label: 'South Australia' },
  { id: 'TAS', label: 'Tasmania' },
  { id: 'NT', label: 'Northern Territory' },
  { id: 'ACT', label: 'ACT' },
];

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch grants from API with fallback to demo data
  const fetchGrants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api('/financial/grants');
      if (response.ok && response.data?.grants?.length > 0) {
        setGrants(response.data.grants);
      } else {
        setGrants(demoGrants);
      }
    } catch (error) {
      console.error('Failed to fetch grants:', error);
      setGrants(demoGrants);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Filter grants
  const filteredGrants = grants.filter((grant) => {
    const matchesSearch =
      !searchQuery ||
      grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || grant.category === selectedCategory;

    const matchesLevel = selectedLevel === 'all' || grant.level === selectedLevel;

    const matchesState =
      selectedState === 'all' ||
      !grant.state ||
      grant.state === selectedState ||
      grant.level === 'federal' ||
      grant.level === 'indigenous';

    return matchesSearch && matchesCategory && matchesLevel && matchesState;
  });

  const federalGrants = filteredGrants.filter((g) => g.level === 'federal');
  const stateGrants = filteredGrants.filter((g) => g.level === 'state');
  const indigenousGrants = filteredGrants.filter((g) => g.level === 'indigenous');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${accentPink}15 0%, ${accentPurple}15 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ background: accentPink }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ background: accentPurple }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                  }}
                >
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Grants & Funding</h1>
                  <p className="text-white/60">Federal, State & Indigenous funding opportunities</p>
                </div>
              </div>
              <p className="text-white/70 max-w-2xl">
                Discover grants, scholarships, and funding programs designed to support Aboriginal
                and Torres Strait Islander people in business, education, employment, and housing.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-white">{grants.length}</div>
                <div className="text-xs text-white/60">Total Grants</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-white">{federalGrants.length}</div>
                <div className="text-xs text-white/60">Federal</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-white">{indigenousGrants.length}</div>
                <div className="text-xs text-white/60">Indigenous Orgs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search grants by name, provider, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': accentPink } as React.CSSProperties}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentPink } as React.CSSProperties}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentPink } as React.CSSProperties}
              >
                {levels.map((level) => (
                  <option key={level.id} value={level.id} className="bg-slate-800">
                    {level.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentPink } as React.CSSProperties}
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id} className="bg-slate-800">
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 flex flex-col gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"
              >
                {levels.map((level) => (
                  <option key={level.id} value={level.id} className="bg-slate-800">
                    {level.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white"
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id} className="bg-slate-800">
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? {
                          background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                        }
                      : {}
                  }
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          </div>
        ) : filteredGrants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Search className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No grants found</h3>
            <p className="text-white/60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Federal Grants Section */}
            {(selectedLevel === 'all' || selectedLevel === 'federal') &&
              federalGrants.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Federal Government Grants</h2>
                      <p className="text-sm text-white/60">Australia-wide programs and funding</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {federalGrants.map((grant) => (
                      <GrantCard key={grant.id} grant={grant} />
                    ))}
                  </div>
                </section>
              )}

            {/* State Grants Section */}
            {(selectedLevel === 'all' || selectedLevel === 'state') && stateGrants.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">State & Territory Grants</h2>
                    <p className="text-sm text-white/60">Location-specific programs</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stateGrants.map((grant) => (
                    <GrantCard key={grant.id} grant={grant} />
                  ))}
                </div>
              </section>
            )}

            {/* Indigenous Organisations Section */}
            {(selectedLevel === 'all' || selectedLevel === 'indigenous') &&
              indigenousGrants.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Indigenous Organisation Programs
                      </h2>
                      <p className="text-sm text-white/60">Community-led support and funding</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {indigenousGrants.map((grant) => (
                      <GrantCard key={grant.id} grant={grant} />
                    ))}
                  </div>
                </section>
              )}
          </div>
        )}

        {/* Help Section */}
        <section className="mt-16">
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${accentPink}15 0%, ${accentPurple}15 100%)`,
            }}
          >
            <h3 className="text-xl font-bold text-white mb-3">Need Help Applying?</h3>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Our team can help you identify the right grants and support your application process.
              Connect with a business mentor or financial counsellor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/mentorship"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                }}
              >
                <Users className="w-5 h-5" />
                Find a Mentor
              </Link>
              <Link
                href="/member/financial-wellness"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                <DollarSign className="w-5 h-5" />
                Financial Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Grant Card Component
function GrantCard({ grant }: { grant: Grant }) {
  const CategoryIcon = getCategoryIcon(grant.category);
  const accentPink = '#E91E8C';
  const accentPurple = '#8B5CF6';

  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case 'federal':
        return 'bg-blue-500/20 text-blue-300';
      case 'state':
        return 'bg-green-500/20 text-green-300';
      case 'indigenous':
        return 'bg-amber-500/20 text-amber-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'business':
        return Briefcase;
      case 'education':
        return GraduationCap;
      case 'employment':
        return Users;
      case 'housing':
        return Home;
      case 'community':
        return Heart;
      default:
        return Sparkles;
    }
  }

  return (
    <div className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentPink}30, ${accentPurple}30)`,
              }}
            >
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getLevelBadgeStyles(
                  grant.level,
                )}`}
              >
                {grant.level === 'federal'
                  ? 'Federal'
                  : grant.level === 'state'
                    ? grant.state || 'State'
                    : 'Indigenous Org'}
              </span>
            </div>
          </div>
        </div>

        {/* Title & Provider */}
        <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-pink-300 transition-colors">
          {grant.title}
        </h3>
        <p className="text-sm text-white/50 mb-3">{grant.provider}</p>

        {/* Description */}
        <p className="text-sm text-white/70 mb-4 line-clamp-3">{grant.description}</p>

        {/* Amount & Deadline */}
        <div className="flex items-center gap-4 text-sm mb-4">
          {grant.amount && (
            <div className="flex items-center gap-1.5 text-green-400">
              <DollarSign className="w-4 h-4" />
              <span>{grant.amount}</span>
            </div>
          )}
          {grant.deadline && (
            <div className="flex items-center gap-1.5 text-white/50">
              <Clock className="w-4 h-4" />
              <span>{grant.deadline}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {grant.tags && grant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {grant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {grant.applicationUrl && (
          <a
            href={grant.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
            }}
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
