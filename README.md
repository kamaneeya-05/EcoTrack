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

---

## 🛠️ Tech Stack

### 🔷 Frontend
- **HTML5** – Page structure (index, register, login, etc.)
- **CSS3** – Styling with responsive layout and Poppins font
- **JavaScript** – Form validation, localStorage, UI interactivity
- **LocalStorage** – Used to store user session name on dashboard

### 🔶 Backend
- **Node.js** – JavaScript runtime for building server
- **Express.js** – Routing and API handling
- **MongoDB** – NoSQL database for user, report, and contact info
- **Mongoose** – ODM library for MongoDB schemas

### 📦 Libraries & Tools
- `bcryptjs` – Password hashing for secure user login
- `multer` – File/image uploads for reporting form
- `body-parser` – Middleware for parsing POST requests
- `cors` – Enable cross-origin requests
- **VS Code** – Main development environment
- **MongoDB Compass** – GUI for managing database (if used)
- **Browser Console** – Manual testing (no Postman used)
---

## 🔃 How to Run the Project Locally

### 📦 1. Clone the Repository

```bash
git clone https://github.com/your-username/EcoTrack.git
cd EcoTrack
npm install
mongod
node server.js

👩‍💻 Author
Kamaneeya Kolli
Student, SRM University AP

📜 License
This project was created solely for academic and internship purposes.
It is not licensed for commercial use, redistribution, or modification
without explicit permission from the author.

All rights reserved © Kamaneeya Kolli
