const express = require('express');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { uploadPost } = require('../middleware/upload');
const {
  getPosts,
  createPost,
  likePost,
  commentPost,
  deleteComment,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

router.get('/posts', optionalAuth, getPosts);
router.post('/posts', auth, (req, res, next) => {
  uploadPost.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, createPost);
router.post('/posts/:id/like', auth, likePost);
router.post('/posts/:id/comments', auth, commentPost);
router.delete('/posts/:postId/comments/:commentId', auth, deleteComment);
router.delete('/posts/:id', auth, deletePost);

module.exports = router;
