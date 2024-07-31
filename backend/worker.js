import emailQueue from './utils/index.js';

const startWorker = async () => {
  console.log('Starting email queue worker...');
  
  // Process jobs
  emailQueue.process((job, done) => {
    // Handle the job
    emailProcessor(job, done);
  });

  emailQueue.on('completed', (job) => {
    console.log(`Job completed: ${job.id}`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`Job failed: ${job.id}. Error: ${err.message}`);
  });

  emailQueue.on('error', (err) => {
    console.error(`Queue error: ${err.message}`);
  });
};

startWorker().catch((err) => console.error('Error starting worker:', err));
