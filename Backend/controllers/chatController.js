const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

const getConversationId = (id1, id2) => [id1, id2].map(String).sort().join('_');

// Get chat history with a user
exports.getMessages = async (req, res) => {
  try {
    const otherId = req.params.userId;
    const userId = req.user.id;
    const conversationId = getConversationId(userId, otherId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    const list = messages.map((m) => ({
      id: m._id,
      conversationId: m.conversationId,
      sender: m.sender?._id?.toString(),
      receiver: m.receiver?._id?.toString(),
      text: m.text,
      read: m.read,
      createdAt: m.createdAt,
      senderUsername: m.sender?.username,
      senderAvatar: m.sender?.avatar,
    }));

    res.json({ success: true, messages: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List conversations (users we've chatted with)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const myId = new mongoose.Types.ObjectId(req.user.id);
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: myId }, { receiver: myId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $limit: 50 },
    ]);

    const userIdStr = req.user.id.toString();
    const otherIds = new Set();
    messages.forEach((m) => {
      const s = m.sender?.toString();
      const r = m.receiver?.toString();
      if (s && s !== userIdStr) otherIds.add(s);
      if (r && r !== userIdStr) otherIds.add(r);
    });

    const users = await User.find({ _id: { $in: Array.from(otherIds) } })
      .select('username avatar')
      .lean();

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const conversations = messages.map((m) => {
      const otherId = m.sender?.toString() === userIdStr ? m.receiver?.toString() : m.sender?.toString();
      return {
        userId: otherId,
        username: userMap[otherId]?.username,
        avatar: userMap[otherId]?.avatar,
        lastMessage: m.text,
        lastAt: m.createdAt,
      };
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
