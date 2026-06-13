const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['citizen', 'worker', 'supervisor', 'admin'],
    default: 'citizen'
  },
  area: { type: String, default: 'General Ward' },
  greenPoints: { type: Number, default: 0 },
  badges: [{ type: String }],
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
