const express = require('express');

const router = express.Router();

const centers = [
  { name: 'GreenLoop Recycling Center', type: 'Recycling', area: 'General Ward', lat: 16.5062, lng: 80.6480, accepts: ['Plastic', 'Glass', 'Metal'] },
  { name: 'EcoByte E-Waste Point', type: 'E-Waste', area: 'Tech Corridor', lat: 16.5155, lng: 80.6321, accepts: ['Batteries', 'Phones', 'Computers'] },
  { name: 'Urban Compost Hub', type: 'Composting', area: 'Market Zone', lat: 16.4951, lng: 80.6573, accepts: ['Organic Waste', 'Garden Waste'] }
];

router.get('/recycling-centers', (req, res) => {
  res.json(centers);
});

module.exports = router;
