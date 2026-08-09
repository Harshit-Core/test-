import { Request, Response } from 'express';
import { PrismaClient, JobSource } from '@prisma/client';
import { validationResult } from 'express-validator';
import axios from 'axios';

const prisma = new PrismaClient();

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
      return;
    }

    const {
      title,
      company,
      description,
      location,
      duration,
      isPaid,
      isRemote,
      tags,
      externalUrl,
      expiryDate
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        location,
        duration: duration || null,
        isPaid: isPaid !== undefined ? isPaid : true,
        isRemote: isRemote !== undefined ? isRemote : false,
        tags: tags || [],
        source: JobSource.MANUAL,
        externalUrl,
        postedDate: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    await prisma.job.delete({
      where: { id: jobId }
    });

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const getAllStacks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stacks = await prisma.stack.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(stacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stacks' });
  }
};

export const createStack = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      description,
      components,
      tags,
      useCase,
      teamSize,
      budget,
      learningCurve
    } = req.body;

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const embeddingResponse = await axios.post(`${aiServiceUrl}/generate-embedding`, {
      text: `${name} ${description} ${tags.join(' ')} ${useCase}`
    });

    const stack = await prisma.stack.create({
      data: {
        name,
        description,
        components,
        tags,
        useCase: useCase || '',
        teamSize: teamSize || '',
        budget: budget || '',
        learningCurve: learningCurve || '',
        embedding: JSON.stringify(embeddingResponse.data.embedding)
      }
    });

    res.status(201).json(stack);
  } catch (error) {
    console.error('Stack creation error:', error);
    res.status(500).json({ error: 'Failed to create stack' });
  }
};

export const updateStack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stackId } = req.params;
    const updateData = req.body;

    if (updateData.name || updateData.description || updateData.tags) {
      const stack = await prisma.stack.findUnique({
        where: { id: stackId }
      });

      if (stack) {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const embeddingResponse = await axios.post(`${aiServiceUrl}/generate-embedding`, {
          text: `${updateData.name || stack.name} ${updateData.description || stack.description} ${(updateData.tags || stack.tags).join(' ')}`
        });

        updateData.embedding = JSON.stringify(embeddingResponse.data.embedding);
      }
    }

    const stack = await prisma.stack.update({
      where: { id: stackId },
      data: updateData
    });

    res.json(stack);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stack' });
  }
};

export const deleteStack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stackId } = req.params;

    await prisma.stack.delete({
      where: { id: stackId }
    });

    res.json({ message: 'Stack deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stack' });
  }
};
