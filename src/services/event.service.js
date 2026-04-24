const messageBroker = require('../utils/messageBroker');

const TOPIC = 'events';

const publishEvent = async (event) => {
  await messageBroker.publish(TOPIC, event);
};

module.exports = { publishEvent };