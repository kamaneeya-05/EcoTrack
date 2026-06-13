const express = require('express');
const ForumPost = require('./forumModel');

const router = express.Router();

router.get('/', async (req, res) => {
  const posts = await ForumPost.find().sort({ upvotes: -1, createdAt: -1 }).limit(50);
  res.json(posts);
});

router.post('/', async (req, res) => {
  const post = await ForumPost.create(req.body);
  res.status(201).json({ message: 'Community post created', post });
});

router.patch('/:id/upvote', async (req, res) => {
  const post = await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

module.exports = router;
