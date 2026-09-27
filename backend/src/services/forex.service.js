const axios = require('axios');

const getExchangeRate = async (from, to) => {
  try {
    const response = await axios.get(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    return response.data;
  } catch (error) {
    console.error('Forex getExchangeRate error:', error.message);
    throw new Error('Failed to fetch forex data');
  }
};

module.exports = { getExchangeRate };
