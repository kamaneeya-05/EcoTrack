const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: String,
  note: String,
  actorRole: String,
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true, index: true },
  citizenName: String,
  citizenEmail: String,
  category: { type: String, required: true },
  aiCategory: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  area: { type: String, default: 'General Ward' },
  description: { type: String, required: true },
  image: String,
  beforeImage: String,
  afterImage: String,
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedWorkerName: String,
  supervisorVerified: { type: Boolean, default: false },
  adminClosed: { type: Boolean, default: false },
  duplicateRisk: { type: String, default: 'Not checked' },
  status: {
    type: String,
    enum: [
      'Reported',
      'Assigned',
      'Worker En Route',
      'Cleaning Started',
      'Verification Pending',
      'Resolved',
      'Closed'
    ],
    default: 'Reported'
  },
  statusHistory: [statusHistorySchema],
  impact: {
    estimatedWasteKg: { type: Number, default: 0 },
    estimatedCarbonKg: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function setComputedFields(next) {
  this.updatedAt = new Date();

  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.complaintId = `ECO-${year}-${suffix}`;
  }

  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{
      status: this.status || 'Reported',
      note: 'Complaint submitted by citizen',
      actorRole: 'citizen'
    }];
  }

  next();
});

module.exports = mongoose.model('Report', reportSchema);
