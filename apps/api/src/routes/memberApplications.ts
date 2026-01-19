import express from 'express';
import { prisma } from '../db';
import auth from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// GET /member/applications - list current user's applications
router.get('/', auth.authenticate, async (req, res) => {
    const userId = (req as any).user?.id;
    try {
        const apps = await prisma.jobApplication.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { job: { include: { user: { select: { id: true, email: true } }, }, }, resume: true } });
        return res.json({ applications: apps });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('member list applications error', err);
        return res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /member/applications/:id - details for current user's application
router.get('/:id', auth.authenticate, async (req, res) => {
    const userId = (req as any).user?.id;
    const id = req.params.id;
    try {
        const app = await prisma.jobApplication.findUnique({ where: { id }, include: { job: { include: { user: { select: { id: true, email: true } } } }, resume: true } });
        if (!app || app.userId !== userId)
            return res.status(404).json({ error: 'Not found' });
        return res.json({ application: app });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('member get application error', err);
        return res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// GET /member/applications/:id/messages - list applicant-visible messages
router.get('/:id/messages', auth.authenticate, async (req, res) => {
    const userId = (req as any).user?.id;
    const id = req.params.id;
    try {
        const app = await prisma.jobApplication.findUnique({ where: { id } });
        if (!app || app.userId !== userId)
            return res.status(404).json({ error: 'Not found' });
        const msgs = await prisma.applicationMessage.findMany({ where: { applicationId: id, isPrivate: false }, orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, email: true } } } });
        return res.json({ messages: msgs });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('member messages error', err);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /member/applications/:id/messages - create a public message as applicant
router.post('/:id/messages', auth.authenticate, async (req, res) => {
    const userId = (req as any).user?.id;
    const id = req.params.id;
    const schema = z.object({ body: z.string().min(1) });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    try {
        const app = await prisma.jobApplication.findUnique({ where: { id } });
        if (!app || app.userId !== userId)
            return res.status(404).json({ error: 'Not found' });
        const msg = await prisma.applicationMessage.create({ data: { applicationId: id, userId, body: parse.data.body, isPrivate: false } });
        return res.json({ message: msg });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('member create message error', err);
        return res.status(500).json({ error: 'Failed to create message' });
    }
});

export default router;
