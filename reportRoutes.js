const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('./reportModel');
const User = require('./userModel');
const { badgesForPoints, detectPriority, detectWasteCategory, estimateImpact, pointsForStatus } = require('./utils/classification');
const { createNotification } = require('./utils/notifications');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.email) filter.citizenEmail = req.query.email;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.workerId) filter.assignedWorker = req.query.workerId;

  const reports = await Report.find(filter)
    .populate('assignedWorker', 'name email role area')
    .sort({ createdAt: -1 });

  res.json(reports);
});

router.get('/nearby', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm || 5);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  const reports = await Report.find({
    'coordinates.lat': { $exists: true },
    'coordinates.lng': { $exists: true },
    status: { $ne: 'Closed' }
  }).sort({ createdAt: -1 });

  const nearby = reports
    .map(report => ({ report, distanceKm: distanceKm(lat, lng, report.coordinates.lat, report.coordinates.lng) }))
    .filter(item => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(item => ({ ...item.report.toObject(), distanceKm: Number(item.distanceKm.toFixed(2)) }));

  res.json(nearby);
});

router.get('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id).populate('assignedWorker', 'name email role area');
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
});

router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      category,
      location,
      description,
      citizenName,
      citizenEmail,
      lat,
      lng,
      area
    } = req.body;

    const primaryFile = firstFile(req.files, 'image') || firstFile(req.files, 'beforeImage');
    const aiCategory = detectWasteCategory(category, description, primaryFile && primaryFile.originalname);
    const priority = detectPriority(aiCategory, description);
    const impact = estimateImpact(priority);

    const report = await Report.create({
      citizenName,
      citizenEmail,
      category,
      aiCategory,
      priority,
      location,
      area: area || 'General Ward',
      description,
      coordinates: {
        lat: Number(lat) || undefined,
        lng: Number(lng) || undefined
      },
      image: primaryFile ? primaryFile.path : null,
      beforeImage: firstFilePath(req.files, 'beforeImage') || (primaryFile ? primaryFile.path : null),
      afterImage: firstFilePath(req.files, 'afterImage'),
      duplicateRisk: 'Low',
      impact
    });

    if (citizenEmail) {
      const user = await User.findOne({ email: citizenEmail });
      if (user) {
        user.greenPoints += pointsForStatus('Reported', priority);
        user.badges = badgesForPoints(user.greenPoints);
        await user.save();
      }

      await createNotification({
        recipientEmail: citizenEmail,
        title: 'Report accepted',
        message: `${report.complaintId} was recorded with ${priority} priority.`,
        relatedReport: report._id
      });
    }

    res.status(201).json({
      message: 'Report submitted successfully!',
      report
    });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Error saving report' });
  }
});

router.patch('/:id/assign', async (req, res) => {
  const { workerId } = req.body;
  const worker = await User.findById(workerId);
  if (!worker || worker.role !== 'worker') {
    return res.status(400).json({ message: 'Valid municipal worker is required' });
  }

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.assignedWorker = worker._id;
  report.assignedWorkerName = worker.name;
  await updateStatus(report, 'Assigned', `Assigned to ${worker.name}`, 'admin');

  await createNotification({
    recipientEmail: worker.email,
    title: 'New complaint assigned',
    message: `${report.complaintId} is assigned to you.`,
    relatedReport: report._id
  });

  await createNotification({
    recipientEmail: report.citizenEmail,
    title: 'Worker assigned',
    message: `${worker.name} has been assigned to your complaint.`,
    relatedReport: report._id
  });

  emitStatus(req, report);

  res.json({ message: 'Worker assigned', report });
});

router.patch('/:id/status', async (req, res) => {
  const { status, note, actorRole = 'worker' } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  await updateStatus(report, status, note || `Status changed to ${status}`, actorRole);

  if (status === 'Resolved' || status === 'Closed') {
    const user = await User.findOne({ email: report.citizenEmail });
    if (user) {
      user.greenPoints += pointsForStatus(status, report.priority);
      user.badges = badgesForPoints(user.greenPoints);
      await user.save();
    }
  }

  await createNotification({
    recipientEmail: report.citizenEmail,
    title: 'Complaint status updated',
    message: `${report.complaintId} is now ${status}.`,
    relatedReport: report._id
  });

  emitStatus(req, report);

  res.json({ message: 'Status updated', report });
});

router.post('/:id/verify', upload.single('afterImage'), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  if (req.file) report.afterImage = req.file.path;
  report.supervisorVerified = true;
  await updateStatus(report, 'Resolved', 'Supervisor verified cleanup evidence', 'supervisor');
  emitStatus(req, report);

  res.json({ message: 'Report verified by supervisor', report });
});

router.post('/:id/close', async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.adminClosed = true;
  await updateStatus(report, 'Closed', 'Case closed by administrator', 'admin');
  emitStatus(req, report);
  res.json({ message: 'Case closed', report });
});

// Duplicate detection endpoint
router.post('/detect-duplicate', async (req, res) => {
  const { location, aiCategory, description } = req.body;
  
  const existing = await Report.find({
    status: { $nin: ['Closed', 'Resolved'] },
    area: location,
    aiCategory: aiCategory
  }).limit(5);

  let duplicateRisk = 'Low';
  const similarities = [];

  for (const report of existing) {
    const similarity = calculateSimilarity(description, report.description);
    if (similarity > 0.7) {
      duplicateRisk = 'High';
      similarities.push({
        complaintId: report.complaintId,
        similarity: (similarity * 100).toFixed(0),
        location: report.location,
        distance: calculateDistance(req.body, report.coordinates)
      });
    }
  }

  res.json({ duplicateRisk, similarities });
});

// Generate government portal report
router.get('/:id/official-report', async (req, res) => {
  const report = await Report.findById(req.params.id).populate('assignedWorker', 'name email');
  if (!report) return res.status(404).json({ message: 'Report not found' });

  const reportDate = report.createdAt.toLocaleDateString();
  const officialReport = {
    officialId: `MUN-${report.complaintId}`,
    title: `Waste Management Case: ${report.complaintId}`,
    submittedBy: report.citizenName,
    submittedOn: reportDate,
    category: report.aiCategory,
    priority: report.priority,
    location: report.location,
    coordinates: report.coordinates,
    description: report.description,
    status: report.status,
    assignedWorker: report.assignedWorker ? report.assignedWorker.name : 'Unassigned',
    estimatedWasteKg: report.impact?.estimatedWasteKg || 0,
    estimatedCarbonKg: report.impact?.estimatedCarbonKg || 0,
    completionStatus: report.status === 'Closed' ? 'Completed' : 'In Progress',
    supervisorVerified: report.supervisorVerified ? 'Yes' : 'No',
    municipalityRecord: `Case filed on ${reportDate} in ${report.area}`,
    additionalInfo: `Status Flow: ${report.statusHistory.map(h => h.status).join(' → ')}`
  };

  res.json(officialReport);
});

// QR Code endpoint
router.get('/:id/qr', async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  const qrData = {
    complaintId: report.complaintId,
    area: report.area,
    location: report.location,
    coordinates: report.coordinates,
    category: report.aiCategory,
    priority: report.priority,
    reportUrl: `/api/report/${report._id}/official-report`
  };

  res.json({
    complaintId: report.complaintId,
    qrContent: JSON.stringify(qrData),
    displayInfo: {
      id: report.complaintId,
      category: report.aiCategory,
      location: report.location,
      status: report.status
    }
  });
});

async function updateStatus(report, status, note, actorRole) {
  report.status = status;
  report.statusHistory.push({ status, note, actorRole });
  await report.save();
}

function firstFile(files, key) {
  return files && files[key] && files[key][0] ? files[key][0] : null;
}

function firstFilePath(files, key) {
  const file = firstFile(files, key);
  return file ? file.path : null;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value) {
  return value * Math.PI / 180;
}

// Calculate text similarity (simple version)
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1;
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) return 'Unknown';
  const dist = distanceKm(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
  return `${dist.toFixed(2)} km`;
}

function emitStatus(req, report) {
  const io = req.app.get('io');
  if (io) {
    io.emit('report-status-updated', {
      id: report._id,
      complaintId: report.complaintId,
      status: report.status,
      priority: report.priority
    });
  }
}

module.exports = router;
