// @ts-nocheck
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
router.get('/me', auth.authenticate(), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        skills: true,
        interests: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            mentorships: true,
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
router.patch('/me', auth.authenticate(), validateRequest(updateProfileSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: req.body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        skills: true,
        interests: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
router.get('/:id', auth.optionalAuth(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const isOwnProfile = req.user?.id === id;
    const isAdmin = req.user?.role === 'admin';

    // Define select based on access level
    const publicSelect = {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      location: true,
      role: true,
      createdAt: true,
    };

    const privateSelect = {
      ...publicSelect,
      email: true,
      phone: true,
      skills: true,
      interests: true,
      emailVerified: true,
      isActive: true,
      updatedAt: true,
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
router.get('/', auth.authenticate(), auth.authorize('admin'), async (req, res, next) => {
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
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
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
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
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
router.patch('/:id', auth.authenticate(), auth.selfOrAdmin(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === 'admin';

    // Non-admins cannot update certain fields
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.emailVerified;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        skills: true,
        interests: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
router.delete('/:id', auth.authenticate(), auth.authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

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
router.post('/:id/verify-email', auth.authenticate(), auth.authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    res.json({ data: user, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /users/:id/applications
 * @desc Get user's applications (self or admin)
 * @access Private (Self or Admin)
 */
router.get('/:id/applications', auth.authenticate(), auth.selfOrAdmin(), async (req, res, next) => {
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
              company: true,
              location: true,
              type: true,
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
router.get('/:id/saved-jobs', auth.authenticate(), auth.selfOrAdmin(), async (req, res, next) => {
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
              company: true,
              location: true,
              type: true,
              salaryMin: true,
              salaryMax: true,
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

