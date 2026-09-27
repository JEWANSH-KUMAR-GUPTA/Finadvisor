const finnhubService = require('../services/finnhub.service');

const searchStocks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

    const result = await finnhubService.searchSymbol(q);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Fetch quote and profile in parallel
    const [quote, profile] = await Promise.all([
      finnhubService.getQuote(symbol),
      finnhubService.getCompanyProfile(symbol)
    ]);

    res.json({ 
      success: true, 
      data: { quote, profile } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { searchStocks, getStockQuote };
