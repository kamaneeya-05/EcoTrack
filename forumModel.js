const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  authorName: { type: String, default: 'Community Member' },
  authorEmail: String,
  title: { type: String, required: true },
  message: { type: String, required: true },
  area: { type: String, default: 'General Ward' },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
