const express = require('express');
const { getForexRate } = require('../controllers/forex.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:pair', getForexRate);

module.exports = router;
