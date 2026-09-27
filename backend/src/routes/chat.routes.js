const express = require('express');
const { createSession, getSessions, getSessionMessages, deleteSession, sendMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all chat routes

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionMessages);
router.delete('/sessions/:id', deleteSession);
router.post('/', sendMessage);

module.exports = router;
