import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getToothConditions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const conditions = await prisma.toothCondition.findMany({
      where: { patientId },
    });
    res.json(conditions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching odontogram' });
  }
};

export const upsertToothCondition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { toothNumber, condition, notes } = req.body;

    const record = await prisma.toothCondition.upsert({
      where: {
        patientId_toothNumber: {
          patientId,
          toothNumber: Number(toothNumber),
        },
      },
      update: {
        condition,
        notes,
      },
      create: {
        patientId,
        toothNumber: Number(toothNumber),
        condition,
        notes,
      },
    });

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving tooth condition' });
  }
};

export const getAttachments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const attachments = await prisma.patientAttachment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(attachments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching attachments' });
  }
};

export const createAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { fileName, fileUrl, fileType } = req.body;

    const attachment = await prisma.patientAttachment.create({
      data: {
        patientId,
        fileName,
        fileUrl,
        fileType,
      },
    });

    res.status(201).json(attachment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving attachment' });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.patientAttachment.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting attachment' });
  }
};
