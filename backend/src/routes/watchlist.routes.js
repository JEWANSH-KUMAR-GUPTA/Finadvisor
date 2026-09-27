const express = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlist.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
