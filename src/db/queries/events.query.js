/**
 * Events Query Helpers
 *
 * Low-level database operations for events.
 *
 * Schema:
 * CREATE TABLE events (
 *   id SERIAL PRIMARY KEY,
 *   event_id TEXT NOT NULL,
 *   tenant_id TEXT NOT NULL,
 *   user_id TEXT NOT NULL,
 *   payload JSONB,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(event_id, tenant_id)
 * );
 *
 * Recommended index for performance:
 * CREATE INDEX idx_events_tenant_user_created
 * ON events (tenant_id, user_id, created_at DESC);
 *
 * Idempotency:
 * UNIQUE(event_id, tenant_id) ensures duplicate events are rejected safely.
 */

const pool = require('../index');

/**
 * Insert an event into the database
 * @param {object} event
 * @returns {Promise<object>}
 */
const insertEvent = async (event) => {
  const { event_id, tenant_id, user_id, payload, created_at } = event;

  const query = `
    INSERT INTO events (event_id, tenant_id, user_id, payload, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [event_id, tenant_id, user_id, payload, created_at];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    // PostgreSQL unique violation error code
    if (error.code === '23505') {
      error.isDuplicate = true;
    }
    throw error;
  }
};

/**
 * Get last N events for a user in a tenant
 * @param {string} tenant_id
 * @param {string} user_id
 * @param {number} limit
 * @returns {Promise<Array>}
 */
const getLastEvents = async (tenant_id, user_id, limit = 50) => {
  const query = `
    SELECT event_id, tenant_id, user_id, payload, created_at
    FROM events
    WHERE tenant_id = $1 AND user_id = $2
    ORDER BY created_at DESC
    LIMIT $3;
  `;

  const values = [tenant_id, user_id, limit];

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = {
  insertEvent,
  getLastEvents,
};
