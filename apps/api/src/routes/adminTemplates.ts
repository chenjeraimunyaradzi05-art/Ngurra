import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { prisma } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET /admin/email-templates - list templates
router.get('/email-templates', authenticate, requireAdmin, async (req, res) => {
    try {
        const templates = await prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
        return res.json({ templates });
    }
    catch (err) {
        console.error('list templates error', err);
        return res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// GET /admin/email-templates/:key
router.get('/email-templates/:key', authenticate, requireAdmin, async (req, res) => {
    const key = req.params.key;
    try {
        const t = await prisma.emailTemplate.findUnique({ where: { key } });
        if (!t)
            return res.status(404).json({ error: 'Not found' });
        return res.json({ template: t });
    }
    catch (err) {
        console.error('get template error', err);
        return res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// PATCH /admin/email-templates/:key - update template
router.patch('/email-templates/:key', authenticate, requireAdmin, async (req, res) => {
    const key = req.params.key;
    const schema = z.object({ subject: z.string().min(1).optional(), text: z.string().optional(), html: z.string().optional() });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    try {
        const existing = await prisma.emailTemplate.findUnique({ where: { key } });
        if (!existing)
            return res.status(404).json({ error: 'Not found' });
        const updated = await prisma.emailTemplate.update({ where: { key }, data: { ...parse.data } });
        return res.json({ template: updated });
    } catch (err) {
        console.error('update template error', err);
        return res.status(500).json({ error: 'Failed to update template' });
    }
});

export default router;
