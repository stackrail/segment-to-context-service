/**
 * User Context Query Helpers
 *
 * Handles database operations for user personas / contexts.
 * This represents the "derived intelligence layer" of the system.
 *
 * Schema:
 *
 * CREATE TABLE user_contexts (
 *   id SERIAL PRIMARY KEY,
 *   tenant_id TEXT NOT NULL,
 *   user_id TEXT NOT NULL,
 *   persona TEXT NOT NULL,
 *   confidence FLOAT,
 *   signals JSONB,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(tenant_id, user_id)
 * );
 */

const pool = require('../index');

/**
 * Create or update user context (persona)
 * Implements UPSERT logic to maintain latest computed persona per user.
 *
 * @param {object} context
 * @param {string} context.tenant_id
 * @param {string} context.user_id
 * @param {string} context.persona
 * @param {number} context.confidence
 * @param {array|object} context.signals
 * @returns {Promise<object>}
 */
const upsertUserContext = async (context) => {
  const { tenant_id, user_id, persona, confidence, signals } = context;

  const query = `
    INSERT INTO user_contexts (
      tenant_id,
      user_id,
      persona,
      confidence,
      signals
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (tenant_id, user_id)
    DO UPDATE SET
      persona = EXCLUDED.persona,
      confidence = EXCLUDED.confidence,
      signals = EXCLUDED.signals,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [
    tenant_id,
    user_id,
    persona,
    confidence,
    signals,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get user context (latest persona)
 *
 * @param {string} tenant_id
 * @param {string} user_id
 * @returns {Promise<object|null>}
 */
const getUserContext = async (tenant_id, user_id) => {
  const query = `
    SELECT
      tenant_id,
      user_id,
      persona,
      confidence,
      signals,
      updated_at
    FROM user_contexts
    WHERE tenant_id = $1 AND user_id = $2
    LIMIT 1;
  `;

  const result = await pool.query(query, [tenant_id, user_id]);

  return result.rows[0] || null;
};

module.exports = {
  upsertUserContext,
  getUserContext,
};
