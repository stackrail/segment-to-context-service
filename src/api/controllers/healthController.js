const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'segment-backend',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
