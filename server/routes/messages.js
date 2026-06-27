const express = require('express');
const router = express.Router();
const {
  getConversations, getOrCreateConversation, getMessages, sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConversations);
router.post('/find-or-create', protect, getOrCreateConversation);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
