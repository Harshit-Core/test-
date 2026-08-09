import { Request, Response } from 'express';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.userId;
    const { jobId, status, notes } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const requestedStatus = status || ApplicationStatus.SAVED;

    const application = await prisma.application.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      },
      update: {
        status: requestedStatus,
        notes: notes || null,
        ...(requestedStatus === ApplicationStatus.APPLIED
          ? { appliedDate: new Date() }
          : {})
      },
      create: {
        userId,
        jobId,
        status: requestedStatus,
        notes: notes || null,
        appliedDate: requestedStatus === ApplicationStatus.APPLIED ? new Date() : null
      },
      include: {
        job: true
      }
    });

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application' });
  }
};

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { applicationId } = req.params;
    const userId = req.user?.userId;
    const { status, notes } = req.body;

    const existing = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === ApplicationStatus.APPLIED && !existing.appliedDate) {
        updateData.appliedDate = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        job: true
      }
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.userId;

    const existing = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    await prisma.application.delete({
      where: { id: applicationId }
    });

    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: true
    });

    const formattedStats = stats.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
