const express = require('express');
const multer = require('multer');
const Report = require('./reportModel');
const Bin = require('./binModel');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  })
});

router.get('/tasks', async (req, res) => {
  const filter = {};
  if (req.query.workerId) filter.assignedWorker = req.query.workerId;

  const reports = await Report.find(filter).sort({ priority: -1, createdAt: -1 });
  res.json(reports);
});

router.post('/tasks/:id/cleanup', upload.single('afterImage'), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  if (req.file) report.afterImage = req.file.path;
  report.status = 'Verification Pending';
  report.statusHistory.push({
    status: 'Verification Pending',
    note: 'Worker uploaded cleanup photo',
    actorRole: 'worker'
  });
  await report.save();
  const io = req.app.get('io');
  if (io) {
    io.emit('report-status-updated', {
      id: report._id,
      complaintId: report.complaintId,
      status: report.status,
      priority: report.priority
    });
  }

  res.json({ message: 'Cleanup submitted for supervisor verification', report });
});

router.post('/bins/:binCode/scan', async (req, res) => {
  const { area, location, fillLevel = 0, status = 'Clean', maintenanceNotes, lat, lng } = req.body;
  const numericFill = Number(fillLevel);
  const predictedFullInDays = Math.max(1, Math.ceil((100 - numericFill) / 25));

  const bin = await Bin.findOneAndUpdate(
    { binCode: req.params.binCode },
    {
      binCode: req.params.binCode,
      area: area || 'General Ward',
      location: location || 'Scanned Location',
      fillLevel: numericFill,
      status: numericFill >= 85 ? 'Overflow Risk' : status,
      maintenanceNotes,
      coordinates: {
        lat: Number(lat) || undefined,
        lng: Number(lng) || undefined
      },
      lastCleanedAt: status === 'Clean' ? new Date() : undefined,
      predictedFullInDays,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  res.json({ message: 'Bin scan updated', bin });
});

module.exports = router;
