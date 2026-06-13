const express = require('express');
require('dotenv').config();

const router = express.Router();

// Simple fallback if OpenAI is not configured
const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

async function getOpenAIResponse(message) {
  try {
    if (!useOpenAI) return null;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are EcoBot, a helpful AI assistant for EcoTrack, a municipal waste management platform. You help citizens report waste, track complaints, learn about waste segregation, and find recycling centers. Keep responses concise and helpful. Focus on environmental responsibility and civic engagement.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return null;
  }
}

function getLocalResponse(message) {
  const msg = String(message || '').toLowerCase();
  
  if (msg.includes('plastic')) {
    return 'Plastic waste should be cleaned if possible, separated from organic waste, and reported with a clear location photo.';
  } else if (msg.includes('e-waste') || msg.includes('battery') || msg.includes('electronic')) {
    return 'E-waste and batteries are hazardous. Mark the report as E-Waste and avoid mixing it with household garbage.';
  } else if (msg.includes('medical') || msg.includes('biohazard')) {
    return 'Medical waste is critical and dangerous. Mark priority as Critical and provide clear evidence photos. Workers will be dispatched urgently.';
  } else if (msg.includes('status') || msg.includes('track')) {
    return 'Open Track Reports to see the timeline: Reported → Assigned → Worker En Route → Cleaning Started → Verification Pending → Resolved → Closed.';
  } else if (msg.includes('nearby') || msg.includes('duplicate')) {
    return 'Use the report map to check nearby complaints before filing a duplicate report. Click on the map to pin your location.';
  } else if (msg.includes('recycle')) {
    return 'Use the Recycling Locator module to find centers for plastic, glass, metal, e-waste, and composting near you.';
  } else if (msg.includes('badge') || msg.includes('point') || msg.includes('reward')) {
    return 'You earn green points for verified reports! Collect badges: Bronze (100 pts), Silver (300 pts), Gold Eco Warrior (600 pts). Check the Rewards page.';
  } else if (msg.includes('how') || msg.includes('help') || msg.includes('report')) {
    return 'To report waste: 1) Select category 2) Click map to pin location 3) Add photos 4) Submit. Workers will be assigned based on priority.';
  } else if (msg.includes('segregat')) {
    return 'Proper waste segregation: Plastic → Blue bin, Organic → Green bin, E-Waste → Red bin, Glass → Yellow bin, Metal → Gray bin.';
  } else if (msg.includes('hazard') || msg.includes('dangerous')) {
    return 'Hazardous waste includes medical waste, chemicals, batteries, and biohazard materials. Always mark as Critical priority and avoid direct contact.';
  }

  return 'I can help with reporting waste, tracking complaints, segregation tips, badges, and recycling centers. What would you like to know?';
}

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  
  if (!message) {
    return res.json({ reply: 'Please enter a message.' });
  }

  // Try OpenAI first, fallback to local responses
  let reply = null;
  if (useOpenAI) {
    reply = await getOpenAIResponse(message);
  }
  
  if (!reply) {
    reply = getLocalResponse(message);
  }

  res.json({ reply });
});

module.exports = router;
