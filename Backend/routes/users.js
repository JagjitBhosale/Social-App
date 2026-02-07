const express = require('express');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload').single('avatar');
const {
  getUser,
  searchUsers,
  updateProfile,
  followUser,
  unfollowUser,
  getUserPosts,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

router.get('/search/users', optionalAuth, searchUsers);
router.get('/users/me', auth, (req, res) => {
  req.params.id = req.user.id;
  getUser(req, res);
});
router.get('/users/:id', optionalAuth, getUser);
router.put('/users/profile', auth, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, updateProfile);
router.post('/users/:id/follow', auth, followUser);
router.post('/users/:id/unfollow', auth, unfollowUser);
router.get('/users/:id/posts', getUserPosts);
router.delete('/users/account', auth, deleteAccount);

module.exports = router;
