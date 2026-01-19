'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Building2, Star, ChevronRight, Crown, Gem, Sparkles } from 'lucide-react';
import api from '../lib/apiClient';
import { JobCardSkeleton } from './ui/JobCardSkeleton';

interface Job {
  id: string;
  title: string;
  company: {
    companyName: string;
    isVerified: boolean;
  };
  location: string;
  employment: string;
  salaryLow?: number;
  salaryHigh?: number;
  slug: string;
  isFeatured?: boolean;
}

// Fallback featured jobs data
const fallbackFeaturedJobs: Job[] = [
  {
    id: '1',
    title: 'Indigenous Community Liaison Officer',
    company: { companyName: 'Rio Tinto', isVerified: true },
    location: 'Perth, WA',
    employment: 'FULL_TIME',
    salaryLow: 85000,
    salaryHigh: 105000,
    slug: 'indigenous-community-liaison-officer'
  },
  {
    id: '2',
    title: 'First Nations Software Developer',
    company: { companyName: 'Atlassian', isVerified: true },
    location: 'Sydney, NSW',
    employment: 'FULL_TIME',
    salaryLow: 120000,
    salaryHigh: 160000,
    slug: 'first-nations-software-developer'
  },
  {
    id: '5',
    title: 'Indigenous Ranger - Land Management',
    company: { companyName: 'Parks Australia', isVerified: true },
    location: 'Kakadu, NT',
    employment: 'FULL_TIME',
    salaryLow: 60000,
    salaryHigh: 75000,
    slug: 'indigenous-ranger-land-management'
  },
  {
    id: '8',
    title: 'Mining Process Operator',
    company: { companyName: 'Fortescue Metals', isVerified: true },
    location: 'Port Hedland, WA',
    employment: 'FULL_TIME',
    salaryLow: 95000,
    salaryHigh: 130000,
    slug: 'mining-process-operator'
  },
  {
    id: '10',
    title: 'Indigenous Affairs Advisor',
    company: { companyName: 'Qantas Airways', isVerified: true },
    location: 'Sydney, NSW',
    employment: 'FULL_TIME',
    salaryLow: 110000,
    salaryHigh: 140000,
    slug: 'indigenous-affairs-advisor'
  },
  {
    id: '6',
    title: 'Graduate Accountant - Indigenous Program',
    company: { companyName: 'KPMG', isVerified: true },
    location: 'Brisbane, QLD',
    employment: 'FULL_TIME',
    salaryLow: 65000,
    salaryHigh: 75000,
    slug: 'graduate-accountant-indigenous-program'
  }
];

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedJobs = async () => {
      try {
        const { ok, data } = await api<{ jobs: Job[] }>('/featured/jobs?placement=homepage&limit=6', { method: 'GET' });
        const apiJobs = ok && data && typeof data === 'object' ? (data.jobs || []) : [];
        // Use fallback if API returns empty
        if (isMounted) setJobs(apiJobs.length > 0 ? apiJobs : fallbackFeaturedJobs);
      } catch (err) {
        // Network errors are expected during local dev if the API isn't running.
        // Avoid console.error() which triggers Next.js dev overlay.
        const message = err instanceof Error ? err.message : 'Failed to load featured jobs';
        if (isMounted) setError(message);
        // Use fallback data on error
        if (isMounted) setJobs(fallbackFeaturedJobs);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {jobs.map((job) => (
        <Link 
          href={`/jobs/${job.slug}`} 
          key={job.id}
          className="group bg-white/80 dark:bg-[#0f172a]/72 rounded-xl p-4 border border-slate-200 dark:border-slate-700/30 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 relative overflow-hidden backdrop-blur-md"
        >
          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{job.company.companyName}</span>
                {job.company.isVerified && (
                  <span className="text-blue-500" title="Verified Employer">
                    <Gem className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-2 py-1 shadow-sm">
                <Crown className="w-3 h-3" />
                Featured
              </span>
            </div>
          </div>
          
          <div className="relative space-y-1.5 mb-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{job.employment.replace('_', ' ')}</span>
            </div>
            {(job.salaryLow || job.salaryHigh) && (
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>
                  {job.salaryLow ? `$${(job.salaryLow / 1000).toFixed(0)}k` : ''}
                  {job.salaryLow && job.salaryHigh ? ' - ' : ''}
                  {job.salaryHigh ? `$${(job.salaryHigh / 1000).toFixed(0)}k` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="relative flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <span className="text-[11px] font-medium text-purple-600 bg-purple-50 dark:text-purple-200 dark:bg-purple-900/40 px-2 py-1 rounded transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60">
              Apply Now
            </span>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
