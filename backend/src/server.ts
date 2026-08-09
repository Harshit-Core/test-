import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startScheduledJobs } from './jobs/jobRefresh';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    startScheduledJobs();
    console.log('Scheduled jobs started');
  }
});
