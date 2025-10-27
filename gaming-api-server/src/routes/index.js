const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/sessions', require('./sessions'));

module.exports = router;
