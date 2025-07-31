// reportModel.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: String, // Optional: store file name or base64 if needed later
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
