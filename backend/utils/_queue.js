import Queue from 'bull';
import _emailProcessor from './_emailProcessor.js';

const emailQueue = new Queue('emailQueue', {
  redis: {
    host: process.env.REDIS_URL
  },
});

emailQueue.process(_emailProcessor);

export default emailQueue;
