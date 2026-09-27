const forexService = require('../services/forex.service');

const getForexRate = async (req, res) => {
  try {
    const { pair } = req.params; // e.g., USD_INR
    const [from, to] = pair.split('_');
    
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'Invalid pair format. Use FROM_TO' });
    }

    const data = await forexService.getExchangeRate(from, to);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getForexRate };
