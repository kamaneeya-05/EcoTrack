const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binCode: { type: String, unique: true, required: true },
  area: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  fillLevel: { type: Number, default: 35 },
  status: {
    type: String,
    enum: ['Clean', 'Needs Cleaning', 'Overflow Risk', 'Maintenance'],
    default: 'Clean'
  },
  lastCleanedAt: Date,
  maintenanceNotes: String,
  predictedFullInDays: { type: Number, default: 3 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bin', binSchema);
