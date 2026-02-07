const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// CORS - credentials for cookies
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);
app.use('/api', notificationRoutes);
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Social Tree API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Socket.io for chat
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
});

const getConversationId = (id1, id2) => [id1, id2].map(String).sort().join('_');

io.on('connection', (socket) => {
  let userId = null;
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      socket.join(`user:${userId}`);
    } catch (e) {
      socket.disconnect(true);
      return;
    }
  }

  socket.on('chat:message', async (payload) => {
    if (!userId || !payload?.to || !payload?.text?.trim()) return;
    try {
      const message = await Message.create({
        conversationId: getConversationId(userId, payload.to),
        sender: userId,
        receiver: payload.to,
        text: payload.text.trim(),
      });
      await message.populate('sender', 'username avatar');
      await message.populate('receiver', 'username avatar');
      const room = `user:${payload.to}`;
      io.to(room).emit('chat:message', {
        id: message._id,
        conversationId: message.conversationId,
        sender: userId,
        receiver: payload.to,
        text: message.text,
        read: false,
        createdAt: message.createdAt,
        senderUsername: message.sender?.username,
        senderAvatar: message.sender?.avatar,
      });
      socket.emit('chat:message', {
        id: message._id,
        conversationId: message.conversationId,
        sender: userId,
        receiver: payload.to,
        text: message.text,
        read: false,
        createdAt: message.createdAt,
        senderUsername: message.sender?.username,
        senderAvatar: message.sender?.avatar,
      });
    } catch (err) {
      socket.emit('chat:error', { message: err.message });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  const cloudOk = (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('<'))
    || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  console.log(`Cloudinary: ${cloudOk ? 'enabled' : 'disabled (using local storage)'}`);
});
