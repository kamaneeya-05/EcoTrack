const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientEmail: String,
  title: String,
  message: String,
  channel: {
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: 'in-app'
  },
  read: { type: Boolean, default: false },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
