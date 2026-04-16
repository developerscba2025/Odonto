import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
