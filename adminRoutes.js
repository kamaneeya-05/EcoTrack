const express = require('express');
const Report = require('./reportModel');
const User = require('./userModel');
const Bin = require('./binModel');

const router = express.Router();

router.get('/reports', async (req, res) => {
  const reports = await Report.find()
    .populate('assignedWorker', 'name email area')
    .sort({ createdAt: -1 });
  res.json(reports);
});

router.get('/analytics', async (req, res) => {
  const reports = await Report.find();
  const total = reports.length;
  const resolved = reports.filter(report => ['Resolved', 'Closed'].includes(report.status)).length;
  const pending = reports.filter(report => !['Resolved', 'Closed'].includes(report.status)).length;
  const critical = reports.filter(report => report.priority === 'Critical').length;

  const byStatus = countBy(reports, 'status');
  const byPriority = countBy(reports, 'priority');
  const byArea = countBy(reports, 'area');
  const byCategory = countBy(reports, 'aiCategory');
  const monthly = reports.reduce((acc, report) => {
    const key = report.createdAt.toISOString().slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const impact = reports.reduce((acc, report) => {
    acc.wasteKg += report.impact && report.impact.estimatedWasteKg ? report.impact.estimatedWasteKg : 0;
    acc.carbonKg += report.impact && report.impact.estimatedCarbonKg ? report.impact.estimatedCarbonKg : 0;
    return acc;
  }, { wasteKg: 0, carbonKg: 0 });

  // Calculate pollution reduction estimate
  const pollutionReduction = (impact.carbonKg * 0.05).toFixed(1); // Simplified estimate
  const treesEquivalent = Math.round(impact.carbonKg / 20); // 1 tree absorbs ~20kg CO2/year

  res.json({
    totals: { total, resolved, pending, critical },
    byStatus,
    byPriority,
    byArea,
    byCategory,
    monthly,
    impact,
    environmentalMetrics: {
      wasteKg: impact.wasteKg,
      carbonKgReduced: impact.carbonKg,
      estimatedPollutionReduction: `${pollutionReduction}%`,
      treesEquivalent: treesEquivalent,
      estimatedLocalHealthBenefit: 'Improved air quality in the area'
    }
  });
});

router.get('/leaderboard', async (req, res) => {
  const users = await User.find({ role: 'citizen' })
    .select('name email greenPoints badges area')
    .sort({ greenPoints: -1 })
    .limit(10);
  res.json(users);
});

// Worker performance analytics
router.get('/worker-performance', async (req, res) => {
  const workers = await User.find({ role: 'worker' });
  
  const performance = await Promise.all(workers.map(async (worker) => {
    const assigned = await Report.countDocuments({ assignedWorker: worker._id });
    const completed = await Report.countDocuments({ 
      assignedWorker: worker._id,
      status: { $in: ['Resolved', 'Closed'] }
    });
    const average = assigned > 0 ? ((completed / assigned) * 100).toFixed(1) : 0;

    return {
      name: worker.name,
      email: worker.email,
      area: worker.area,
      assignedTasks: assigned,
      completedTasks: completed,
      completionRate: `${average}%`,
      rating: average >= 80 ? 'Excellent' : average >= 60 ? 'Good' : 'Needs Improvement'
    };
  }));

  res.json(performance);
});

// Bin fill level predictions
router.get('/bin-status', async (req, res) => {
  const bins = await Bin.find();
  
  const binStatus = bins.map(bin => ({
    binCode: bin.binCode,
    area: bin.area,
    location: bin.location,
    fillLevel: bin.fillLevel,
    status: bin.status,
    predictedFullInDays: bin.predictedFullInDays,
    lastCleanedAt: bin.lastCleanedAt,
    needsAttention: bin.fillLevel >= 75 || bin.predictedFullInDays <= 1
  }));

  res.json(binStatus);
});

// Environmental impact report
router.get('/environmental-impact', async (req, res) => {
  const reports = await Report.find();
  
  const totalWasteKg = reports.reduce((sum, r) => sum + (r.impact?.estimatedWasteKg || 0), 0);
  const totalCarbonKg = reports.reduce((sum, r) => sum + (r.impact?.estimatedCarbonKg || 0), 0);
  
  const report = {
    totalComplaints: reports.length,
    resolvedComplaints: reports.filter(r => r.status === 'Closed').length,
    totalWasteRemoved: `${totalWasteKg.toFixed(1)} kg`,
    carbonEmissionsPrevented: `${totalCarbonKg.toFixed(1)} kg CO2`,
    treesEquivalent: Math.round(totalCarbonKg / 20),
    pollutionReductionEstimate: `${(totalCarbonKg * 0.05).toFixed(1)}%`,
    communityImpact: `${reports.length} citizens engaged in waste management`,
    areasMostAffected: countBy(reports, 'area'),
    wasteCategoriesHandled: countBy(reports, 'aiCategory')
  };

  res.json(report);
});

// Government records/certificates
router.get('/government-records', async (req, res) => {
  const reports = await Report.find({ status: 'Closed' });
  const users = await User.find({ role: 'citizen' });
  
  const records = {
    totalCasesProcessed: reports.length,
    averageResolutionTime: calculateAverageResolutionTime(reports),
    citiesMostComplaints: countBy(reports, 'area'),
    certifiedCleanAreas: reports.filter(r => r.supervisorVerified).length,
    communityParticipants: users.length,
    generatedOn: new Date().toISOString(),
    municipalityStamp: 'Official Municipality Record',
    authorizedBy: 'Municipal Commissioner'
  };

  res.json(records);
});

router.put('/reports/:id', async (req, res) => {
  const { status } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = status;
  report.statusHistory.push({
    status,
    note: `Admin changed status to ${status}`,
    actorRole: 'admin'
  });
  await report.save();

  res.json({ message: 'Status updated', report });
});

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function calculateAverageResolutionTime(reports) {
  const closedReports = reports.filter(r => r.createdAt && r.updatedAt);
  if (closedReports.length === 0) return '0 days';
  
  const totalTime = closedReports.reduce((sum, r) => {
    const days = (r.updatedAt - r.createdAt) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  const avgDays = Math.round(totalTime / closedReports.length);
  return `${avgDays} days`;
}

module.exports = router;
