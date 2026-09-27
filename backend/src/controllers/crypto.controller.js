const binanceService = require('../services/binance.service');

const getCryptoInfo = async (req, res) => {
  try {
    const { symbol } = req.params;
    const ticker = await binanceService.getTicker(symbol);
    res.json({ success: true, data: ticker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCryptoInfo };
