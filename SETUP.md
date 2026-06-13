# EcoTrack - Complete Setup & Installation Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit the `.env` file (already created):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27018/ecotrack
OPENAI_API_KEY=sk-... (optional - for AI chatbot)
NODE_ENV=development
```

### 3. Start the Server
```bash
npm start
```

Server will run at: `http://localhost:3000`

---

## 👥 Test Accounts

Use these to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@test.com | password123 |
| Worker | worker@test.com | password123 |
| Supervisor | supervisor@test.com | password123 |
| Admin | admin@test.com | password123 |

(Register new accounts as needed)

---

## 📍 Features by User Role

### 👤 **Citizen/User Dashboard**
1. **Report Waste**
   - Select category (Plastic, Organic, E-Waste, etc.)
   - Click map to pin exact location
   - Upload before/after images
   - AI automatically detects category and priority
   - Check for nearby duplicate reports

2. **Track Status**
   - View all submitted reports
   - See 7-step status flow
   - Real-time updates via Socket.IO
   - Timeline visualization

3. **Rewards**
   - View green points earned
   - See badges and achievements
   - Appear on leaderboard (top 10)
   - Compete with other citizens

4. **Community Forum**
   - Post suggestions for cleanliness
   - Upvote community ideas
   - Discuss local environmental issues

5. **Recycling Locator**
   - Find nearest recycling centers
   - Filter by waste type (Plastic, Glass, E-Waste, etc.)
   - View center locations on map

### 🚧 **Municipal Worker Panel**
1. **View Assigned Tasks**
   - See all complaints assigned to you
   - Filter by priority and status
   - View location and details

2. **Update Task Status**
   - Mark as "En Route" → "Cleaning Started"
   - Upload cleanup photos
   - Submit for supervisor verification

3. **Bin Monitoring**
   - Scan bin QR codes
   - Report fill level
   - Log maintenance notes
   - System calculates "full in X days"

4. **Performance Tracking**
   - Admin can view your completion rate
   - See ratings (Excellent/Good/Needs Improvement)
   - Compete with other workers

### 👔 **Supervisor/Admin Dashboard**
1. **Real-Time Analytics**
   - Total reports, resolved, pending, critical
   - Charts: Status distribution, Priority, Monthly trends
   - Environmental impact metrics (waste kg, carbon prevented)

2. **Complaint Management**
   - View all reports in a table
   - Assign to workers
   - Update status
   - Close completed cases

3. **Worker Performance**
   - See each worker's assigned tasks
   - Track completion rate
   - Identify top performers

4. **Bin Management**
   - Monitor fill levels across city
   - Visual fill-level progress bars
   - Alerts for bins needing attention
   - Predicted fullness in X days

5. **Government Records**
   - Generate official reports
   - Track certified clean areas
   - Community impact statistics
   - Export compliance records

6. **Environmental Metrics**
   - Total waste removed
   - Carbon emissions prevented
   - Tree equivalents
   - Pollution reduction estimates

---

## 🔌 API Endpoints Reference

### Public Endpoints
```
POST /api/auth/login
POST /api/auth/register
GET  /api/locator/recycling-centers
POST /api/chatbot
```

### Report Management
```
GET    /api/report                          # Get all reports (with filters)
POST   /api/report                          # Submit new complaint
GET    /api/report/:id                      # Get single report
GET    /api/report/nearby?lat=X&lng=Y      # Find nearby complaints
POST   /api/report/detect-duplicate         # Check for duplicates
PATCH  /api/report/:id/assign               # Assign worker
PATCH  /api/report/:id/status               # Update status
POST   /api/report/:id/verify               # Supervisor verification
POST   /api/report/:id/close                # Admin closure
GET    /api/report/:id/official-report     # Government report
GET    /api/report/:id/qr                   # QR code data
```

### Worker Endpoints
```
GET    /api/worker/tasks                    # Get assigned tasks
POST   /api/worker/tasks/:id/cleanup        # Submit cleanup photo
POST   /api/worker/bins/:binCode/scan       # Update bin status
```

### Admin/Analytics
```
GET    /api/admin/reports                   # All reports
GET    /api/admin/analytics                 # Full analytics with metrics
GET    /api/admin/leaderboard               # Top 10 users
GET    /api/admin/worker-performance        # Worker statistics
GET    /api/admin/bin-status                # Bin monitoring
GET    /api/admin/environmental-impact      # Impact metrics
GET    /api/admin/government-records        # Official records
```

---

## 🤖 AI Features

### 1. **Automatic Waste Classification**
The system automatically detects waste type from:
- Category selected by user
- Description text
- Uploaded image filename

**Categories Detected:**
- Plastic Waste → Medium priority
- Organic Waste → Low priority
- E-Waste → High priority
- Metal Waste → Medium priority
- Glass Waste → Medium priority
- Medical Waste → Critical priority

### 2. **EcoBot Chatbot**
Ask questions like:
- "How do I segregate plastic?"
- "What's my complaint status?"
- "Where are recycling centers?"
- "How do I earn badges?"

**With OpenAI API:** Smart, conversational responses
**Without API:** Intelligent keyword-based responses

### 3. **Duplicate Detection**
When filing a report, the system:
- Analyzes text similarity with other reports
- Checks geographic proximity (within 5km)
- Shows similar complaints to prevent duplicates
- Uses Levenshtein distance algorithm

### 4. **Bin Fill Prediction**
Based on fill level, calculates:
- Days until bin is full
- Automatic status update (Overflow Risk if >85%)
- Scheduling recommendations

---

## 📊 Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (bcrypt),
  role: 'citizen' | 'worker' | 'supervisor' | 'admin',
  area: String,
  greenPoints: Number (0-1000+),
  badges: ['Bronze Reporter', 'Silver Reporter', 'Gold Eco Warrior'],
  phone: String,
  createdAt: Date
}
```

### Report Schema
```javascript
{
  complaintId: String (unique, e.g., 'EG-20250613-001'),
  citizenName: String,
  citizenEmail: String,
  category: String,
  aiCategory: String (detected by AI),
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  location: String,
  coordinates: { lat: Number, lng: Number },
  area: String,
  description: String,
  image: String (path),
  beforeImage: String (path),
  afterImage: String (path),
  assignedWorker: ObjectId (ref: User),
  assignedWorkerName: String,
  supervisorVerified: Boolean,
  adminClosed: Boolean,
  duplicateRisk: 'Low' | 'Medium' | 'High',
  impact: {
    estimatedWasteKg: Number,
    estimatedCarbonKg: Number
  },
  status: 'Reported' | 'Assigned' | 'Worker En Route' | 'Cleaning Started' | 'Verification Pending' | 'Resolved' | 'Closed',
  statusHistory: [{ status, note, actorRole, changedAt }],
  createdAt: Date,
  updatedAt: Date
}
```

### Bin Schema
```javascript
{
  binCode: String (unique, e.g., 'BIN-001'),
  area: String,
  location: String,
  coordinates: { lat: Number, lng: Number },
  fillLevel: Number (0-100),
  status: 'Clean' | 'Needs Cleaning' | 'Overflow Risk' | 'Maintenance',
  lastCleanedAt: Date,
  maintenanceNotes: String,
  predictedFullInDays: Number,
  updatedAt: Date
}
```

---

## 🎯 Gamification System

### Green Points
| Action | Points |
|--------|--------|
| Report filed | +20 |
| Status update | +10 |
| Report resolved | +100 |
| Report closed | +120 (normal) / +160 (Critical) |

### Badges
- 🥉 **Bronze Reporter**: 100+ points
- 🥈 **Silver Reporter**: 300+ points
- 🥇 **Gold Eco Warrior**: 600+ points

Displayed on:
- User profile
- Leaderboard
- Rewards page
- Admin analytics

---

## 📈 Environmental Impact Calculations

For each completed report:
- **Waste Removed**: Based on priority level
  - Low: 8 kg
  - Medium: 30 kg
  - High: 75 kg
  - Critical: 120 kg
  
- **Carbon Prevented**: Based on waste estimate
  - Low: 3 kg CO2
  - Medium: 11 kg CO2
  - High: 29 kg CO2
  - Critical: 45 kg CO2

- **Impact Display**:
  - Total waste removed (kg)
  - Carbon emissions prevented
  - Tree equivalents (1 tree = 20kg CO2/year)
  - Pollution reduction percentage

---

## 🔒 Security Features

✅ Password hashing with bcrypt
✅ CORS protection
✅ Input validation & sanitization
✅ File upload validation
✅ Database indexing
✅ JWT-ready authentication
✅ Role-based access control

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27018
```
**Solution**: Ensure MongoDB is running:
```bash
# Windows
mongod --dbpath "path/to/mongo-27018/data"

# Or use MongoDB Atlas cloud database
# Update MONGO_URI in .env
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Use different port:
```
PORT=3001 npm start
```

### OpenAI API Issues
Without valid `OPENAI_API_KEY`, chatbot falls back to keyword matching.
Still fully functional!

---

## 📚 File Structure
```
EcoTrack/
├── server.js              # Main server
├── package.json           # Dependencies
├── .env                   # Configuration
│
├── *Routes.js             # API endpoints
│   ├── authRoutes.js      # Auth & users
│   ├── reportRoutes.js    # Complaints
│   ├── workerRoutes.js    # Worker tasks
│   ├── adminRoutes.js     # Analytics
│   ├── forumRoutes.js     # Community
│   ├── chatbotRoutes.js   # AI chatbot
│   ├── notificationRoutes.js
│   ├── contactRoutes.js
│   └── locatorRoutes.js
│
├── *Model.js              # Database schemas
│   ├── userModel.js
│   ├── reportModel.js
│   ├── binModel.js
│   ├── forumModel.js
│   ├── contactModel.js
│   └── notificationModel.js
│
├── public/                # Frontend
│   ├── *.html            # Pages
│   ├── script.js         # JS logic
│   └── styles.css        # Styling
│
└── utils/                 # Helpers
    ├── classification.js  # AI classification
    └── notifications.js   # Email alerts
```

---

## 🎓 For Presentations

Highlight these points:

1. **Enterprise Architecture**: Multi-role system with 4 user types
2. **Real-Time Features**: Socket.IO for live status updates
3. **AI Integration**: Automatic classification + OpenAI chatbot
4. **Environmental Impact**: Tracks carbon, waste, pollution reduction
5. **Gamification**: Points & badges to motivate participation
6. **Government Integration**: Official reports & compliance records
7. **Location Intelligence**: GPS tracking, nearby discovery, QR codes
8. **Analytics Dashboard**: Real-time metrics with Chart.js visualizations

---

## ✅ Checklist Before Presentation

- [ ] .env file configured
- [ ] MongoDB running
- [ ] `npm install` completed
- [ ] `npm start` server running
- [ ] Test login with sample accounts
- [ ] File a test report
- [ ] Check admin dashboard
- [ ] Verify real-time updates
- [ ] Test map functionality
- [ ] Show leaderboard & gamification

---

**Status**: All 18 features are fully implemented and tested ✅

For questions or issues, check the FEATURES.md file!
