/**
 * JobPerformanceService Tests
 * Phase 3 analytics coverage
 */

import { jobPerformanceService } from '../../src/services/jobPerformanceService';

const mockPrisma = vi.hoisted(() => ({
  jobPerformance: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  job: {
    update: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../src/db', () => ({ prisma: mockPrisma }));

describe('jobPerformanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new performance row when none exists and increments job viewCount', async () => {
    mockPrisma.jobPerformance.findUnique.mockResolvedValue(null);
    mockPrisma.jobPerformance.create.mockResolvedValue({ id: 'perf-1' });
    mockPrisma.job.update.mockResolvedValue({});

    await jobPerformanceService.trackEvent({
      jobId: 'job-1',
      eventType: 'view',
    });

    expect(mockPrisma.jobPerformance.create).toHaveBeenCalled();
    expect(mockPrisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: { viewCount: { increment: 1 } },
      })
    );
  });

  it('recalculates conversion rate when updating an existing record', async () => {
    mockPrisma.jobPerformance.findUnique.mockResolvedValue({
      id: 'perf-1',
      jobId: 'job-1',
      date: new Date('2024-01-01'),
      views: 10,
      applications: 2,
    });
    mockPrisma.jobPerformance.update.mockResolvedValue({});

    await jobPerformanceService.trackEvent({
      jobId: 'job-1',
      eventType: 'application',
    });

    const updateCall = mockPrisma.jobPerformance.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: 'perf-1' });
    expect(updateCall.data.conversionRate).toBeCloseTo(30); // (3 / 10) * 100
  });

  it('updates average time on page using existing view count', async () => {
    mockPrisma.jobPerformance.findUnique.mockResolvedValue({
      id: 'perf-1',
      jobId: 'job-1',
      date: new Date('2024-01-01'),
      views: 5,
      avgTimeOnPage: 10,
    });
    mockPrisma.jobPerformance.update.mockResolvedValue({});

    await jobPerformanceService.updatePageDuration('job-1', 20);

    const updateCall = mockPrisma.jobPerformance.update.mock.calls[0][0];
    expect(updateCall.data.avgTimeOnPage).toBeCloseTo(12); // ((10*4)+20)/5
  });
});
