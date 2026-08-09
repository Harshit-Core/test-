import cron from 'node-cron';
import { PrismaClient, JobSource } from '@prisma/client';
import { fetchAdzunaJobs, fetchRemoteOKJobs } from '../controllers/jobController';

const prisma = new PrismaClient();

export const refreshJobs = async (): Promise<void> => {
  console.log('Starting job refresh...');

  try {
    const [adzunaJobs, remoteOKJobs] = await Promise.all([
      fetchAdzunaJobs(),
      fetchRemoteOKJobs()
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

    const remoteOKInserts = remoteOKJobs
      .map((job: any) => ({
        title: job.position || 'Untitled',
        company: job.company || 'Unknown',
        description: job.description || '',
        location: 'Remote',
        duration: null,
        isPaid: true,
        isRemote: true,
        tags: job.tags || [],
        source: JobSource.REMOTEOK,
        externalUrl: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        postedDate: job.date ? new Date(job.date * 1000) : new Date(),
        expiryDate: null
      }))
      .filter((job: any) => !isNaN(job.postedDate.getTime())); // Remove jobs with invalid dates

    for (const jobData of [...adzunaInserts, ...remoteOKInserts]) {
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
        source: { in: [JobSource.ADZUNA, JobSource.REMOTEOK] },
        postedDate: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log(`Job refresh complete: ${adzunaInserts.length + remoteOKInserts.length} jobs synced, ${expiredCount.count} expired jobs removed`);
  } catch (error) {
    console.error('Job refresh error:', error);
  }
};

export const startScheduledJobs = (): void => {
  cron.schedule('0 */6 * * *', refreshJobs);
  console.log('Job refresh scheduled: every 6 hours');
};
