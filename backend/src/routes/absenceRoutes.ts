import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get absences (Admin sees all, normal user sees their own)
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;
    
    // Admins get everything (or optionally filter by month). For now, everything recent.
    const whereClause = userRole === 'ADMIN' ? {} : { userId };

    const absences = await prisma.professionalAbsence.findMany({
      where: whereClause,
      orderBy: { start: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(absences);
  } catch (error) {
    console.error('Error fetching absences:', error);
    res.status(500).json({ error: 'Error fetching absences' });
  }
});

// Create an absence
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { start, end, reason } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: 'Faltan fechas de inicio o fin' });
    }

    const absence = await prisma.professionalAbsence.create({
      data: {
        userId,
        start: new Date(start),
        end: new Date(end),
        reason
      }
    });

    res.json(absence);
  } catch (error) {
    console.error('Error creating absence:', error);
    res.status(500).json({ error: 'Error creating absence' });
  }
});

// Delete an absence
router.delete('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { id } = req.params;

    const absence = await prisma.professionalAbsence.findUnique({ where: { id } });
    if (!absence) return res.status(404).json({ error: 'Ausencia no encontrada' });

    if (absence.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await prisma.professionalAbsence.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting absence:', error);
    res.status(500).json({ error: 'Error deleting absence' });
  }
});

export default router;
