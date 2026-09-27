const express = require('express');
const { getCryptoInfo } = require('../controllers/crypto.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:symbol', getCryptoInfo);

module.exports = router;
