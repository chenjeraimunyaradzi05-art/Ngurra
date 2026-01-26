'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
  Award,
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
  deadline?: string;
  eligibility?: string[];
  featured?: boolean;
}

// Comprehensive grants data
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
    eligibility: ['Australian business', 'Annual turnover $1.5M+', 'Growth focused'],
  },
  {
    id: 'new-enterprise-incentive',
    name: 'New Enterprise Incentive Scheme (NEIS)',
    provider: 'Department of Employment',
    amount: 'Up to $12,480 income support + mentoring',
    description:
      'Income support, training, and mentoring for eligible job seekers starting a new business.',
    url: 'https://www.dewr.gov.au/self-employment-programs/new-enterprise-incentive-scheme-neis',
    category: 'federal',
    eligibility: ['Job seeker', 'Viable business idea', 'Completed NEIS training'],
  },
  {
    id: 'iba-business-support',
    name: 'IBA Business Support',
    provider: 'Indigenous Business Australia',
    amount: 'Loans from $5,000 to $5M',
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
    provider: 'Investment NSW',
    amount: 'Up to $100,000',
    description:
      'Co-funding for collaborative research projects between businesses and research organisations.',
    url: 'https://www.investment.nsw.gov.au/',
    category: 'state',
    state: 'NSW',
  },

  // VIC State Grants
  {
    id: 'vic-aboriginal-business',
    name: 'Aboriginal Business Development',
    provider: 'Aboriginal Victoria',
    amount: 'Up to $50,000',
    description:
      'Grants for Aboriginal businesses in Victoria for equipment, marketing, and business development.',
    url: 'https://www.firstpeoplesrelations.vic.gov.au/',
    category: 'state',
    state: 'VIC',
    eligibility: ['Victorian Aboriginal business', 'Registered business'],
  },
  {
    id: 'vic-small-business-grants',
    name: 'Small Business Grants',
    provider: 'Business Victoria',
    amount: 'Up to $10,000',
    description:
      'Support for small businesses to adapt, grow, and innovate in changing market conditions.',
    url: 'https://business.vic.gov.au/',
    category: 'state',
    state: 'VIC',
  },

  // QLD State Grants
  {
    id: 'qld-backing-indigenous-arts',
    name: 'Backing Indigenous Arts',
    provider: 'Arts Queensland',
    amount: 'Up to $50,000',
    description:
      'Supporting Queensland Indigenous artists and art centres to develop and promote their work.',
    url: 'https://www.arts.qld.gov.au/',
    category: 'state',
    state: 'QLD',
    eligibility: ['Queensland Indigenous artist', 'Established practice'],
  },
  {
    id: 'qld-small-business-grants',
    name: 'Business Growth Fund',
    provider: 'Business Queensland',
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
];

const categories = [
  { id: 'all', name: 'All Grants', icon: '🏆' },
  { id: 'federal', name: 'Federal Government', icon: '🏛️' },
  { id: 'state', name: 'State Government', icon: '📍' },
  { id: 'aboriginal', name: 'Aboriginal Specific', icon: '🪃' },
  { id: 'private', name: 'Private & Corporate', icon: '🏢' },
];

const states = ['All States', 'NSW', 'VIC', 'QLD', 'WA', 'SA', 'NT', 'TAS', 'ACT'];

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>(allGrants);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('All States');
  const [savedGrants, setSavedGrants] = useState<string[]>([]);

  useEffect(() => {
    // Try to fetch from API, fall back to static data
    const fetchGrants = async () => {
      try {
        const response = await api('/business-formation/grants');
        if (response.ok && response.data?.grants) {
          // API data is available, but we use our comprehensive list
          // which already includes the API grants
          setGrants(allGrants);
        }
      } catch (error) {
        console.error('Failed to fetch grants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();

    // Load saved grants from localStorage
    const saved = localStorage.getItem('savedGrants');
    if (saved) {
      setSavedGrants(JSON.parse(saved));
    }
  }, []);

  const toggleSaveGrant = (grantId: string) => {
    const updated = savedGrants.includes(grantId)
      ? savedGrants.filter((id) => id !== grantId)
      : [...savedGrants, grantId];
    setSavedGrants(updated);
    localStorage.setItem('savedGrants', JSON.stringify(updated));
  };

  const filteredGrants = grants.filter((grant) => {
    const matchesSearch =
      grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || grant.category === selectedCategory;

    const matchesState =
      selectedState === 'All States' || !grant.state || grant.state === selectedState;

    return matchesSearch && matchesCategory && matchesState;
  });

  const featuredGrants = grants.filter((g) => g.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: accentPink }} />
          <p className="text-slate-600">Loading grants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section
        className="relative py-16 sm:py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentPink}15 0%, ${accentPurple}15 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20"
            style={{ background: accentPink, filter: 'blur(100px)' }}
          />
          <div
            className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-20"
            style={{ background: accentPurple, filter: 'blur(100px)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-sm font-medium text-slate-700 mb-6">
              <Award className="w-4 h-4" style={{ color: accentPink }} />
              Federal, State &amp; Indigenous Grants
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Funding &amp; Grants for{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                }}
              >
                Indigenous Australians
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Discover grants, loans, and funding opportunities from federal, state, and private
              sources to help start or grow your business, education, or career.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search grants by name, provider, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-slate-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grants */}
      {featuredGrants.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6" style={{ color: accentPink }} />
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredGrants.map((grant) => (
              <div
                key={grant.id}
                className="relative rounded-2xl p-6 border-2 transition-all hover:shadow-xl"
                style={{
                  borderColor: accentPink,
                  background: `linear-gradient(135deg, ${accentPink}05 0%, ${accentPurple}05 100%)`,
                }}
              >
                <div className="absolute -top-3 -right-3">
                  <span
                    className="px-3 py-1 text-xs font-bold text-white rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                    }}
                  >
                    Featured
                  </span>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {grant.category === 'aboriginal'
                        ? '🪃'
                        : grant.category === 'federal'
                          ? '🏛️'
                          : '🏢'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {grant.provider}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSaveGrant(grant.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${savedGrants.includes(grant.id) ? 'fill-current' : ''}`}
                      style={{ color: savedGrants.includes(grant.id) ? accentPink : '#94a3b8' }}
                    />
                  </button>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{grant.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{grant.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">{grant.amount}</span>
                </div>
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})` }}
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters & Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Category Filter */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        {cat.id === 'all'
                          ? grants.length
                          : grants.filter((g) => g.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  State/Territory
                </h3>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                <h3 className="font-bold text-slate-900 mb-3">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Our team can help you find the right grants for your situation.
                </p>
                <Link
                  href="/mentorship"
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: accentPink }}
                >
                  Talk to a Mentor <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-900">{filteredGrants.length}</span> grants
              </p>
              {savedGrants.length > 0 && (
                <button
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: accentPink }}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  {savedGrants.length} Saved
                </button>
              )}
            </div>

            {filteredGrants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700 mb-2">No grants found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGrants.map((grant) => (
                  <div
                    key={grant.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              grant.category === 'federal'
                                ? 'bg-blue-100 text-blue-700'
                                : grant.category === 'state'
                                  ? 'bg-amber-100 text-amber-700'
                                  : grant.category === 'aboriginal'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {grant.category === 'federal'
                              ? '🏛️ Federal'
                              : grant.category === 'state'
                                ? `📍 ${grant.state || 'State'}`
                                : grant.category === 'aboriginal'
                                  ? '🪃 Aboriginal'
                                  : '🏢 Private'}
                          </span>
                          <span className="text-xs text-slate-500">{grant.provider}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">{grant.name}</h3>
                        <p className="text-sm text-slate-600 mb-3">{grant.description}</p>

                        {grant.eligibility && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {grant.eligibility.map((req, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {req}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            {grant.amount}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2">
                        <button
                          onClick={() => toggleSaveGrant(grant.id)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Bookmark
                            className={`w-5 h-5 ${savedGrants.includes(grant.id) ? 'fill-current' : ''}`}
                            style={{
                              color: savedGrants.includes(grant.id) ? accentPink : '#94a3b8',
                            }}
                          />
                        </button>
                        <a
                          href={grant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:scale-[1.02]"
                          style={{
                            background: `linear-gradient(135deg, ${accentPink}, ${accentPurple})`,
                          }}
                        >
                          Details <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accentPink} 0%, ${accentPurple} 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to Start Your Business Journey?
              </h2>
              <p className="text-white/80 max-w-xl">
                Our Business Suite helps you plan, register, and manage your business with tools
                designed specifically for Indigenous entrepreneurs.
              </p>
            </div>
            <Link
              href="/business-suite"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl font-semibold transition-all hover:scale-105"
              style={{ color: accentPink }}
            >
              Open Business Suite <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> Grant information is provided for guidance only.
            Availability, amounts, and eligibility criteria may change. Always verify current
            details directly with the grant provider before applying.
          </p>
        </div>
      </section>
    </div>
  );
}
