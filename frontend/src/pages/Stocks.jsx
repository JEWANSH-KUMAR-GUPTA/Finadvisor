import React, { useState } from 'react';
import api from '../services/api';
import { Search, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stocks = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await api.get(`/stocks/${symbol.toUpperCase()}`);
      setStockData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock data. Check the symbol.');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock historical data for the chart, since Finnhub free tier doesn't easily give intraday historical without complex params
  const generateMockHistory = (currentPrice) => {
    const data = [];
    let price = currentPrice * 0.9; // Start 10% lower
    for (let i = 0; i < 7; i++) {
      price = price + (Math.random() * (currentPrice * 0.05) - (currentPrice * 0.02));
      data.push({
        day: `Day ${i + 1}`,
        price: parseFloat(price.toFixed(2))
      });
    }
    data.push({ day: 'Today', price: currentPrice });
    return data;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stocks</h1>
      
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !symbol}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Search'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2" /> {error}
          </div>
        )}
      </div>

      {/* Stock Details */}
      {stockData && stockData.quote && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {stockData.profile?.name || symbol.toUpperCase()}
              </h2>
              <p className="text-sm text-gray-500">{stockData.profile?.ticker || symbol.toUpperCase()} • {stockData.profile?.exchange || 'US Market'}</p>
            </div>
            
            <div className="py-4 border-t border-b border-gray-200 dark:border-gray-700">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                ${stockData.quote.c?.toFixed(2)}
              </div>
              <div className={`flex items-center mt-2 ${stockData.quote.dp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-5 w-5 mr-1 ${stockData.quote.dp < 0 && 'transform rotate-180'}`} />
                <span className="font-semibold text-lg">
                  {stockData.quote.d > 0 ? '+' : ''}{stockData.quote.d?.toFixed(2)} ({stockData.quote.dp > 0 ? '+' : ''}{stockData.quote.dp?.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Previous Close</span>
                <span className="font-medium dark:text-gray-300">${stockData.quote.pc?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Open</span>
                <span className="font-medium dark:text-gray-300">${stockData.quote.o?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Day High</span>
                <span className="font-medium dark:text-gray-300">${stockData.quote.h?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Day Low</span>
                <span className="font-medium dark:text-gray-300">${stockData.quote.l?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Price History (7 Days Simulation)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateMockHistory(stockData.quote.c)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis domain={['auto', 'auto']} stroke="#6B7280" tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                    itemStyle={{ color: '#3B82F6' }}
                    formatter={(value) => [`$${value}`, 'Price']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;
