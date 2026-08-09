import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import axios from 'axios';

const prisma = new PrismaClient();

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { projectDescription, constraints } = req.body;
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { knownSkills: true }
    });

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/recommend`, {
      projectDescription,
      constraints: constraints || {},
      knownSkills: user?.knownSkills || []
    });

    res.json(response.data);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

export const getSavedStacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const savedStacks = await prisma.savedStack.findMany({
      where: { userId },
      include: {
        stack: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(savedStacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved stacks' });
  }
};

export const saveStack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stackId } = req.params;
    const userId = req.user?.userId;
    const { notes } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const savedStack = await prisma.savedStack.upsert({
      where: {
        userId_stackId: {
          userId,
          stackId
        }
      },
      update: {
        notes: notes || null
      },
      create: {
        userId,
        stackId,
        notes: notes || null
      },
      include: {
        stack: true
      }
    });

    res.status(200).json(savedStack);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save stack' });
  }
};

export const unsaveStack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stackId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await prisma.savedStack.deleteMany({
      where: {
        userId,
        stackId
      }
    });

    res.json({ message: 'Stack removed from saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsave stack' });
  }
};
