const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Report = require('./reportModel'); // ✅ Correct way

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder must exist
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('🔥 Received Report:', req.body);
    console.log('📸 File:', req.file);

    const { category, location, description } = req.body;
    const image = req.file ? req.file.path : null;

    const newReport = new Report({
      category,
      location,
      description,
      image
    });

    await newReport.save();
    res.status(200).json({ message: 'Report submitted successfully!' });

  } catch (error) {
    console.error('❌ Error saving report:', error);
    res.status(500).json({ message: 'Error saving report' });
  }
});

module.exports = router;