import express from 'express';
import { CompanyService } from '../services/companyService';
import { validateRequest } from '../middleware/validate';
import { companyProfileSchema } from '../schemas/company';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res, next) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const profile = await CompanyService.getProfile(userId);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

router.post('/profile', validateRequest(companyProfileSchema), async (req, res, next) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const profile = await CompanyService.updateProfile(userId, req.body);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', validateRequest(companyProfileSchema), async (req, res, next) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    // Reuse update logic as upsert handles both
    const profile = await CompanyService.updateProfile(userId, req.body);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

export default router;

