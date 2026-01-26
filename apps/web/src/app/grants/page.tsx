'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';
import {
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  DollarSign,
  MapPin,
  ArrowRight,
  Star,
  Bookmark,
  CheckCircle2,
  Loader2,
  Award,
  Building2,
  Globe,
  Users,
  X,
} from 'lucide-react';

// Theme colors
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

interface Grant {
  id: string;
  name: string;
  provider: string;
  amount: string;
  description: string;
  url: string;
  category: 'federal' | 'state' | 'aboriginal' | 'private';
  state?: string;
  eligibility?: string[];
  featured?: boolean;
  deadline?: string;
}

// Comprehensive grants data - Federal, State, and Aboriginal-specific
const allGrants: Grant[] = [
  // Federal Government Grants
  {
    id: 'indigenous-entrepreneurs-fund',
    name: 'Indigenous Entrepreneurs Fund',
    provider: 'National Indigenous Australians Agency (NIAA)',
    amount: 'Up to $500,000',
    description:
      'Funding for Indigenous businesses to grow, create jobs, and build economic independence in communities.',
    url: 'https://www.niaa.gov.au/indigenous-affairs/economic-development',
    category: 'federal',
    eligibility: ['51%+ Indigenous owned', 'Operating business', 'Growth potential'],
    featured: true,
  },
  {
    id: 'indigenous-skills-jobs',
    name: 'Indigenous Skills and Jobs Programme',
    provider: 'NIAA',
    amount: 'Varies based on project',
    description:
      'Support for Indigenous employment, enterprise development, and skills training initiatives.',
    url: 'https://www.niaa.gov.au/indigenous-affairs/employment',
    category: 'federal',
    eligibility: ['Indigenous organisations', 'Employment focused projects'],
  },
  {
    id: 'entrepreneurs-programme',
    name: "Entrepreneurs' Programme",
    provider: 'AusIndustry',
    amount: 'Matched funding up to $20,000',
    description:
      'Business improvement advice, implementation support, and connections to research for growth.',
    url: 'https://business.gov.au/grants-and-programs/entrepreneurs-programme',
    category: 'federal',
    eligibility: ['ABN holder', 'Trading for 3+ years', 'Revenue $1.5M-$100M'],
  },
  {
    id: 'export-market-development',
    name: 'Export Market Development Grants',
    provider: 'Austrade',
    amount: 'Up to $150,000 per year',
    description:
      'Reimbursement of eligible export promotion expenses for businesses expanding into overseas markets.',
    url: 'https://www.austrade.gov.au/australian/export/export-grants',
    category: 'federal',
    eligibility: ['Australian business', 'Annual income under $50M', 'Export ready'],
  },
  {
    id: 'research-development-tax',
    name: 'R&D Tax Incentive',
    provider: 'AusIndustry',
    amount: 'Tax offset up to 43.5%',
    description:
      'Tax incentive for businesses conducting eligible research and development activities.',
    url: 'https://business.gov.au/grants-and-programs/research-and-development-tax-incentive',
    category: 'federal',
    eligibility: ['Australian registered', 'R&D activities', 'Aggregated turnover under $20M'],
  },

  // Aboriginal-Specific Grants
  {
    id: 'iba-business-support',
    name: 'IBA Business Support',
    provider: 'Indigenous Business Australia',
    amount: 'Loans + business support',
    description:
      'Business loans, support, and workshops specifically for Indigenous entrepreneurs and businesses.',
    url: 'https://www.iba.gov.au/business/',
    category: 'aboriginal',
    eligibility: ['Aboriginal or Torres Strait Islander', 'Viable business plan'],
    featured: true,
  },
  {
    id: 'iba-home-loans',
    name: 'IBA Home Loans',
    provider: 'Indigenous Business Australia',
    amount: 'Up to $750,000',
    description: 'Home loans for Indigenous Australians to buy, build, or renovate their own home.',
    url: 'https://www.iba.gov.au/homes/',
    category: 'aboriginal',
    eligibility: ['Aboriginal or Torres Strait Islander', 'First home buyer preferred'],
  },
  {
    id: 'supply-nation-certification',
    name: 'Supply Nation Certification',
    provider: 'Supply Nation',
    amount: 'Access to $3B+ procurement',
    description:
      'Get certified as an Indigenous business to access corporate and government procurement opportunities.',
    url: 'https://supplynation.org.au/',
    category: 'aboriginal',
    eligibility: ['51%+ Indigenous owned', 'Registered business'],
    featured: true,
  },
  {
    id: 'many-rivers-microfinance',
    name: 'Many Rivers Microfinance',
    provider: 'Many Rivers',
    amount: 'Loans from $500 to $20,000',
    description:
      'Microfinance loans and business coaching for Indigenous entrepreneurs starting small businesses.',
    url: 'https://manyrivers.org.au/',
    category: 'aboriginal',
    eligibility: ['Indigenous entrepreneur', 'Small business start-up'],
  },
  {
    id: 'first-nations-foundation',
    name: 'First Nations Foundation Programs',
    provider: 'First Nations Foundation',
    amount: 'Various programs',
    description:
      'Financial capability, wealth building, and economic empowerment programs for Indigenous Australians.',
    url: 'https://firstnationsfoundation.org.au/',
    category: 'aboriginal',
    eligibility: ['Aboriginal or Torres Strait Islander'],
  },

  // NSW State Grants
  {
    id: 'nsw-aboriginal-economic-prosperity',
    name: 'Aboriginal Economic Prosperity Framework',
    provider: 'NSW Government',
    amount: 'Varies by program',
    description:
      'Programs supporting Aboriginal economic development, business growth, and employment in NSW.',
    url: 'https://www.aboriginalaffairs.nsw.gov.au/',
    category: 'state',
    state: 'NSW',
    eligibility: ['NSW based', 'Aboriginal business or organisation'],
  },
  {
    id: 'nsw-boosting-business',
    name: 'Boosting Business Innovation Program',
    provider: 'NSW Government',
    amount: 'Up to $100,000',
    description: 'Funding for small businesses to work with researchers on innovative solutions.',
    url: 'https://www.nsw.gov.au/grants-and-funding',
    category: 'state',
    state: 'NSW',
    eligibility: ['NSW small business', 'Innovation focus'],
  },

  // VIC State Grants
  {
    id: 'vic-aboriginal-business-initiative',
    name: 'Victorian Aboriginal Business Initiative',
    provider: 'Victorian Government',
    amount: 'Up to $50,000',
    description:
      'Supporting Aboriginal businesses in Victoria with establishment and growth funding.',
    url: 'https://www.vic.gov.au/aboriginal-business',
    category: 'state',
    state: 'VIC',
    eligibility: ['Victorian Aboriginal business', 'Growth ready'],
  },
  {
    id: 'vic-small-business-grants',
    name: 'Small Business Grants',
    provider: 'Business Victoria',
    amount: 'Up to $50,000',
    description: 'Various grant programs for Victorian small businesses across different sectors.',
    url: 'https://business.vic.gov.au/grants-and-programs',
    category: 'state',
    state: 'VIC',
  },

  // QLD State Grants
  {
    id: 'qld-business-basics',
    name: 'Business Basics Grants',
    provider: 'Queensland Government',
    amount: 'Up to $5,000',
    description:
      'Funding for small business training, professional advice, and capability building.',
    url: 'https://www.business.qld.gov.au/starting-business/advice-support/grants',
    category: 'state',
    state: 'QLD',
    eligibility: ['QLD small business', 'ABN holder'],
  },
  {
    id: 'qld-growing-workforce',
    name: 'Growing Workforce Grants',
    provider: 'Queensland Government',
    amount: 'Up to $50,000',
    description: 'Co-investment funding to help Queensland small businesses grow and create jobs.',
    url: 'https://www.business.qld.gov.au/',
    category: 'state',
    state: 'QLD',
  },

  // WA State Grants
  {
    id: 'wa-aboriginal-business-program',
    name: 'Aboriginal Business Development Program',
    provider: 'Department of Primary Industries WA',
    amount: 'Up to $20,000',
    description:
      'Supporting Aboriginal businesses in Western Australia with business development and growth.',
    url: 'https://www.wa.gov.au/organisation/department-of-primary-industries-and-regional-development',
    category: 'state',
    state: 'WA',
    eligibility: ['WA Aboriginal business', '50%+ Indigenous ownership'],
  },

  // SA State Grants
  {
    id: 'sa-aboriginal-business-accelerator',
    name: 'Aboriginal Business Accelerator',
    provider: 'Office for Small and Family Business SA',
    amount: 'Mentoring + up to $10,000',
    description:
      'Intensive business support program for Aboriginal entrepreneurs in South Australia.',
    url: 'https://www.sa.gov.au/',
    category: 'state',
    state: 'SA',
    eligibility: ['SA Aboriginal entrepreneur', 'Business idea or early-stage business'],
  },

  // NT State Grants
  {
    id: 'nt-indigenous-business-support',
    name: 'Indigenous Business Development',
    provider: 'NT Government',
    amount: 'Varies',
    description:
      'Support programs for Indigenous businesses in the Northern Territory including remote communities.',
    url: 'https://nt.gov.au/industry/business',
    category: 'state',
    state: 'NT',
    eligibility: ['NT based', 'Indigenous ownership'],
  },

  // TAS State Grants
  {
    id: 'tas-aboriginal-business-program',
    name: 'Aboriginal Small Business Program',
    provider: 'Business Tasmania',
    amount: 'Up to $10,000',
    description: 'Grants and support for Aboriginal-owned small businesses in Tasmania.',
    url: 'https://www.business.tas.gov.au/',
    category: 'state',
    state: 'TAS',
    eligibility: ['Tasmanian Aboriginal business'],
  },

  // ACT Grants
  {
    id: 'act-indigenous-business',
    name: 'ACT Indigenous Business Support',
    provider: 'ACT Government',
    amount: 'Up to $15,000',
    description:
      'Supporting Indigenous businesses in the ACT with establishment and growth funding.',
    url: 'https://www.act.gov.au/',
    category: 'state',
    state: 'ACT',
    eligibility: ['ACT based Indigenous business'],
  },

  // Private/Corporate Programs
  {
    id: 'westpac-scholars',
    name: 'Westpac Indigenous Business Scholarship',
    provider: 'Westpac',
    amount: '$15,000 scholarship',
    description: 'Scholarships for Indigenous business students and emerging entrepreneurs.',
    url: 'https://scholars.westpacgroup.com.au/',
    category: 'private',
    eligibility: ['Indigenous Australian', 'Business studies or entrepreneur'],
  },
  {
    id: 'google-indigenous-tech',
    name: 'Google for Startups',
    provider: 'Google',
    amount: 'Training + up to $100,000 credits',
    description: 'Accelerator program and cloud credits for Indigenous-led tech startups.',
    url: 'https://startup.google.com/',
    category: 'private',
    eligibility: ['Indigenous-led startup', 'Tech focus'],
  },
  {
    id: 'commonwealth-bank-grants',
    name: 'CommBank Indigenous Partnership',
    provider: 'Commonwealth Bank',
    amount: 'Various support programs',
    description: 'Business banking support and partnership programs for Indigenous businesses.',
    url: 'https://www.commbank.com.au/business/indigenous-banking.html',
    category: 'private',
    eligibility: ['Indigenous business', 'Banking relationship'],
  },
];

const categories = [
  { id: 'all', name: 'All Grants', icon: '🏆', description: 'Browse all available grants' },
  {
    id: 'federal',
    name: 'Federal Government',
    icon: '🏛️',
    description: 'National government programs',
  },
  {
    id: 'state',
    name: 'State Government',
    icon: '📍',
    description: 'State and territory programs',
  },
  {
    id: 'aboriginal',
    name: 'Aboriginal Specific',
    icon: '🪃',
    description: 'Indigenous-focused programs',
  },
  {
    id: 'private',
    name: 'Private & Corporate',
    icon: '🏢',
    description: 'Corporate and foundation grants',
  },
];

const states = [
  { id: 'all', name: 'All States' },
  { id: 'NSW', name: 'New South Wales' },
  { id: 'VIC', name: 'Victoria' },
  { id: 'QLD', name: 'Queensland' },
  { id: 'WA', name: 'Western Australia' },
  { id: 'SA', name: 'South Australia' },
  { id: 'TAS', name: 'Tasmania' },
  { id: 'NT', name: 'Northern Territory' },
  { id: 'ACT', name: 'Australian Capital Territory' },
];

export default function GrantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [bookmarkedGrants, setBookmarkedGrants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState<Grant[]>(allGrants);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch grants from API and merge with static data
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);

        // Try multiple API endpoints
        const [grantsRes, initiativesRes, businessRes] = await Promise.all([
          api('/financial/grants', { timeout: 5000, skipRetry: true }).catch(() => ({ ok: false })),
          api('/initiatives/grants', { timeout: 5000, skipRetry: true }).catch(() => ({
            ok: false,
          })),
          api('/business-formation/grants', { timeout: 5000, skipRetry: true }).catch(() => ({
            ok: false,
          })),
        ]);

        const fetchedGrants: Grant[] = [];

        if (grantsRes.ok && grantsRes.data?.grants) {
          fetchedGrants.push(
            ...grantsRes.data.grants.map((g: any) => ({
              id: g.id,
              name: g.title || g.name,
              provider: g.provider || 'Government',
              amount: g.amount || 'Varies',
              description: g.description,
              url: g.url || '#',
              category: g.category || 'federal',
              state: g.state,
              eligibility: g.eligibility || [],
              featured: g.featured,
              deadline: g.deadline,
            })),
          );
        }

        if (initiativesRes.ok && initiativesRes.data) {
          const initGrants = Array.isArray(initiativesRes.data)
            ? initiativesRes.data
            : initiativesRes.data.data || [];
          fetchedGrants.push(
            ...initGrants.map((g: any) => ({
              id: g.id,
              name: g.name || g.title,
              provider: g.provider || g.organization,
              amount: g.amount || 'Varies',
              description: g.description,
              url: g.url || '#',
              category: g.category || 'aboriginal',
              eligibility: g.eligibility || [],
            })),
          );
        }

        if (businessRes.ok && businessRes.data?.grants) {
          fetchedGrants.push(
            ...businessRes.data.grants.map((g: any) => ({
              id: g.id,
              name: g.name,
              provider: g.provider,
              amount: g.amount,
              description: g.description,
              url: g.url || '#',
              category: 'federal',
            })),
          );
        }

        // Merge API grants with static data, avoiding duplicates
        const existingIds = new Set(allGrants.map((g) => g.id));
        const newGrants = fetchedGrants.filter((g) => !existingIds.has(g.id));
        setGrants([...allGrants, ...newGrants]);
      } catch (error) {
        console.error('Failed to fetch grants:', error);
        // Fall back to static data
        setGrants(allGrants);
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, []);

  // Filter grants based on search, category, and state
  const filteredGrants = grants.filter((grant) => {
    const matchesSearch =
      searchQuery === '' ||
      grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || grant.category === selectedCategory;

    const matchesState = selectedState === 'all' || !grant.state || grant.state === selectedState;

    return matchesSearch && matchesCategory && matchesState;
  });

  const featuredGrants = filteredGrants.filter((g) => g.featured);

  const toggleBookmark = useCallback((grantId: string) => {
    setBookmarkedGrants((prev) =>
      prev.includes(grantId) ? prev.filter((id) => id !== grantId) : [...prev, grantId],
    );
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'federal':
        return 'bg-blue-100 text-blue-700';
      case 'state':
        return 'bg-emerald-100 text-emerald-700';
      case 'aboriginal':
        return 'bg-amber-100 text-amber-700';
      case 'private':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'federal':
        return <Building2 className="w-4 h-4" />;
      case 'state':
        return <MapPin className="w-4 h-4" />;
      case 'aboriginal':
        return <Users className="w-4 h-4" />;
      case 'private':
        return <Globe className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section
        className="relative py-16 md:py-24"
        style={{
          background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
              <DollarSign className="w-4 h-4" />
              <span>Federal • State • Aboriginal Grants</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Grants & Funding
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover funding opportunities for Aboriginal and Torres Strait Islander businesses,
              entrepreneurs, and organisations. Access federal, state, and Indigenous-specific
              grants.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grants by name, provider, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={
                  selectedCategory === cat.id
                    ? { background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})` }
                    : {}
                }
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ml-auto ${
                showFilters
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="pb-4 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    State/Territory
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-100/50 py-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-slate-600">
                <strong className="text-slate-900">{filteredGrants.length}</strong> grants found
              </span>
              {selectedCategory !== 'all' && (
                <span className="flex items-center gap-1 text-slate-500">
                  <span>{categories.find((c) => c.id === selectedCategory)?.icon}</span>
                  {categories.find((c) => c.id === selectedCategory)?.description}
                </span>
              )}
            </div>
            {bookmarkedGrants.length > 0 && (
              <Link
                href="#bookmarked"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
              >
                <Bookmark className="w-4 h-4 fill-current" />
                {bookmarkedGrants.length} saved
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            {/* Featured Grants */}
            {featuredGrants.length > 0 && selectedCategory === 'all' && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <h2 className="text-2xl font-bold text-slate-900">Featured Grants</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className="relative group rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 transition-all hover:shadow-lg"
                    >
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mb-4 ${getCategoryColor(grant.category)}`}
                      >
                        {getCategoryIcon(grant.category)}
                        {categories.find((c) => c.id === grant.category)?.name}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 pr-16">{grant.name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{grant.provider}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <span className="text-lg font-bold text-emerald-700">{grant.amount}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {grant.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <a
                          href={grant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm"
                        >
                          Learn More
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => toggleBookmark(grant.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            bookmarkedGrants.includes(grant.id)
                              ? 'text-pink-600 bg-pink-50'
                              : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
                          }`}
                        >
                          <Bookmark
                            className={`w-5 h-5 ${bookmarkedGrants.includes(grant.id) ? 'fill-current' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Grants Grid */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {selectedCategory === 'all'
                  ? 'All Grants'
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>

              {filteredGrants.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No grants found</h3>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your search or filters to find more grants.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedState('all');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGrants
                    .filter((g) => !g.featured || selectedCategory !== 'all')
                    .map((grant) => (
                      <div
                        key={grant.id}
                        className="group rounded-2xl p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${getCategoryColor(grant.category)}`}
                          >
                            {getCategoryIcon(grant.category)}
                            {categories.find((c) => c.id === grant.category)?.name}
                          </div>
                          {grant.state && (
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                              {grant.state}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                          {grant.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-3">{grant.provider}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-emerald-700">{grant.amount}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                          {grant.description}
                        </p>

                        {grant.eligibility && grant.eligibility.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-500 mb-2">
                              Eligibility:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {grant.eligibility.slice(0, 3).map((req, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm"
                          >
                            Apply Now
                            <ArrowRight className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => toggleBookmark(grant.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              bookmarkedGrants.includes(grant.id)
                                ? 'text-pink-600 bg-pink-50'
                                : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
                            }`}
                          >
                            <Bookmark
                              className={`w-5 h-5 ${bookmarkedGrants.includes(grant.id) ? 'fill-current' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Help Section */}
            <section className="mt-16">
              <div
                className="rounded-3xl p-8 md:p-12 text-center"
                style={{
                  background: `linear-gradient(135deg, ${accentPink}15 0%, ${accentPurple}15 100%)`,
                }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})` }}
                >
                  <span className="text-white">💡</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Need Help Finding the Right Grant?
                </h2>
                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                  Our team can help you identify the best funding opportunities for your business or
                  project. Book a free consultation with one of our grant specialists.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/member/financial-wellness"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                    }}
                  >
                    Financial Wellness Hub
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/business-suite"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-slate-900 border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    Business Suite
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
