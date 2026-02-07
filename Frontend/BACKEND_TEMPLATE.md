# 🛠️ Backend Template - Node.js + Express + MongoDB

This guide helps you set up the backend for Social Tree.

---

## 📋 Project Setup

### 1. Create Backend Project
```bash
mkdir social-tree-backend
cd social-tree-backend
npm init -y
```

### 2. Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### 3. Create Project Structure
```
backend/
├── server.js              # Main entry point
├── .env                   # Environment variables
├── .gitignore             # Git ignore
├── models/
│   ├── User.js            # User schema
│   └── Post.js            # Post schema
├── routes/
│   ├── auth.js            # Auth routes
│   ├── posts.js           # Posts routes
│   └── users.js           # Users routes
├── middleware/
│   ├── auth.js            # Auth middleware
│   └── errorHandler.js    # Error handling
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── postController.js  # Post logic
│   └── userController.js  # User logic
└── config/
    └── db.js              # Database config
```

---

## 📝 Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-tree
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-tree

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

---

## 🗄️ Database Models

### User Model (`models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't return password by default
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=0',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Post Model (`models/Post.js`)

```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000,
  },
  image: {
    type: String,
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', postSchema);
```

---

## 🔐 Authentication Middleware (`middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied',
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

module.exports = auth;
```

---

## 🔑 Auth Routes & Controllers

### Auth Routes (`routes/auth.js`)

```javascript
const express = require('express');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/auth/signup', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

module.exports = router;
```

### Auth Controller (`controllers/authController.js`)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    
    // Create user
    user = await User.create({
      username,
      email,
      password,
    });
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
```

---

## 📝 Posts Routes & Controller

### Posts Routes (`routes/posts.js`)

```javascript
const express = require('express');
const auth = require('../middleware/auth');
const {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  commentPost,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', auth, createPost);
router.post('/posts/:id/like', auth, likePost);
router.post('/posts/:id/unlike', auth, unlikePost);
router.post('/posts/:id/comments', auth, commentPost);
router.delete('/posts/:id', auth, deletePost);

module.exports = router;
```

### Posts Controller (`controllers/postController.js`)

```javascript
const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments();
    
    res.json({
      success: true,
      posts,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide post content',
      });
    }
    
    const post = await Post.create({
      author: req.user.id,
      content,
      image: req.body.image || null,
    });
    
    await post.populate('author', 'username avatar');
    
    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this post',
      });
    }
    
    post.likes.push(req.user.id);
    await post.save();
    
    res.json({
      success: true,
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unlike post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user.id
    );
    await post.save();
    
    res.json({
      success: true,
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Comment on post
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text',
      });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    post.comments.push({
      author: req.user.id,
      text,
    });
    
    await post.save();
    await post.populate('comments.author', 'username avatar');
    
    res.json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

---

## 👥 Users Routes & Controller

### Users Routes (`routes/users.js`)

```javascript
const express = require('express');
const auth = require('../middleware/auth');
const {
  getUser,
  updateProfile,
  followUser,
  unfollowUser,
  getUserPosts,
} = require('../controllers/userController');

const router = express.Router();

router.get('/users/:id', getUser);
router.put('/users/profile', auth, updateProfile);
router.post('/users/:id/follow', auth, followUser);
router.post('/users/:id/unfollow', auth, unfollowUser);
router.get('/users/:id/posts', getUserPosts);

module.exports = router;
```

---

## 🚀 Main Server File (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📦 Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

Run with:
```bash
npm run dev
```

---

## 🚀 Deploy Backend

### Option 1: Render
1. Create account at https://render.com
2. Push code to GitHub
3. Connect repository
4. Add environment variables
5. Deploy!

### Option 2: Railway
1. Go to https://railway.app
2. Connect GitHub
3. Select repository
4. Add MongoDB
5. Deploy!

### Option 3: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

---

## ✅ Testing

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World!"}'
```

---

For more details, see the API Examples in the frontend repo!
