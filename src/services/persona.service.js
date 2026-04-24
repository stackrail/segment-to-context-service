/**
 * Persona Generation Service
 *
 * Generates user personas based on recent event patterns.
 * Currently mock implementation simulating LLM-like behavior.
 * Future: integrate with actual LLM for richer persona derivation.
 */

const generatePersona = (events) => {
  if (!events || events.length === 0) {
    return {
      persona: 'New user',
      confidence: 0.3,
      signals: [],
    };
  }

  // Extract actions from event payloads
  const actions = events
    .filter((event) => event.payload && event.payload.action)
    .map((event) => event.payload.action);

  // Determine persona based on actions
  if (actions.includes('purchase')) {
    return {
      persona: 'High-intent buyer',
      confidence: 0.9,
      signals: actions,
    };
  }

  if (actions.includes('click')) {
    return {
      persona: 'Engaged user',
      confidence: 0.7,
      signals: actions,
    };
  }

  return {
    persona: 'Casual user',
    confidence: 0.5,
    signals: actions,
  };
};

module.exports = {
  generatePersona,
};
