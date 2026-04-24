/**
 * Event Worker (Vertex AI + Retry Integration)
 */

const { insertEvent, getLastEvents } = require('../db/queries/events.query');
const { upsertUserContext } = require('../db/queries/context.query');
const { callVertexAI } = require('../services/llm.service');

/**
 * Simple exponential backoff retry helper
 * (required for LLM reliability / Tier 2)
 */
const retry = async (fn, retries = 3, delay = 500) => {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;

    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

const processEvent = async (message) => {
  const { event_id, tenant_id, user_id } = message;

  try {
    console.log(
      `[WORKER] Processing event: ${event_id} (tenant: ${tenant_id}, user: ${user_id})`
    );

    /**
     * 1. Persist event (idempotent)
     */
    await insertEvent(message);
    console.log(`[WORKER] Event stored successfully: ${event_id}`);

    /**
     * 2. Aggregate recent events
     */
    let recentEvents = [];

    try {
      const result = await getLastEvents(tenant_id, user_id, 50);
      recentEvents = Array.isArray(result) ? result : [];

      console.log(
        `[WORKER] Aggregated ${recentEvents.length} events for user ${user_id} (tenant: ${tenant_id})`
      );

      if (recentEvents.length > 0) {
        console.log('[WORKER] Recent events preview:');
        console.log(JSON.stringify(recentEvents.slice(0, 3), null, 2));
      }

      const actions = recentEvents
        .map((e) => e?.payload?.action)
        .filter(Boolean);

      console.log(`[WORKER] Signals extracted: ${actions.join(', ')}`);
    } catch (aggregationError) {
      console.error(
        `[WORKER] Failed to aggregate events for user ${user_id} (tenant: ${tenant_id}):`,
        aggregationError.message
      );

      recentEvents = [];
    }

    /**
     * 3. Persona generation (Vertex AI + retry logic)
     */
    if (recentEvents.length > 0) {
      try {
        const context = await retry(
          () => callVertexAI(recentEvents),
          3,
          500
        );

        console.log(`[WORKER] Generated persona: ${context.persona}`);

        await upsertUserContext({
          tenant_id,
          user_id,
          ...context,
        });

        console.log(`[WORKER] User context updated for ${user_id}`);
      } catch (personaError) {
        console.error(
          `[WORKER] LLM failed after retries for user ${user_id} (tenant: ${tenant_id}):`,
          personaError.message
        );
      }
    } else {
      console.log(
        `[WORKER] Skipping persona generation (no recent events for user ${user_id})`
      );
    }

    console.log(`[WORKER] Finished processing event: ${event_id}`);
  } catch (error) {
    /**
     * Idempotency handling (Postgres duplicate event)
     */
    if (error.code === '23505') {
      console.log(
        `[WORKER] Duplicate event ignored: ${event_id} (tenant: ${tenant_id})`
      );
      return;
    }

    console.error(
      `[WORKER] Fatal error processing event: ${event_id} (tenant: ${tenant_id})`,
      error
    );

    throw error;
  }
};

module.exports = {
  processEvent,
};
