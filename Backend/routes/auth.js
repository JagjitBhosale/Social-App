const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload').single('avatar');
const { register, login, logout, me } = require('../controllers/authController');

const router = express.Router();

router.post('/auth/signup', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, register);
router.post('/auth/login', login);
router.get('/auth/me', auth, me);
router.post('/auth/logout', auth, logout);

module.exports = router;
