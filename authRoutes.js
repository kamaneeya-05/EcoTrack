const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./userModel');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'citizen', area = 'General Ward', phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      area,
      phone
    });

    return res.status(201).json({
      message: 'Registered successfully',
      user: serializeUser(user)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: serializeUser(user)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    area: user.area,
    greenPoints: user.greenPoints,
    badges: user.badges
  };
}

module.exports = router;
