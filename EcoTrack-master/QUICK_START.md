# EcoTrack - Quick Reference Guide

## 🚀 One-Minute Setup

1. **Install dependencies**: `npm install`
2. **Configure .env**: Already created with template values
3. **Start server**: `npm start`
4. **Open browser**: `http://localhost:3000`

---

## 👥 Quick Login Credentials

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@test.com | See all analytics & features |
| Citizen | citizen@test.com | File reports, track status |
| Worker | worker@test.com | View & complete assigned tasks |

Register your own test accounts as needed!

---

## 📍 Feature Quick Links

### For Users (Citizens)
| Feature | URL | Purpose |
|---------|-----|---------|
| File Report | `/report.html` | Pin location, upload photos, AI classifies waste |
| Track Status | `/track-status.html` | See report timeline with real-time updates |
| Rewards | `/rewards.html` | View points, badges, leaderboard ranking |
| Community | `/community.html` | Post ideas, upvote suggestions |
| Recycling Map | `/locator.html` | Find nearest recycling centers |

### For Workers
| Feature | URL | Purpose |
|---------|-----|---------|
| Worker Panel | `/worker.html` | See assigned complaints, upload cleanup photos |
| Bin Scanning | `/worker.html` | Scan QR codes, report fill levels, update status |
| Dashboard | `/dashboard.html` | Track personal completion rates |

### For Admins
| Feature | URL | Purpose |
|---------|-----|---------|
| Analytics | `/admin.html` | Charts, metrics, worker performance, bin status |
| Reports | `/admin.html` | View all complaints in table format |
| Government | `/admin.html` | Official records, compliance tracking |

---

## 🎯 Top 5 Impressive Features

### 1. **Real-Time Map** 🗺️
- Click map to pin waste location
- See nearby complaints instantly
- Auto-detects GPS location

### 2. **AI Classification** 🤖
- Automatically detects waste type
- Assigns priority (Low/Medium/High/Critical)
- Shows confidence score

### 3. **Live Status Updates** ⚡
- Socket.IO real-time notifications
- 7-step workflow visualization
- Instant dashboard refresh

### 4. **Environmental Impact** 🌍
- Shows carbon prevented
- Calculates tree equivalents
- Pollution reduction metrics

### 5. **Gamification** 🏆
- Earn green points per report
- Unlock badges (Bronze/Silver/Gold)
- Compete on leaderboard

---

## 🔑 Key Endpoints (For Testing)

```bash
# File a complaint
curl -X POST http://localhost:3000/api/report \
  -F "category=Plastic" \
  -F "location=Main Street" \
  -F "description=Garbage pile" \
  -F "lat=16.5062" \
  -F "lng=80.6480" \
  -F "citizenEmail=test@test.com"

# Get all complaints
curl http://localhost:3000/api/report

# Get analytics
curl http://localhost:3000/api/admin/analytics

# Chat with bot
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I segregate plastic?"}'

# Find recycling centers
curl http://localhost:3000/api/locator/recycling-centers
```

---

## 📊 Points & Badges System

### Points Earned
- Report filed: +20
- Status update: +10
- Report resolved: +100
- Report closed: +120 (normal) / +160 (Critical)

### Badges
- 100+ points: 🥉 Bronze Reporter
- 300+ points: 🥈 Silver Reporter
- 600+ points: 🥇 Gold Eco Warrior

---

## 🛠️ Customization

### Change Port
Edit `.env`:
```
PORT=3001
```

### Use Cloud MongoDB
Edit `.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecotrack
```

### Enable OpenAI Chatbot
Edit `.env`:
```
OPENAI_API_KEY=sk-...your_key...
```

---

## 📱 Browser Compatibility

Works on:
- ✅ Chrome/Edge (Best)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

Requires: Modern JavaScript ES6+ support

---

## 🎬 Demo Workflow

### Citizen Flow
1. Login as citizen@test.com
2. Click "Report" button
3. Click map to pin location
4. Select category, add photo
5. Submit report
6. Check "Track Status" for updates
7. Earn 20 green points
8. View on leaderboard (if top 10)

### Admin Flow
1. Login as admin@test.com
2. See all reports in analytics
3. Assign worker to complaint
4. Monitor status changes
5. Check environmental metrics
6. View worker performance
7. Manage bin schedules
8. Generate government records

### Worker Flow
1. Login as worker@test.com
2. See assigned tasks
3. Update status to "En Route"
4. Upload cleanup photo
5. Submit for verification
6. Check completion rate

---

## 📞 Support Features

### Built-in Help
- EcoBot chatbot available 24/7
- Asks about waste segregation
- Explains complaint tracking
- Suggests recycling centers

### In-App Notifications
- Email alerts on status change
- Sidebar notifications
- Real-time Socket.IO updates

---

## 🎓 For Professors

Demonstrate:

1. **Show Architecture**
   - Multi-role system (4 user types)
   - Database relationships
   - API design (30+ endpoints)

2. **Live Demo**
   - File complaint → See on map
   - Check real-time status updates
   - View AI classification
   - Show leaderboard & points

3. **Analytics**
   - Open admin dashboard
   - Show charts & metrics
   - Display environmental impact
   - Explain bin predictions

4. **Code Quality**
   - Clean separation of concerns
   - Modular route design
   - Error handling
   - Input validation

---

## ⚡ Performance Tips

- Map loads in ~2 seconds
- Analytics refresh instantly
- WebSocket connects automatically
- File upload supports images up to 10MB

---

## 🔐 Default Security

✅ Passwords hashed with bcrypt
✅ CORS enabled for local development
✅ Input sanitization active
✅ File upload validation enabled
✅ Database indexes for speed

---

## 📖 Documentation Files

- **FEATURES.md** - All 18 features explained
- **SETUP.md** - Installation & user guide
- **IMPLEMENTATION_STATUS.md** - What's implemented
- This file: Quick reference

---

## 🆘 Common Issues & Fixes

### "Cannot find module..."
```bash
npm install
```

### "MongoDB connection failed"
Ensure MongoDB running on port 27018, or update MONGO_URI

### "Port 3000 already in use"
```bash
PORT=3001 npm start
```

### "OpenAI API errors"
Remove OPENAI_API_KEY from .env - chatbot uses fallback

---

## 📈 Next Steps

1. **Understand the architecture** - Read FEATURES.md
2. **Set up locally** - Follow SETUP.md
3. **Test all features** - Use demo workflow above
4. **Customize** - Update colors, text, endpoints
5. **Deploy** - Use any Node.js hosting (Heroku, Railway, etc.)

---

## ✨ Hidden Gems

- QR code generation for bins (endpoint: `/api/report/:id/qr`)
- Duplicate detection algorithm (text similarity)
- Environmental impact calculator
- Government report generation (official IDs: MUN-*)
- Worker performance ratings
- Levenshtein distance for text matching
- Socket.IO real-time sync

---

## 🚀 Ready?

```bash
npm start
```

Then visit: `http://localhost:3000`

Enjoy building! 🌍♻️
