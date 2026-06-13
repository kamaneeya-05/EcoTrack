const categoryKeywords = [
  { label: 'Medical Waste', priority: 'Critical', words: ['medical', 'syringe', 'hospital', 'biohazard', 'mask', 'gloves'] },
  { label: 'E-Waste', priority: 'High', words: ['e-waste', 'battery', 'phone', 'computer', 'wire', 'electronic'] },
  { label: 'Plastic Waste', priority: 'Medium', words: ['plastic', 'bottle', 'bag', 'wrapper', 'packet'] },
  { label: 'Metal Waste', priority: 'Medium', words: ['metal', 'can', 'scrap', 'iron'] },
  { label: 'Glass Waste', priority: 'Medium', words: ['glass', 'bottle', 'shard'] },
  { label: 'Organic Waste', priority: 'Low', words: ['organic', 'food', 'vegetable', 'leaf', 'garden'] }
];

function detectWasteCategory(category = '', description = '', filename = '') {
  const text = `${category} ${description} ${filename}`.toLowerCase();
  const match = categoryKeywords.find(item => item.words.some(word => text.includes(word)));
  return match ? match.label : category || 'General Waste';
}

function detectPriority(category = '', description = '') {
  const text = `${category} ${description}`.toLowerCase();

  if (/(medical|biohazard|syringe|chemical|toxic|hazardous)/.test(text)) return 'Critical';
  if (/(e-waste|battery|dead animal|large|dump|smoke|industrial)/.test(text)) return 'High';
  if (/(overflow|illegal|plastic|glass|metal|pile)/.test(text)) return 'Medium';
  return 'Low';
}

function estimateImpact(priority) {
  const values = {
    Low: { estimatedWasteKg: 8, estimatedCarbonKg: 3 },
    Medium: { estimatedWasteKg: 30, estimatedCarbonKg: 11 },
    High: { estimatedWasteKg: 75, estimatedCarbonKg: 29 },
    Critical: { estimatedWasteKg: 120, estimatedCarbonKg: 45 }
  };

  return values[priority] || values.Low;
}

function pointsForStatus(status, priority) {
  if (status === 'Closed') return priority === 'Critical' ? 160 : 120;
  if (status === 'Resolved') return 100;
  if (status === 'Reported') return 20;
  return 10;
}

function badgesForPoints(points) {
  const badges = [];
  if (points >= 100) badges.push('Bronze Reporter');
  if (points >= 300) badges.push('Silver Reporter');
  if (points >= 600) badges.push('Gold Eco Warrior');
  return badges;
}

module.exports = {
  badgesForPoints,
  detectPriority,
  detectWasteCategory,
  estimateImpact,
  pointsForStatus
};
