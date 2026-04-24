const { processEvent } = require('../workers/event.worker');

let pendingJobs = [];

/**
 * Publish event to topic (mock Pub/Sub)
 */
const publish = async (topic, message) => {
  console.log(
    `[PUBSUB MOCK] topic: ${topic}, message: ${JSON.stringify(message, null, 2)}`
  );

  const job = (async () => {
    try {
      await processEvent(message);
    } catch (error) {
      console.error('[PUBSUB MOCK] Worker failed:', error);
    }
  })();

  pendingJobs.push(job);

  // Only auto-ignore in production
  if (process.env.NODE_ENV !== 'test') {
    job.catch(() => {});
  }
};

/**
 * TEST ONLY: flush all async worker jobs
 */
const flush = async () => {
  await Promise.all(pendingJobs);
  pendingJobs = [];
};

module.exports = {
  publish,
  flush,
};

