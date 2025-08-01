# ♻️ EcoTrack – Community Waste Reporting and Managing System

**EcoTrack** is a full-stack web application that empowers citizens to report waste management issues in their communities. It allows users to register, log in, report problems with image uploads, contact authorities, track their report status, and access a clean, responsive dashboard.

Built using **Node.js, Express, and MongoDB Atlas**, EcoTrack includes both user-facing and admin-facing modules to streamline civic communication and encourage responsible environmental behavior.

---

## 🌟 Key Features

- 🔐 User **Registration & Login** (with hashed passwords using `bcryptjs`)
- 🏠 **Dashboard** with personalized greeting (via `localStorage`)
- 📸 **Waste Report Form** with image upload (handled using `multer`)
- 📬 **Contact Form** for user feedback/messages
- 🗂️ **Track Status Page** to view current report progress
- 🏅 **Rewards Page** to incentivize civic action
- 👤 **Profile Page** (static info display for now)
- 🛠️ **Admin Page** for centralized access (view-only for now)
- 📦 Data stored securely in **MongoDB Atlas**
- ✅ **Manual testing via browser console** (Postman not used)

---

## 🛠️ Tech Stack

### 🔷 Frontend
- **HTML5** – Page structure (index, register, login, etc.)
- **CSS3** – Styling with responsive layout and Poppins font
- **JavaScript** – Form validation, localStorage, UI interactivity
- **LocalStorage** – Used to store user session info on dashboard

### 🔶 Backend
- **Node.js** – JavaScript runtime for backend development
- **Express.js** – Routing and API handling
- **MongoDB Atlas** – Cloud NoSQL database for storing user, report, and contact info
- **Mongoose** – ODM library to manage database schemas

### 📦 Libraries & Tools Used
- `bcryptjs` – To hash and compare user passwords securely
- `multer` – For handling image uploads in report form
- `body-parser` – To parse incoming request bodies
- `cors` – Enables cross-origin requests for frontend-backend communication
- `dotenv` – Used to manage sensitive environment variables
- **VS Code** – Code editor used for full development
- **MongoDB Atlas** – Used instead of MongoDB Compass
- **Browser Console** – Used for testing (no Postman used)

---

## 🧩 Project Structure

```bash
EcoTrack/
│
├── public/              # HTML, CSS, JS files (Frontend)
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── contact.html
│   ├── report.html
│   ├── rewards.html
│   ├── status.html
│   ├── profile.html
│   ├── admin.html
│   └── script.js
│
├── uploads/             # Uploaded images via report form
│
├── authRoutes.js        # Registration & login routes
├── contactRoutes.js     # Contact form handling
├── reportRoutes.js      # Waste report submission
├── userModel.js         # Mongoose schema for user
├── .env                 # Contains MONGO_URI (NOT pushed to GitHub)
├── .gitignore           # Ignores node_modules, .env, etc.
├── server.js            # Express server entry point
└── package.json         # Project dependencies

## 👩‍💻 Author
Kamaneeya Kolli
Student, SRM University AP
GitHub: @kamaneeya-05

## 📜 License
This project was created solely for academic and internship purposes.
It is not licensed for commercial use, redistribution, or modification
without explicit permission from the author.

All rights reserved © Kamaneeya Kolli

