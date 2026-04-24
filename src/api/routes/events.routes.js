const express = require('express');
const { createEvent } = require('../controllers/events.controller');

const router = express.Router();

router.post('/', createEvent);

module.exports = router;
