/**
 * Wellness Service Tests
 * Phase 2 Steps 176-200
 */

import type { WellnessMood } from '@prisma/client';
const mockPrisma = vi.hoisted(() => ({
  wellnessCheckIn: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  culturalEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  culturalEventAttendee: {
    upsert: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  dailyAffirmation: {
    count: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  sisterMatch: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../src/db', () => ({
  prisma: mockPrisma,
}));

const {
  createCheckIn,
  getWellnessInsights,
  getDailyAffirmation,
  requestSisterMatch,
  respondToMatch,
  rsvpToEvent,
} = await import('../../src/services/wellness');

const mood = 'CALM' as unknown as WellnessMood;

describe('wellnessService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a check-in with the day truncated to midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T10:00:00Z'));

    mockPrisma.wellnessCheckIn.upsert.mockResolvedValue({ id: 'check-1' });

    await createCheckIn('user-1', { mood });

    const call = mockPrisma.wellnessCheckIn.upsert.mock.calls[0][0];
    expect(call.where.userId_date.userId).toBe('user-1');
    expect(call.where.userId_date.date.getHours()).toBe(0);
  });

  it('computes wellness insights averages and dominant mood', async () => {
    mockPrisma.wellnessCheckIn.findMany.mockResolvedValue([
      { mood: 'CALM', energyLevel: 6, sleepHours: 7, stressLevel: 3, connectedWithSomeone: true },
      { mood: 'HAPPY', energyLevel: 8, sleepHours: 6, stressLevel: 2, connectedWithSomeone: false },
    ]);

    const insights = await getWellnessInsights('user-1', 7);

    expect(insights?.dominantMood).toBe('CALM');
    expect(insights?.averageEnergy).toBe(7);
    expect(insights?.connectionRate).toBeCloseTo(0.5);
  });

  it('returns null affirmation when none exist and increments view count when one is found', async () => {
    mockPrisma.dailyAffirmation.count.mockResolvedValueOnce(0);

    const none = await getDailyAffirmation();
    expect(none).toBeNull();

    mockPrisma.dailyAffirmation.count.mockResolvedValueOnce(2);
    mockPrisma.dailyAffirmation.findFirst.mockResolvedValue({ id: 'aff-1', text: 'You got this' });
    mockPrisma.dailyAffirmation.update.mockResolvedValue({});

    const affirmation = await getDailyAffirmation();
    expect(affirmation?.id).toBe('aff-1');
    expect(mockPrisma.dailyAffirmation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'aff-1' },
        data: { viewCount: { increment: 1 } },
      })
    );
  });

  it('reopens an ended sister match instead of creating a duplicate', async () => {
    mockPrisma.sisterMatch.findFirst.mockResolvedValue({
      id: 'match-1',
      status: 'ended',
      user1Id: 'user-1',
      user2Id: 'user-2',
    });
    mockPrisma.sisterMatch.update.mockResolvedValue({ id: 'match-1', status: 'pending' });

    const match = await requestSisterMatch('user-1', { targetUserId: 'user-2' });

    expect(match.status).toBe('pending');
    expect(mockPrisma.sisterMatch.update).toHaveBeenCalled();
  });

  it('prevents responding to a match if the user is not the recipient', async () => {
    mockPrisma.sisterMatch.findUnique.mockResolvedValue({
      id: 'match-1',
      user1Id: 'user-1',
      user2Id: 'user-2',
      initiatedBy: 'user-1',
    });

    await expect(respondToMatch('match-1', 'user-1', true)).rejects.toThrow(
      'You cannot respond to this request'
    );
  });

  it('blocks RSVPs when an event has reached capacity', async () => {
    mockPrisma.culturalEvent.findUnique.mockResolvedValue({
      id: 'event-1',
      maxAttendees: 1,
      _count: { attendees: 1 },
    });

    await expect(rsvpToEvent('user-1', 'event-1', 'going')).rejects.toThrow('Event is full');
  });
});
