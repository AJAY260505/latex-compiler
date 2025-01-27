// server/src/queues/compileQueue.js
const Queue = require('bull');
const { compileLatex } = require('../services/compiler');

const compileQueue = new Queue('compilation', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

compileQueue.process(async (job) => {
  const { latex, userId } = job.data;
  return compileLatex(latex); // Your existing compile function
});

module.exports = compileQueue;