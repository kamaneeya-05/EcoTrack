# ♻️ EcoTrack – Community Waste Reporting and Managing System

**EcoTrack** is a full-stack web application that empowers citizens to report waste management issues in their communities. It allows users to register, log in, report problems with image uploads, contact authorities, track their report status, earn rewards for civic participation, and access a clean, responsive dashboard.

Built using **Node.js, Express, and MongoDB**, EcoTrack includes both user-facing and admin-facing modules to streamline civic communication and encourage responsible environmental behavior.

---

## 🌟 Key Features

- 🔐 User **Registration & Login** (with hashed passwords using `bcryptjs`)
- 🏠 **Dashboard** with personalized greeting (via `localStorage`)
- 📸 **Waste Report Form** with image upload (handled using `multer`)
- 📬 **Contact Form** for user feedback/messages
- 🗂️ **Track Status Page** to view current report progress
- 🏅 **Rewards Page** to incentivize civic action
- 👤 **Profile Page** (static info display)
- 🛠️ **Admin Page** for centralized access (view-only for now)
- 📦 Data stored securely in **MongoDB**
- ✅ **Manual testing via browser console** (Postman not used)
