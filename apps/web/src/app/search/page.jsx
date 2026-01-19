import { Suspense } from 'react';
import SearchClient from './SearchClient';
import { Loader2 } from 'lucide-react';

// Feminine theme constants
const accentPink = '#E91E8C';
const accentPurple = '#8B5CF6';

function SearchFallback() {
  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'linear-gradient(135deg, #FFF5FB 0%, #F3E8FF 100%)' }}>
      {/* Decorative Halos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-40"
          style={{ background: `radial-gradient(circle, ${accentPink}33 0%, transparent 70%)`, filter: 'blur(40px)' }}
        />
        <div 
          className="absolute top-1/3 -left-40 w-80 h-80 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${accentPurple}33 0%, transparent 70%)`, filter: 'blur(40px)' }}
        />
      </div>
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading search...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Search Page (Server Component)
 * Wraps the client search component with Suspense for useSearchParams
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  );
}
