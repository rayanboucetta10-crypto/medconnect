const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profilePhoto role city')
      .populate({
        path: 'lastMessage',
        select: 'content fileUrl fileName createdAt senderId',
        populate: { path: 'senderId', select: 'name' },
      })
      .sort({ updatedAt: -1 });

    // Attach unread counts
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user._id },
          readBy: { $not: { $elemMatch: { $eq: req.user._id } } },
        });
        return { ...conv.toObject(), unreadCount };
      })
    );

    res.json({ conversations: withUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherId } = req.body;
    if (!otherId) return res.status(400).json({ message: 'otherId required' });

    const other = await User.findById(otherId);
    if (!other) return res.status(404).json({ message: 'User not found' });

    // Find existing conversation between these two users
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, otherId], $size: 2 },
    }).populate('participants', 'name profilePhoto role');

    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, otherId] });
      conv = await conv.populate('participants', 'name profilePhoto role');
    }

    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Verify user is a participant
    if (!conv.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Message.countDocuments({ conversationId: req.params.id });

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'name profilePhoto role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark all as read
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user._id },
        readBy: { $not: { $elemMatch: { $eq: req.user._id } } },
      },
      { $addToSet: { readBy: req.user._id }, $set: { status: 'read' } }
    );

    res.json({ messages, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, fileUrl, fileType, fileName } = req.body;
    if (!content && !fileUrl) return res.status(400).json({ message: 'Content or file required' });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    if (!conv.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user._id,
      content: content || '',
      fileUrl: fileUrl || '',
      fileType: fileType || '',
      fileName: fileName || '',
      readBy: [req.user._id],
      status: 'sent',
    });

    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    await message.populate('senderId', 'name profilePhoto role');
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
