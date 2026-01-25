import { Router } from 'express';
import { z } from 'zod';
import auth from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema } from '../lib/validation';
import { BadRequestError, NotFoundError } from '../lib/errors';
import { prisma } from '../db';

const router = Router();

/**
 * @route GET /users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', auth.authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        avatarUrl: true,
        memberProfile: {
          select: {
            phone: true,
            bio: true,
            mobNation: true,
            skillLevel: true,
            careerInterest: true,
          },
        },
        userSkills: {
          select: {
            skill: {
              select: { name: true },
            },
            level: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            mentorSessions: true,
            menteeSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /users/me
 * @desc Update current user profile
 * @access Private
 */
router.patch('/me', auth.authenticate, validateRequest(updateProfileSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { name, phone, bio } = req.body || {};

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined ? { name } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.memberProfile.upsert({
        where: { userId },
        create: {
          userId,
          phone: phone ?? null,
          bio: bio ?? null,
        },
        update: {
          ...(phone !== undefined ? { phone } : {}),
          ...(bio !== undefined ? { bio } : {}),
        },
      }),
    ]);

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /users/:id
 * @desc Get user by ID (public profile)
 * @access Public (limited data) / Private (full data for self/admin)
 */
router.get('/:id', auth.optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isOwnProfile = req.user?.id === id;
    const isAdmin = req.user?.userType === 'ADMIN' || req.user?.role === 'ADMIN';

    // Define select based on access level
    const publicSelect = {
      id: true,
      name: true,
      avatarUrl: true,
      userType: true,
      createdAt: true,
    };

    const privateSelect = {
      ...publicSelect,
      email: true,
      updatedAt: true,
      memberProfile: {
        select: {
          phone: true,
          bio: true,
          mobNation: true,
          skillLevel: true,
          careerInterest: true,
        },
      },
      userSkills: {
        select: {
          skill: {
            select: { name: true },
          },
          level: true,
        },
      },
    };

    const user = await prisma.user.findUnique({
      where: { id },
      select: isOwnProfile || isAdmin ? privateSelect : publicSelect,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /users
 * @desc List users (admin only)
 * @access Private (Admin)
 */
router.get('/', auth.authenticate, auth.authorize(['ADMIN']), async (req, res, next) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      role, 
      search,
      isActive 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    const where: any = {};
    
    if (role && typeof role === 'string') {
      where.userType = role;
    }
    
    if (isActive !== undefined) {
      // Not supported in schema; ignore until field exists
    }
    
    if (search && typeof search === 'string') {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /users/:id
 * @desc Update user (self or admin)
 * @access Private (Self or Admin)
 */
router.patch('/:id', auth.authenticate, auth.selfOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.userType === 'ADMIN' || req.user!.role === 'ADMIN';
    const { name, phone, bio } = req.body || {};

    // Non-admins cannot update certain fields
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.emailVerified;
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.memberProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          phone: phone ?? null,
          bio: bio ?? null,
        },
        update: {
          ...(phone !== undefined ? { phone } : {}),
          ...(bio !== undefined ? { bio } : {}),
        },
      }),
    ]);

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /users/:id
 * @desc Delete user (admin only)
 * @access Private (Admin)
 */
router.delete('/:id', auth.authenticate, auth.authorize(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete placeholder - actual field not in schema
    await prisma.user.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /users/:id/verify-email
 * @desc Verify user email (admin only)
 * @access Private (Admin)
 */
router.post('/:id/verify-email', auth.authenticate, auth.authorize(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: {},
      select: {
        id: true,
        email: true,
      },
    });

    res.json({ data: user, message: 'Email verification is not supported in schema' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /users/:id/applications
 * @desc Get user's applications (self or admin)
 * @access Private (Self or Admin)
 */
router.get('/:id/applications', auth.authenticate, auth.selfOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId: id };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              employment: true,
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    res.json({
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /users/:id/saved-jobs
 * @desc Get user's saved jobs (self or admin)
 * @access Private (Self or Admin)
 */
router.get('/:id/saved-jobs', auth.authenticate, auth.selfOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId: id },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              employment: true,
              salaryLow: true,
              salaryHigh: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.savedJob.count({ where: { userId: id } }),
    ]);

    res.json({
      data: savedJobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


