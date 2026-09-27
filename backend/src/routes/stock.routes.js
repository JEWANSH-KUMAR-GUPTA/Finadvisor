const express = require('express');
const { searchStocks, getStockQuote } = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Optional: protect market data endpoints too

router.get('/search', searchStocks);
router.get('/:symbol', getStockQuote);

module.exports = router;
