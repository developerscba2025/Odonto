import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get recent activity logs (Admin only)
router.get('/', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Error fetching activity logs' });
  }
});

export default router;
