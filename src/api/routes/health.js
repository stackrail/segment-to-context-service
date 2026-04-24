const express = require('express');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

// cleaner: base path handled in index.js
router.get('/', getHealth);

module.exports = router;
