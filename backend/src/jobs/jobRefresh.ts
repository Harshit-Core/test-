import cron from 'node-cron';
import { PrismaClient, JobSource } from '@prisma/client';
import { fetchAdzunaJobs, fetchHimalayasJobs } from '../controllers/jobController';

const prisma = new PrismaClient();

export const refreshJobs = async (): Promise<void> => {
  console.log('Starting job refresh...');

  try {
    const [adzunaJobs, himalayasJobs] = await Promise.all([
      fetchAdzunaJobs(),
      fetchHimalayasJobs()
    ]);

    const adzunaInserts = adzunaJobs.map((job: any) => ({
      title: job.title || 'Untitled',
      company: job.company?.display_name || 'Unknown',
      description: job.description || '',
      location: job.location?.display_name || 'Remote',
      duration: null,
      isPaid: true,
      isRemote: job.location?.display_name?.toLowerCase().includes('remote') || false,
      tags: job.category?.tag ? [job.category.tag] : [],
      source: JobSource.ADZUNA,
      externalUrl: job.redirect_url,
      postedDate: job.created ? new Date(job.created) : new Date(),
      expiryDate: null
    }));

    const himalayasInserts = himalayasJobs
      .map((job: any) => ({
        title: job.title || 'Untitled',
        company: job.company_name || 'Unknown',
        description: job.excerpt || job.description || '',
        location: job.location || 'Remote',
        duration: null,
        isPaid: true,
        isRemote: job.remote === true || job.location?.toLowerCase().includes('remote'),
        tags: job.tags || [],
        source: JobSource.HIMALAYAS,
        externalUrl: job.url || `https://himalayas.app/jobs/${job.id}`,
        postedDate: job.pub_date ? new Date(job.pub_date) : new Date(),
        expiryDate: null
      }))
      .filter((job: any) => job.externalUrl && !isNaN(job.postedDate.getTime()));

    for (const jobData of [...adzunaInserts, ...himalayasInserts]) {
      await prisma.job.upsert({
        where: {
          externalUrl: jobData.externalUrl
        },
        update: jobData,
        create: jobData
      });
    }

    const expiredCount = await prisma.job.deleteMany({
      where: {
        source: { in: [JobSource.ADZUNA, JobSource.HIMALAYAS] },
        postedDate: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log(`Job refresh complete: ${adzunaInserts.length + himalayasInserts.length} jobs synced, ${expiredCount.count} expired jobs removed`);
  } catch (error) {
    console.error('Job refresh error:', error);
  }
};

export const startScheduledJobs = (): void => {
  cron.schedule('0 */6 * * *', refreshJobs);
  console.log('Job refresh scheduled: every 6 hours');
};
