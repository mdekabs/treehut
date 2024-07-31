import Queue from 'bull';
import { emailProcessor } from './index.js';

const emailQueue = new Queue('emailQueue', {
  redis: {
    host: process.env.REDIS_URL
  },
});

emailQueue.process(emailProcessor);

export default emailQueue;
