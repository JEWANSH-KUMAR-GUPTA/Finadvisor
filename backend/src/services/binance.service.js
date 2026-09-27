const axios = require('axios');

const baseURL = process.env.BINANCE_API_URL || 'https://api.binance.com/api/v3';

const getTicker = async (symbol) => {
  try {
    const response = await axios.get(`${baseURL}/ticker/24hr?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Binance getTicker error:', error.message);
    throw new Error('Failed to fetch crypto data');
  }
};

const getPrice = async (symbol) => {
  try {
    const response = await axios.get(`${baseURL}/ticker/price?symbol=${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Binance getPrice error:', error.message);
    throw new Error('Failed to fetch crypto price');
  }
};

module.exports = { getTicker, getPrice };
