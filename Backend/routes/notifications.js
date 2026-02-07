const express = require('express');
const auth = require('../middleware/auth');
const { getNotifications, markAllRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/notifications', auth, getNotifications);
router.post('/notifications/read', auth, markAllRead);

module.exports = router;
