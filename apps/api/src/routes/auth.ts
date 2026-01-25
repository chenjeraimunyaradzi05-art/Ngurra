/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and session management.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../lib/errors';
import { forgotPasswordSchema, resetPasswordSchema } from '../lib/validation';
import { emailService } from '../services/emailService';
import { redisCache } from '../lib/redisCacheWrapper';

const router = Router();

// Secure JWT secret handling - NEVER use weak fallback in production
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.DEV_JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET must be set in production');
    }
    console.warn('⚠️  Using development JWT secret - set JWT_SECRET for production!');
    return 'ngurra-dev-secret-minimum-32-chars';
  }
  
  if (secret.length < 32 && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters');
  }
  
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userType: z.enum(['MEMBER', 'COMPANY', 'MENTOR', 'TAFE']).default('MEMBER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Generate JWT token for a user
 */
function generateToken(user: { id: string; email: string; userType: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, userType: user.userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return void res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, firstName, lastName, userType } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return void res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists. Please sign in.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with member profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: `${firstName} ${lastName}`,
        userType: userType as any,
        password: hashedPassword,
        memberProfile: userType === 'MEMBER' ? {
          create: {
            phone: null,
            mobNation: null,
            skillLevel: null,
            careerInterest: null,
            bio: null,
          },
        } : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        createdAt: true,
      },
    });

    // Store password hash in existing User.password column
    await prisma.$executeRaw`
      UPDATE "User" SET "password" = ${hashedPassword} WHERE id = ${user.id}
    `;

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          profile: {
            firstName,
            lastName,
          },
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /auth/login
 * @desc Login user and return token
 * @access Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return void res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
          },
        },
      },
    });

    if (!user) {
      return void res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    const credentials = await prisma.$queryRaw<
      { password: string | null }[]
    >`SELECT "password" FROM "User" WHERE id = ${user.id} LIMIT 1`;

    const passwordHash = credentials[0]?.password || null;

    if (!passwordHash) {
      return void res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return void res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    // Generate token
    const token = generateToken(user);

    // Parse name into first/last
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          profile: {
            firstName,
            lastName,
            avatar: user.avatarUrl,
          },
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /auth/me
 * @desc Get current user from token
 * @access Private
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return void res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return void res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
          },
        },
      },
    });

    if (!user) {
      return void res.status(404).json({ error: 'User not found' });
    }

    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        profile: {
          firstName,
          lastName,
          avatar: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset (always returns success)
 * @access Public
 */
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return void res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const email = validation.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenKey = `password_reset:${token}`;
      const userKey = `password_reset:user:${user.id}`;
      const ttlSeconds = 60 * 60; // 1 hour

      // Invalidate any existing token for this user
      const previousToken = await redisCache.get<string>(userKey);
      if (previousToken) {
        await redisCache.delete(`password_reset:${previousToken}`);
      }

      await redisCache.set(tokenKey, { userId: user.id, email: user.email }, ttlSeconds);
      await redisCache.set(userKey, token, ttlSeconds);

      const firstName = (user.name || 'there').split(' ')[0];
      try {
        await emailService.sendPasswordReset(user.email, firstName, token);
      } catch (err) {
        console.error('Failed to send password reset email', err);
      }
    }

    // Always return success to prevent email enumeration
    return void res.json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return void res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { token, password } = validation.data;
    const tokenKey = `password_reset:${token}`;
    const record = await redisCache.get<{ userId: string; email: string }>(tokenKey);

    if (!record?.userId) {
      return void res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    });

    await redisCache.delete(tokenKey);
    await redisCache.delete(`password_reset:user:${record.userId}`);

    return void res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /auth/logout
 * @desc Logout user (client-side token removal)
 * @access Public
 */
router.post('/logout', (_req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side
  // In production, you might want to blacklist tokens or use refresh tokens
  res.json({ message: 'Logout successful' });
});

export default router;

