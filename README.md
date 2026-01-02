<div align="center">

# 🎓 College Feedback Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.x-blue?logo=postgresql)](https://www.postgresql.org/)
[![Contributors](https://img.shields.io/badge/Contributors-2-orange)](https://github.com/DurveshN/Feedback-Form)

A comprehensive, role-based feedback collection and analytics platform designed for educational institutions.

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📋 Overview

The **College Feedback Management System** is a full-stack web application developed for **Anantrao Pawar College of Engineering & Research** to streamline the student feedback collection process. It enables students to provide anonymous feedback on teachers and courses, while providing HODs and teachers with powerful analytics and reporting tools.

### 🎯 Key Objectives

- **Digitize** the traditional paper-based feedback system
- **Secure** one-time-use student credentials to ensure authentic responses
- **Analyze** feedback data with interactive charts and exportable reports
- **Streamline** administrative workflows for HODs

---

## ✨ Features

### 👨‍🎓 For Students
- **One-Time Login** — Secure credentials that expire after feedback submission
- **Multi-Subject Feedback** — Rate all assigned teachers/subjects in one session
- **Theory & Practical Questions** — Subject-type specific feedback forms
- **Rating System** — 1-5 scale with optional text comments

### 👩‍🏫 For Teachers
- **Personal Dashboard** — View feedback statistics for assigned subjects
- **Visual Analytics** — Bar charts showing question-wise ratings
- **Filter Options** — Filter by academic year, semester, and student year
- **PDF Export** — Download feedback reports for records

### 👔 For HODs (Department Heads)
| Module | Description |
|--------|-------------|
| **Teacher Management** | Add, edit, and manage teacher profiles |
| **Subject Management** | Configure department subjects (theory/practical) |
| **Teacher-Subject Linking** | Assign teachers to subjects per semester |
| **Semester Control** | Set active academic year and semester |
| **Student Login Generation** | Bulk generate one-time student credentials |
| **Feedback Reports** | Download detailed feedback as Excel/PDF |
| **Analytics Dashboard** | Interactive pie charts and bar graphs |
| **Teacher Analysis** | Individual teacher performance reports |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Login   │  │ Student  │  │ Teacher  │  │   HOD Dashboard  │ │
│  │   Page   │  │ Feedback │  │Dashboard │  │   (8+ modules)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                       │   │
│  │    JWT Authentication │ CORS │ Error Handling            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       API Routes                          │   │
│  │  /auth │ /feedback │ /teachers │ /analytics │ /hods ...  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Controllers                          │   │
│  │  15+ controllers handling business logic                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ pg (node-postgres)
┌───────────────────────────▼─────────────────────────────────────┐
│                     DATABASE (PostgreSQL 17)                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │   hods     │ │  teachers  │ │  subjects  │ │teacher_subj. │  │
│  ├────────────┤ ├────────────┤ ├────────────┤ ├──────────────┤  │
│  │departments │ │  feedback  │ │ questions  │ │student_login │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **Chart.js** | Data visualization |
| **jsPDF + html2canvas** | PDF generation |
| **React Icons** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **pg (node-postgres)** | PostgreSQL client |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **PDFKit** | Server-side PDF generation |
| **ExcelJS** | Excel report generation |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 17** | Relational database |

---

## 📦 Installation

### Prerequisites

- **Node.js** v18.x or higher (LTS recommended)
- **PostgreSQL** 17.x
- **Git**
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/DurveshN/Feedback-Form.git
cd Feedback-Form
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Create a .env file with the following variables:
```

**Backend `.env` file:**
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=feedback_system
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
```

**Frontend `.env` file:**
```env
REACT_APP_API_BASE=http://localhost:5000
```

### Step 4: Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE feedback_system;"

# Import the backup (from project root)
pg_restore -U postgres -d feedback_system ./database/backup.dump

# On Windows, use full path:
"C:\Program Files\PostgreSQL\17\bin\pg_restore.exe" -U postgres -d feedback_system database\backup.dump
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # Development mode with hot reload
# OR
npm start      # Production mode
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start      # Development mode at http://localhost:3000
```

---

## 🚀 Usage

### User Roles & Access

| Role | Credentials | Access |
|------|-------------|--------|
| **HOD** | Pre-configured in database | Full administrative access |
| **Teacher** | Created by HOD | View personal feedback & analytics |
| **Student** | Generated by HOD (one-time use) | Submit feedback once |

### HOD Workflow

```
1. 👥 Manage Teachers     → Add/edit teacher profiles
2. 📚 Manage Subjects     → Configure subjects (theory/practical)
3. 🔗 Teacher-Subject     → Link teachers to subjects per semester
4. 📅 Semester Control    → Set active academic year & semester
5. 🔑 Generate Logins     → Create bulk student credentials
6. 📊 View Analytics      → Monitor feedback data
7. 📥 Download Reports    → Export to Excel/PDF
```

### Student Feedback Flow

```
Login → View Assigned Subjects → Rate Each Subject (1-5) → Submit All → Logout (Credentials Disabled)
```

---

## 📡 API Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user (HOD/Teacher/Student) |

### Feedback
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feedback/assignments` | GET | Get assigned subjects for feedback |
| `/api/feedback/questions` | GET | Get questions by subject type |
| `/api/feedback/submit` | POST | Submit feedback response |

### Analytics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/pie` | GET | Pie chart data by department |
| `/api/analytics/bar` | GET | Bar chart comparison data |
| `/api/analytics/academic-years` | GET | Available academic years |

### HOD Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teachers` | GET/POST/PUT/DELETE | Manage teachers |
| `/api/hod/subjects` | GET/POST/PUT/DELETE | Manage subjects |
| `/api/teacher-subjects` | GET/POST/DELETE | Teacher-subject linking |
| `/api/semester` | GET/PUT | Semester configuration |
| `/api/student-login` | POST/DELETE | Student credential management |

---

## 🌐 Deployment

### LAN Deployment (Recommended for Colleges)

1. **Host Machine Setup**
   - Assign a static IP (e.g., `192.168.1.45`)
   - Install Node.js, PostgreSQL, and npm

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   npm install -g serve
   serve -s build -l 3000 --listen 0.0.0.0
   ```

3. **Run Backend**
   ```bash
   cd backend
   npm start
   ```

4. **Firewall Configuration**
   - Open ports `3000` (frontend) and `5000` (backend)

5. **Access**
   - Local: `http://localhost:3000`
   - LAN: `http://192.168.1.45:3000`

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=feedback_system
DB_PASSWORD=strong_production_password
DB_PORT=5432
JWT_SECRET=complex_random_string_for_production
```

**Frontend:**
```env
REACT_APP_API_BASE=http://192.168.1.45:5000
```

---

## 📁 Project Structure

```
Feedback-Form/
├── 📂 backend/
│   ├── 📄 index.js              # Express server entry point
│   ├── 📄 package.json          # Backend dependencies
│   └── 📂 src/
│       ├── 📂 config/
│       │   └── db.js            # PostgreSQL connection
│       ├── 📂 controllers/      # Business logic (15 controllers)
│       ├── 📂 middleware/
│       │   └── authMiddleware.js  # JWT authentication
│       ├── 📂 routes/           # API route definitions
│       └── 📂 templates/        # PDF/Report templates
├── 📂 frontend/
│   ├── 📄 package.json          # Frontend dependencies
│   └── 📂 src/
│       ├── 📄 App.js            # Main React component
│       ├── 📂 components/       # Reusable components
│       ├── 📂 pages/            # Page components (13 pages)
│       ├── 📂 style/            # CSS stylesheets
│       └── 📂 assets/           # Images and static files
├── 📂 database/
│   └── backup.dump              # PostgreSQL database backup
└── 📄 README.md                 # Documentation
```

---

## 🔒 Security Features

- **JWT Authentication** — Stateless, secure token-based auth
- **One-Time Student Credentials** — Prevents duplicate submissions
- **Role-Based Access Control** — Separate permissions for HOD/Teacher/Student
- **Protected Routes** — Frontend route guards for authenticated pages
- **SQL Injection Prevention** — Parameterized queries with `pg`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## � Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/DurveshN">
        <img src="https://github.com/DurveshN.png" width="100px;" alt="Durvesh N."/><br />
        <sub><b>Durvesh N.</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/SaniyaJadhav20">
        <img src="https://github.com/SaniyaJadhav20.png" width="100px;" alt="Saniya Jadhav"/><br />
        <sub><b>Saniya Jadhav</b></sub>
      </a>
    </td>
  </tr>
</table>

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

**Contact:** For issues or questions, please [open an issue](https://github.com/DurveshN/Feedback-Form/issues) or email durveshnarkhede5769@gmail.com

</div>
