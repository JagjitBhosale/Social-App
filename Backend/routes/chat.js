const express = require('express');
const auth = require('../middleware/auth');
const { getMessages, getConversations } = require('../controllers/chatController');

const router = express.Router();

router.get('/chat/conversations', auth, getConversations);
router.get('/chat/messages/:userId', auth, getMessages);

module.exports = router;
