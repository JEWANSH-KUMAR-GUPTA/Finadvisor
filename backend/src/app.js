const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const stockRoutes = require('./routes/stock.routes');
const cryptoRoutes = require('./routes/crypto.routes');
const forexRoutes = require('./routes/forex.routes');
const watchlistRoutes = require('./routes/watchlist.routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/forex', forexRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
