const { publishEvent } = require('../../services/event.service');

/**
 * Create Event Controller
 */
const createEvent = async (req, res, next) => {
  try {
    const { event_id, tenant_id, user_id, payload = {} } = req.body;

    if (!event_id || !tenant_id || !user_id) {
      return res.status(400).json({
        error: 'Missing required fields: event_id, tenant_id, user_id',
      });
    }

    if (typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({
        error: 'payload must be an object',
      });
    }

    const event = {
      event_id,
      tenant_id,
      user_id,
      payload,
      created_at: new Date().toISOString(),
      source: 'api',
    };

    await publishEvent(event);

    return res.status(202).json({
      success: true,
      message: 'Event accepted for processing',
      event_id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
};
