const axios = require('axios');

const getQuote = async (symbol) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Finnhub getQuote error:', error.message);
    throw new Error('Failed to fetch stock data');
  }
};

const getCompanyProfile = async (symbol) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Finnhub getCompanyProfile error:', error.message);
    throw new Error('Failed to fetch company profile');
  }
};

const searchSymbol = async (query) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${process.env.FINNHUB_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Finnhub searchSymbol error:', error.message);
    throw new Error('Failed to search stock symbol');
  }
};

module.exports = { getQuote, getCompanyProfile, searchSymbol };
