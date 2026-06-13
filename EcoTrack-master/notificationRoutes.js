const express = require('express');
const Notification = require('./notificationModel');

const router = express.Router();

router.get('/', async (req, res) => {
  const filter = req.query.email ? { recipientEmail: req.query.email } : {};
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(30);
  res.json(notifications);
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

module.exports = router;
