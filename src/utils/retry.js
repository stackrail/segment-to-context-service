/**
 * Exponential backoff retry utility
 */

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const retry = async (fn, retries = 3, delay = 500) => {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      console.log(`[RETRY] Attempt ${attempt + 1} failed`);

      await sleep(delay * Math.pow(2, attempt)); // exponential backoff
    }
  }

  throw lastError;
};

module.exports = {
  retry,
};

