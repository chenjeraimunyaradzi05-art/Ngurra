/**
 * Women Housing Service Tests
 * Phase 2 Steps 126-150
 */

import type { HousingType } from '@prisma/client';
import {
  createListing,
  publishListing,
  searchListings,
  sendInquiry,
  addListingPhotos,
  respondToInquiry,
  updateSeekerProfile,
} from '../../src/services/womenHousing';
const mockPrisma = vi.hoisted(() => ({
  womenHousingPortal: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  womenHousingPhoto: {
    count: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
  womenHousingInquiry: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  womenHousingSave: {
    upsert: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  womenHousingProfile: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../src/db', () => ({
  prisma: mockPrisma,
}));

const housingType = 'APARTMENT' as unknown as HousingType;

describe('womenHousingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a housing listing with women-only default and draft status', async () => {
    mockPrisma.womenHousingPortal.create.mockResolvedValue({ id: 'listing-1', status: 'DRAFT', womenOnly: true });

    const listing = await createListing('owner-1', {
      title: 'Safe home',
      description: 'Secure place',
      housingType,
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      rentPerWeek: 500,
      bedrooms: 2,
      bathrooms: 1,
      availableFrom: new Date('2024-02-01'),
    });

    expect(mockPrisma.womenHousingPortal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DRAFT',
          womenOnly: true,
          ownerId: 'owner-1',
        }),
      })
    );
    expect(listing.status).toBe('DRAFT');
  });

  it('throws when publishing a listing that does not belong to the owner', async () => {
    mockPrisma.womenHousingPortal.findFirst.mockResolvedValue(null);

    await expect(publishListing('listing-1', 'owner-1')).rejects.toThrow('Listing not found');
  });

  it('applies search filters for accessibility, rent, and First Nations preference', async () => {
    mockPrisma.womenHousingPortal.findMany.mockResolvedValue([]);
    mockPrisma.womenHousingPortal.count.mockResolvedValue(0);

    await searchListings({
      state: 'NSW',
      minRent: 200,
      maxRent: 600,
      accessibilityNeeded: true,
      firstNationsPreferred: true,
    });

    expect(mockPrisma.womenHousingPortal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          state: 'NSW',
          firstNationsPreferred: true,
          rentPerWeek: expect.objectContaining({ gte: 200, lte: 600 }),
          accessibilityFeatures: { isEmpty: false },
        }),
      })
    );
  });

  it('prevents duplicate inquiries for the same listing', async () => {
    mockPrisma.womenHousingInquiry.findFirst.mockResolvedValue({ id: 'inq-1' });

    await expect(
      sendInquiry('seeker-1', { listingId: 'listing-1', message: 'Interested!' })
    ).rejects.toThrow('You have already sent an inquiry for this listing');
  });

  it('sets the first uploaded photo as primary when none exists', async () => {
    mockPrisma.womenHousingPortal.findFirst.mockResolvedValue({ id: 'listing-1', ownerId: 'owner-1' });
    mockPrisma.womenHousingPhoto.count.mockResolvedValue(0);
    mockPrisma.womenHousingPhoto.createMany.mockResolvedValue({ count: 2 });
    mockPrisma.womenHousingPhoto.findMany.mockResolvedValue([
      { id: 'photo-1', isPrimary: true },
      { id: 'photo-2', isPrimary: false },
    ]);

    const photos = await addListingPhotos('listing-1', 'owner-1', [
      { url: 'one.jpg' },
      { url: 'two.jpg' },
    ]);

    const createArgs = mockPrisma.womenHousingPhoto.createMany.mock.calls[0][0];
    expect(createArgs.data[0].isPrimary).toBe(true);
    expect(photos[0].isPrimary).toBe(true);
  });

  it('throws when responding to an inquiry not owned by the user', async () => {
    mockPrisma.womenHousingInquiry.findUnique.mockResolvedValue({
      id: 'inq-1',
      listing: { ownerId: 'different-owner' },
    });

    await expect(
      respondToInquiry('inq-1', 'owner-1', { message: 'Hi', status: 'responded' })
    ).rejects.toThrow('Inquiry not found');
  });

  it('upserts a seeker profile with provided fields', async () => {
    mockPrisma.womenHousingProfile.upsert.mockResolvedValue({ userId: 'user-1', minBudget: 300 });

    const profile = await updateSeekerProfile('user-1', {
      minBudget: 300,
      preferredStates: ['NSW'],
      urgency: 'soon',
    });

    expect(mockPrisma.womenHousingProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        create: expect.objectContaining({ userId: 'user-1', minBudget: 300 }),
        update: expect.objectContaining({ minBudget: 300 }),
      })
    );
    expect(profile.userId).toBe('user-1');
  });
});
