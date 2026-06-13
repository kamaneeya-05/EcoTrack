const fs = require('fs');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./userModel');
const authRoutes = require('./authRoutes');
const contactRoutes = require('./contactRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');
const workerRoutes = require('./workerRoutes');
const notificationRoutes = require('./notificationRoutes');
const forumRoutes = require('./forumRoutes');
const locatorRoutes = require('./locatorRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
const PORT = process.env.PORT || 3500;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/ecotrack';

app.set('io', io);
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
.then(async () => {
  console.log(`Connected to MongoDB at ${MONGO_URI}`);
  await seedDefaultUsers();
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/locator', locatorRoutes);
app.use('/api/chatbot', chatbotRoutes);

async function seedDefaultUsers() {
  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
      area: 'City Center',
      phone: '111-222-3333'
    },
    {
      name: 'Worker User',
      email: 'worker@test.com',
      password: 'Password123!',
      role: 'worker',
      area: 'Service Ward',
      phone: '222-333-4444'
    },
    {
      name: 'Citizen User',
      email: 'citizen@test.com',
      password: 'Password123!',
      role: 'citizen',
      area: 'Green Ward',
      phone: '333-444-5555'
    },
    {
      name: 'Supervisor User',
      email: 'supervisor@test.com',
      password: 'Password123!',
      role: 'supervisor',
      area: 'Central Ward',
      phone: '444-555-6666'
    }
  ];

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        area: userData.area,
        phone: userData.phone,
        greenPoints: userData.role === 'citizen' ? 120 : 0,
        badges: userData.role === 'citizen' ? ['Starter Steward'] : []
      });
      console.log(`Seed user created: ${userData.email}`);
    }
  }
}

// Create uploads directory if not present
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Start server
io.on('connection', socket => {
  socket.emit('connected', { message: 'EcoTrack live updates connected' });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
