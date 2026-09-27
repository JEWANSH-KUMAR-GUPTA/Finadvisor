import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, Bitcoin, DollarSign, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [marketData, setMarketData] = useState({
    stock: null,
    crypto: null,
    forex: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        const [stockRes, cryptoRes, forexRes] = await Promise.all([
          api.get('/stocks/AAPL'),
          api.get('/crypto/BTCUSDT'),
          api.get('/forex/USD_EUR')
        ]);
        
        setMarketData({
          stock: stockRes.data.data,
          crypto: cryptoRes.data.data,
          forex: forexRes.data.data
        });
      } catch (error) {
        console.error('Failed to fetch market data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketOverview();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Activity className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" /> Apple (AAPL)
            </h2>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${marketData.stock?.quote?.c?.toFixed(2) || '---'}
          </div>
          <p className={`text-sm mt-2 ${marketData.stock?.quote?.dp >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {marketData.stock?.quote?.dp >= 0 ? '+' : ''}{marketData.stock?.quote?.dp?.toFixed(2)}%
          </p>
        </div>

        {/* Crypto Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Bitcoin className="mr-2 h-5 w-5 text-orange-500" /> Bitcoin (BTC)
            </h2>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(marketData.crypto?.lastPrice || 0).toFixed(2)}
          </div>
          <p className={`text-sm mt-2 ${parseFloat(marketData.crypto?.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(marketData.crypto?.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(marketData.crypto?.priceChangePercent || 0).toFixed(2)}%
          </p>
        </div>

        {/* Forex Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-blue-500" /> USD/EUR
            </h2>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {marketData.forex?.rates?.EUR?.toFixed(4) || '---'}
          </div>
          <p className="text-sm mt-2 text-gray-500">Current Rate</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/chat" className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <MessageSquare className="mr-2 h-5 w-5" /> Ask AI Assistant
          </Link>
          <Link to="/watchlist" className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Star className="mr-2 h-5 w-5" /> View Watchlist
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
