const pool = require('../config/db');

const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { asset_type, symbol } = req.body;

    if (!asset_type || !symbol) {
      return res.status(400).json({ success: false, message: 'Asset type and symbol are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO watchlist (user_id, asset_type, symbol) VALUES (?, ?, ?)',
      [userId, asset_type, symbol]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, user_id: userId, asset_type, symbol }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Asset already in watchlist' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM watchlist WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found in watchlist' });
    }

    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
