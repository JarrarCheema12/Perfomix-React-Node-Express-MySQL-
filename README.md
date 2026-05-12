Here is your **final, clean, production-ready README.md (fully corrected with auto DB + tables explanation included)** — ready to paste into GitHub:

---

# 🚀 Performix – Performance Management System

Performix is a **full-stack Performance Management System** built using **React, Node.js, Express, and MySQL**. It supports role-based dashboards for **Admin, Manager, and Employees**, along with authentication, surveys, feedback, analytics, and real-time features.

---

## ✨ Features

### 🔐 Authentication & Security

* Email/Password login & signup
* Google OAuth integration
* OTP verification system
* Password reset (email-based)
* Role-based access control (Admin, Manager, Employee)

---

### 🧑‍💼 Admin Panel

* Admin dashboard with analytics
* Manage employees & organizations
* Department management
* Performance metrics setup
* Staff feedback monitoring
* Leaderboard system
* Reports & recommendations
* Notifications system

---

### 👨‍💼 Manager Panel

* Manager dashboard overview
* Team & department management
* Performance evaluations
* Survey creation & responses
* Feedback management
* Reports & analytics
* Leaderboard view

---

### 👨‍💻 Employee Panel

* Personal dashboard
* Goal tracking
* Feedback submission
* Survey participation
* Performance reports
* Leaderboard ranking

---

### 📊 System Features

* Role-based routing (protected routes)
* Dynamic dashboards per role
* Survey & evaluation system
* Real-time notifications
* Google authentication
* Modular & scalable architecture

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router DOM
* Tailwind CSS / Flowbite
* Axios
* Vite

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Nodemailer

### Auth

* Google OAuth 2.0
* JWT sessions
* OTP verification

---

## 📁 Project Structure

```
PerformixFYP
│
├── client/              # React frontend
│   ├── src/
│
├── server/              # Node backend
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   ├── config/
│   └── helpers/
│
└── README.md
```

---

## ⚙️ Installation & Setup

---

### 1️⃣ Clone Repository

```bash id="clone1"
git clone https://github.com/your-username/performix.git
cd performix
```

---

### 2️⃣ Setup Backend

```bash id="backend1"
cd server
npm install
```

Create `.env` file in **server root directory**:

```env id="envbackend"
DB_HOST=localhost
DB_USER=root
DB_PASS=root123
DB_NAME=performix
PORT=8080

JWT_SECRET=your_secret

EMAIL_USER=your_email
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

Run backend:

```bash id="runbackend"
npm run start
```

---

### 3️⃣ Setup Frontend

```bash id="frontend1"
cd client
npm install
npm run dev
```

Create `.env` file in **client root directory**:

```env id="envfrontend"
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

⚠️ Important:

* `.env` file must be inside **client folder**
* Must start with `VITE_`
* Restart frontend after changes:

```bash id="restartfe"
npm run dev
```

---

## 🧠 Database Setup

When the server starts:

* MySQL connection is established
* Database is automatically created if it does not exist
* All required tables are created automatically via backend initialization scripts

Manual equivalent (for reference):

```sql id="sql1"
CREATE DATABASE performix;
```

---

## 🔑 Roles

| Role     | Access                        |
| -------- | ----------------------------- |
| Admin    | Full system control           |
| Manager  | Team & evaluation management  |
| Employee | Personal performance tracking |

---

## 📸 Screens Overview

* Landing Page
* Login / Signup / OTP
* Admin Dashboard
* Manager Dashboard
* Employee Dashboard

---

