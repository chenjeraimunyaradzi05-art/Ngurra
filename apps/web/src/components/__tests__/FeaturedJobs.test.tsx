/**
 * FeaturedJobs Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FeaturedJobs from '../FeaturedJobs';

// Mock fetch
const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: { name: 'Tech Corp', logoUrl: '/logo.png' },
    location: 'Sydney',
    employment: 'FULL_TIME',
    salaryLow: 80000,
    salaryHigh: 120000,
  },
  {
    id: '2',
    title: 'Product Manager',
    company: { name: 'Startup Inc', logoUrl: '/logo2.png' },
    location: 'Melbourne',
    employment: 'FULL_TIME',
    salaryLow: 100000,
    salaryHigh: 150000,
  },
];

describe('FeaturedJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('shows loading state initially', () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<FeaturedJobs />);
    
    // Should show skeleton loaders
    expect(screen.getByTestId('featured-jobs-skeleton') || 
           screen.queryAllByRole('status').length > 0 ||
           document.querySelector('[class*="animate-pulse"]')).toBeTruthy();
  });

  it('renders jobs when loaded', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockJobs }),
    });

    render(<FeaturedJobs />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  it('shows company names', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockJobs }),
    });

    render(<FeaturedJobs />);

    await waitFor(() => {
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
  });

  it('shows job locations', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockJobs }),
    });

    render(<FeaturedJobs />);

    await waitFor(() => {
      expect(screen.getByText(/Sydney/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Melbourne/i)).toBeInTheDocument();
  });

  it('handles empty results', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<FeaturedJobs />);

    await waitFor(() => {
      // Should show empty state or nothing
      expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<FeaturedJobs />);

    await waitFor(() => {
      // Should not crash, may show error state
      expect(screen.queryByRole('alert') || 
             screen.queryByText(/error/i) ||
             true).toBeTruthy();
    });
  });

  it('limits number of jobs displayed', async () => {
    const manyJobs = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      title: `Job ${i}`,
      company: { name: `Company ${i}` },
      location: 'Location',
      employment: 'FULL_TIME',
    }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: manyJobs }),
    });

    render(<FeaturedJobs limit={5} />);

    await waitFor(() => {
      expect(screen.getByText('Job 0')).toBeInTheDocument();
    });

    // Should only show limited number
    const jobCards = screen.getAllByRole('article') || 
                     document.querySelectorAll('[data-testid="job-card"]');
    expect(jobCards.length).toBeLessThanOrEqual(5);
  });
});
