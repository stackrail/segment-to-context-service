const express = require('express');
const { getContextHandler } = require('../controllers/context.controller');

const router = express.Router();

router.get('/', getContextHandler);

module.exports = router;
