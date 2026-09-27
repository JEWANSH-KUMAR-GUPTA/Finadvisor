const pool = require('../config/db');
const { detectIntent } = require('../services/dialogflow.service');
const { generateResponse } = require('../services/gemini.service');
const finnhubService = require('../services/finnhub.service');
const binanceService = require('../services/binance.service');
const forexService = require('../services/forex.service');

const createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;
    
    const sessionTitle = title || 'New Conversation';

    const [result] = await pool.query(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [userId, sessionTitle]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, title: sessionTitle }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const [sessions] = await pool.query(
      'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSessionMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const [sessions] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [id, userId]);
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const [messages] = await pool.query(
      'SELECT id, role, message, intent, domain, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.id;

    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'Session ID and message are required' });
    }

    // Verify session
    const [sessions] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Save user message
    await pool.query(
      'INSERT INTO chat_messages (session_id, user_id, role, message) VALUES (?, ?, ?, ?)',
      [sessionId, userId, 'user', message]
    );

    // 1. Intent Classification
    const dfResult = await detectIntent(process.env.DIALOGFLOW_PROJECT_ID || 'test', sessionId.toString(), message);
    const intent = dfResult.intent;
    let params = dfResult.parameters;
    
    let domain = 'general';
    let contextData = null;

    // 2. Data Fetching based on Intent
    try {
      if (intent === 'STOCK_QUERY') {
        domain = 'stock';
        const symbol = params.symbol?.stringValue || params.symbol || 'AAPL';
        const quote = await finnhubService.getQuote(symbol);
        contextData = { symbol, quote };
      } else if (intent === 'CRYPTO_QUERY') {
        domain = 'crypto';
        const symbol = params.symbol?.stringValue || params.symbol || 'BTCUSDT';
        const ticker = await binanceService.getTicker(symbol);
        contextData = { symbol, ticker };
      } else if (intent === 'FOREX_QUERY') {
        domain = 'forex';
        const from = params.from?.stringValue || params.from || 'USD';
        const to = params.to?.stringValue || params.to || 'EUR';
        const rate = await forexService.getExchangeRate(from, to);
        contextData = { from, to, rate };
      }
    } catch (apiError) {
      console.error('External API error:', apiError);
      contextData = { error: 'Failed to fetch real-time data from external API.' };
    }

    // 3. Generate Response
    const aiResponse = await generateResponse(message, contextData);

    // Save AI message
    const [aiMsgResult] = await pool.query(
      'INSERT INTO chat_messages (session_id, user_id, role, message, intent, domain) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, userId, 'assistant', aiResponse, intent, domain]
    );
    
    // Update session timestamp
    await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

    res.json({
      success: true,
      data: {
        id: aiMsgResult.insertId,
        role: 'assistant',
        message: aiResponse,
        intent,
        domain
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createSession, getSessions, getSessionMessages, deleteSession, sendMessage };
