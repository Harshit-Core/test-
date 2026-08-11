import { Request, Response } from 'express';
import { PrismaClient, JobSource } from '@prisma/client';
import { validationResult } from 'express-validator';
import axios from 'axios';

const prisma = new PrismaClient();

interface JobFilters {
  keyword?: string;
  duration?: string;
  isPaid?: boolean;
  isRemote?: boolean;
  page?: number;
  limit?: number;
}

export const searchJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const filters: JobFilters = {
      keyword: req.query.keyword as string,
      duration: req.query.duration as string,
      isPaid: req.query.isPaid === 'true',
      isRemote: req.query.isRemote === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const where: any = {};

    // Keyword search across title, description, and company
    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { company: { contains: filters.keyword, mode: 'insensitive' } }
      ];
    }

    // Duration filter
    if (filters.duration) {
      where.duration = { contains: filters.duration, mode: 'insensitive' };
    }

    // Only filter by isPaid if explicitly provided
    if (req.query.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    // Only filter by isRemote if checkbox is checked (true)
    if (filters.isRemote === true) {
      where.isRemote = true;
    }

    const skip = (filters.page! - 1) * filters.limit!;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { postedDate: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    console.log(`Search filters:`, req.query);
    console.log(`Found ${jobs.length} jobs out of ${total} total`);

    res.json({
      jobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit!)
      }
    });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const fetchAdzunaJobs = async (): Promise<any[]> => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;

    if (!appId || !apiKey) {
      console.warn('Adzuna API credentials not configured');
      return [];
    }

    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/us/search/1`,
      {
        params: {
          app_id: appId,
          app_key: apiKey,
          what: 'software developer internship',
          results_per_page: 50
        }
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error('Adzuna API error:', error);
    return [];
  }
};

export const fetchHimalayasJobs = async (): Promise<any[]> => {
  try {
    const response = await axios.get('https://himalayas.app/jobs/api/search', {
      headers: {
        'User-Agent': 'TechStackRecommender/1.0'
      }
    });

    const jobs = response.data?.jobs || [];
    return Array.isArray(jobs) ? jobs.slice(0, 50) : [];
  } catch (error) {
    console.error('Himalayas API error:', error);
    return [];
  }
};
