// @ts-nocheck
import express from 'express';
import auth from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import { prisma } from '../db';

const router = express.Router();

function formatDuration(ms) {
    const minutes = Math.round(ms / 60000);
    if (!minutes || minutes < 1) return 'Under 1m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function displayName(user) {
    if (!user) return 'Unknown';
    if (user.name) return user.name;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || user.email || 'User';
}

// GET /admin/dashboard - Admin dashboard overview
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get stats in parallel
        const [
            totalUsers,
            totalCompanies,
            totalInstitutions,
            activeJobs,
            applicationsThisMonth,
            placementsThisMonth,
            pendingCompanyVerifications,
            pendingReports,
            pendingMentorApplications,
            recentUsers,
            recentJobs,
            recentApplications,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.companyProfile.count(),
            prisma.tafeProfile.count(),
            prisma.job.count({ where: { status: 'APPROVED' } }),
            prisma.jobApplication.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            prisma.jobApplication.count({
                where: { 
                    status: 'HIRED',
                    updatedAt: { gte: startOfMonth } 
                },
            }),
            prisma.companyProfile.count({ where: { verified: false } }).catch(() => 0),
            prisma.contentReport.count({ where: { status: 'PENDING' } }).catch(() => 0),
            prisma.mentorProfile.count({ where: { verified: false } }).catch(() => 0),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, lastName: true, createdAt: true },
            }),
            prisma.job.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, createdAt: true },
                include: { company: { select: { companyName: true } } },
            }),
            prisma.jobApplication.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        ]);

        // Build recent activity
        const recentActivity = [];
        
        recentUsers.forEach(user => {
            recentActivity.push({
                id: `user-${user.id}`,
                type: 'user',
                message: `New user registration: ${user.firstName} ${user.lastName}`,
                time: formatTimeAgo(user.createdAt),
                timestamp: user.createdAt,
            });
        });

        recentJobs.forEach(job => {
            recentActivity.push({
                id: `job-${job.id}`,
                type: 'job',
                message: `New job posted: ${job.title}${job.company ? ` at ${job.company.companyName}` : ''}`,
                time: formatTimeAgo(job.createdAt),
                timestamp: job.createdAt,
            });
        });

        if (recentApplications > 0) {
            recentActivity.push({
                id: 'applications-24h',
                type: 'application',
                message: `${recentApplications} new application${recentApplications > 1 ? 's' : ''} received`,
                time: 'In last 24 hours',
                timestamp: new Date(),
            });
        }

        // Sort by timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Build pending items
        const pendingItems = [];
        if (pendingCompanyVerifications > 0) {
            pendingItems.push({ id: 'company', type: 'company', label: 'Company verifications', count: pendingCompanyVerifications });
        }
        if (pendingReports > 0) {
            pendingItems.push({ id: 'report', type: 'report', label: 'Content reports', count: pendingReports });
        }
        if (pendingMentorApplications > 0) {
            pendingItems.push({ id: 'mentor', type: 'mentor', label: 'Mentor applications', count: pendingMentorApplications });
        }

        res.json({
            stats: {
                totalUsers,
                activeJobs,
                companies: totalCompanies,
                institutions: totalInstitutions,
                applicationsThisMonth,
                placementsThisMonth,
            },
            recentActivity: recentActivity.slice(0, 10),
            pendingItems,
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// GET /admin/users - List users with filtering
router.get('/users', auth, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, userType, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};
        if (userType) where.userType = userType;
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    userType: true,
                    createdAt: true,
                    lastLoginAt: true,
                    profileComplete: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('Admin users list error:', err);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// GET /admin/moderation/stats - Moderation dashboard stats
router.get('/moderation/stats', auth, requireAdmin, async (_req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [pending, resolvedToday, resolvedSamples] = await Promise.all([
            prisma.contentReport.count({ where: { status: 'pending' } }).catch(() => 0),
            prisma.contentReport.count({ where: { resolvedAt: { gte: startOfDay } } }).catch(() => 0),
            prisma.contentReport.findMany({
                where: { resolvedAt: { not: null } },
                select: { createdAt: true, resolvedAt: true },
                orderBy: { resolvedAt: 'desc' },
                take: 200,
            }).catch(() => []),
        ]);

        const averageResponseMs = resolvedSamples.length
            ? resolvedSamples.reduce((sum, item) => sum + (new Date(item.resolvedAt).getTime() - new Date(item.createdAt).getTime()), 0) / resolvedSamples.length
            : 0;

        res.json({
            pending,
            resolvedToday,
            averageResponseTime: averageResponseMs ? formatDuration(averageResponseMs) : 'N/A',
            autoFlaggedToday: 0,
        });
    } catch (err) {
        console.error('Admin moderation stats error:', err);
        res.status(500).json({ error: 'Failed to load moderation stats' });
    }
});

// GET /admin/reports - Content reports for moderation queue
router.get('/reports', auth, requireAdmin, async (req, res) => {
    try {
        const { page = 1, pageSize = 20, status, priority } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(pageSize);

        const where: any = {};
        if (status) {
            const statusList = String(status).split(',').map(s => s.trim()).filter(Boolean);
            if (statusList.length) where.status = { in: statusList };
        }
        if (priority) {
            const priorityList = String(priority).split(',').map(s => s.trim()).filter(Boolean);
            if (priorityList.length) where.priority = { in: priorityList };
        }

        const reports = await prisma.contentReport.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(pageSize),
        });

        const reporterIds = Array.from(new Set(reports.map(r => r.reporterId).filter(Boolean)));
        const targetUserIds = Array.from(new Set(reports.filter(r => r.targetType === 'user').map(r => r.targetId)));
        const users = await prisma.user.findMany({
            where: { id: { in: [...reporterIds, ...targetUserIds] } },
            select: { id: true, name: true, firstName: true, lastName: true, email: true },
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        const mapped = reports.map(report => {
            const reporter = userMap.get(report.reporterId);
            const targetUser = report.targetType === 'user' ? userMap.get(report.targetId) : null;
            const statusMap = report.status === 'under_review' ? 'reviewing' : report.status;
            return {
                id: report.id,
                contentType: report.targetType,
                contentId: report.targetId,
                contentPreview: (report.description || report.reason || `Reported ${report.targetType}`).slice(0, 140),
                reason: report.reason,
                reportedBy: { id: report.reporterId, name: displayName(reporter) },
                reportedUser: {
                    id: report.targetId,
                    name: targetUser ? displayName(targetUser) : 'Content item',
                },
                status: statusMap,
                priority: report.priority,
                createdAt: report.createdAt,
                aiScore: null,
                aiCategories: [],
            };
        });

        res.json({ reports: mapped });
    } catch (err) {
        console.error('Admin reports error:', err);
        res.status(500).json({ error: 'Failed to load reports' });
    }
});

// POST /admin/reports/:id/:action - Moderation actions
router.post('/reports/:id/:action', auth, requireAdmin, async (req, res) => {
    try {
        const { id, action } = req.params;
        const adminId = req.user?.id;

        const report = await prisma.contentReport.findUnique({ where: { id } });
        if (!report) return void res.status(404).json({ error: 'Report not found' });

        const actionMap: Record<string, { status: string; actionTaken: string; resolution: string }> = {
            approve: { status: 'resolved', actionTaken: 'remove_content', resolution: 'Report approved' },
            remove: { status: 'resolved', actionTaken: 'remove_content', resolution: 'Content removed' },
            dismiss: { status: 'dismissed', actionTaken: 'dismiss', resolution: 'Report dismissed' },
            warn: { status: 'resolved', actionTaken: 'warn_user', resolution: 'Warning issued' },
        };

        const mapped = actionMap[action];
        if (!mapped) return void res.status(400).json({ error: 'Invalid action' });

        const updated = await prisma.contentReport.update({
            where: { id },
            data: {
                status: mapped.status,
                actionTaken: mapped.actionTaken,
                resolution: mapped.resolution,
                resolvedBy: adminId,
                resolvedAt: new Date(),
            },
        });

        await prisma.moderationAction.create({
            data: {
                moderatorId: adminId,
                targetUserId: report.targetType === 'user' ? report.targetId : null,
                targetContentId: report.targetType === 'user' ? null : report.targetId,
                targetType: report.targetType,
                action: mapped.actionTaken,
                reason: report.reason,
                notes: mapped.resolution,
                reportId: report.id,
            },
        });

        res.json({ report: updated });
    } catch (err) {
        console.error('Admin report action error:', err);
        res.status(500).json({ error: 'Failed to process report action' });
    }
});

// GET /admin/system-health - System health check
router.get('/system-health', auth, requireAdmin, async (req, res) => {
    try {
        const dbCheck = await prisma.$queryRaw`SELECT 1 as ok`;
        const dbStatus = dbCheck ? 'healthy' : 'unhealthy';

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                api: 'healthy',
            },
            version: process.env.npm_package_version || '1.0.0',
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: err.message,
        });
    }
});

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
}

export default router;


export {};

