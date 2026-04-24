/**
 * LLM Service (Vertex AI Abstraction Layer)
 * Mock implementation - swap with Gemini API later
 */

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const callVertexAI = async (events) => {
  if (!Array.isArray(events)) {
    throw new Error('VertexAI expects an array of events');
  }

  // simulate latency
  await sleep(300);

  const actions = events
    .map((e) => e?.payload?.action)
    .filter(Boolean);

  // basic frequency scoring
  const count = (arr, val) => arr.filter(v => v === val).length;

  const purchaseScore = count(actions, 'purchase');
  const clickScore = count(actions, 'click');
  const viewScore = count(actions, 'view');

  let persona = 'Casual user';
  let confidence = 0.6;

  if (purchaseScore > 0) {
    persona = 'High-intent buyer';
    confidence = 0.9;
  } else if (clickScore > viewScore) {
    persona = 'Engaged browser';
    confidence = 0.75;
  }

  return {
    persona,
    confidence,
    signals: [...new Set(actions)],
  };
};

module.exports = {
  callVertexAI,
};
