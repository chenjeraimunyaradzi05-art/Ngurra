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
import { BadRequestError, UnauthorizedError, NotFoundError } from '../lib/errors';

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
    { expiresIn: JWT_EXPIRES_IN }
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
      return res.status(400).json({
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
      return res.status(409).json({
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
      return res.status(400).json({
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
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    const credentials = await prisma.$queryRaw<
      { password: string | null }[]
    >`SELECT "password" FROM "User" WHERE id = ${user.id} LIMIT 1`;

    const passwordHash = credentials[0]?.password || null;

    if (!passwordHash) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
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
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
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
      return res.status(404).json({ error: 'User not found' });
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
