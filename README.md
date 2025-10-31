# 🎓 College Placement Management System (CPMS)

<div align="center">

![CPMS Banner](https://img.shields.io/badge/CPMS-College_Placement_System-blue?style=for-the-badge)

**A comprehensive web application for managing campus placements, student profiles, job postings, and recruitment workflows.**

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Placement Policy](#-placement-policy)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **College Placement Management System (CPMS)** is a full-stack web application designed to streamline and automate the campus recruitment process. It provides a centralized platform for students, Training & Placement Officers (TPO), management, and administrators to manage job postings, applications, placement drives, and student profiles efficiently.

### Key Objectives

✅ **Centralized Management** - Single platform for all placement activities  
✅ **Automated Workflows** - Auto-shortlisting based on eligibility criteria  
✅ **Policy Enforcement** - Ladder policy for fair job distribution  
✅ **Real-time Communication** - Email notifications and online meetings  
✅ **Data Analytics** - Comprehensive reports and statistics  
✅ **Document Management** - Resume uploads, offer letters, and more  

---

## ✨ Features

### 👨‍🎓 Student Features

- **Profile Management**
  - Complete profile with academic details (SSLC, PUC, Degree)
  - Semester-wise SGPA tracking
  - Resume upload and management
  - Profile picture upload via Cloudinary
  
- **Job Applications**
  - Browse available job postings
  - Apply to jobs with automatic eligibility check
  - Track application status (Applied → Shortlisted → In-Process → Selected → Placed)
  - View placement history and offers
  
- **Placement Policy**
  - Ladder-based job categories (Mass → Core → Dream → Open Dream)
  - Maximum 2 job offers per student
  - Auto-enforcement of eligibility criteria
  - Exception for internships with conversion options
  
- **Communication**
  - View notices and announcements
  - Join scheduled online meetings
  - Receive email notifications for job updates
  
- **Additional Features**
  - Create and share blog posts
  - Generate personalized career roadmaps using AI
  - View company details and job descriptions

### 👔 TPO (Training & Placement Officer) Features

- **Job Management**
  - Post new job opportunities with detailed criteria
  - Set job categories and eligibility requirements
  - Manage application deadlines
  - Edit and delete job postings
  
- **Applicant Management**
  - View all applicants for each job
  - Update application status through workflow stages
  - Shortlist candidates automatically based on criteria
  - Track interview rounds and results
  - Generate offer letters
  
- **Placement Workflow**
  - Manage placement stages (Open → Shortlisting → Interviewing → Completed)
  - Track multiple interview rounds per candidate
  - Record remarks and feedback
  - Mark students as placed
  
- **Communication**
  - Send notices to students
  - Schedule and host online meetings
  - Email invitations to students
  
- **Reports & Analytics**
  - View placement statistics
  - Export data to Excel
  - Monitor student eligibility

### 🏢 Management Features

- **User Management**
  - Add new users (Students, TPO, Management)
  - Approve student registrations
  - View and manage all user profiles
  - Export user data to Excel
  
- **Company Management**
  - Add and manage company profiles
  - Track company placement history
  - View company details and contacts
  
- **System Oversight**
  - Monitor all placement activities
  - View comprehensive reports
  - Manage system-wide settings

### 🔐 Super Admin Features

- **System Administration**
  - Manage all user roles
  - System-wide configurations
  - Database management
  - Access control and permissions

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router DOM** | Client-side routing |
| **Bootstrap 5** | UI components and styling |
| **Tailwind CSS** | Utility-first CSS framework |
| **Axios** | HTTP client for API requests |
| **React Icons** | Icon library |
| **Jodit React** | Rich text editor for job descriptions |
| **JWT Decode** | Token decoding for authentication |
| **React Loading Skeleton** | Loading placeholders |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication and authorization |
| **Bcrypt** | Password hashing |
| **Nodemailer** | Email notifications |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud storage for images |
| **ExcelJS** | Excel file generation |
| **Google Generative AI** | AI-powered roadmap generation |
| **Nodemon** | Development auto-reload |

### DevOps & Tools

- **Docker** - Containerization
- **Git** - Version control
- **Vercel** - Frontend deployment
- **Environment Variables** - Configuration management

---

## 📁 Project Structure

```
college-placement-management-system/
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js          # Cloudinary configuration
│   │   ├── email.config.js        # Nodemailer setup
│   │   └── MongoDB.js             # Database connection
│   │
│   ├── controllers/
│   │   ├── Student/               # Student-related controllers
│   │   │   ├── apply-job.controller.js
│   │   │   ├── placement-status.controller.js
│   │   │   ├── resume.controller.js
│   │   │   └── ...
│   │   ├── TPO/                   # TPO-related controllers
│   │   │   ├── tpo.post-job.controller.js
│   │   │   ├── manage-applicants.controller.js
│   │   │   └── ...
│   │   ├── Management/            # Management controllers
│   │   └── SuperUser/             # Admin controllers
│   │
│   ├── helpers/
│   │   └── placementPolicy.js     # Placement policy logic
│   │
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT authentication
│   │
│   ├── models/
│   │   ├── user.model.js          # User schema (Students, TPO, etc.)
│   │   ├── job.model.js           # Job postings schema
│   │   ├── company.model.js       # Company details schema
│   │   ├── blog.model.js          # Blog posts schema
│   │   ├── meeting.model.js       # Online meetings schema
│   │   └── notice.model.js        # Notices schema
│   │
│   ├── routes/
│   │   ├── student.route.js       # Student routes
│   │   ├── tpo.route.js           # TPO routes
│   │   ├── management.route.js    # Management routes
│   │   ├── company.route.js       # Company routes
│   │   ├── blog.routes.js         # Blog routes
│   │   ├── meeting.routes.js      # Meeting routes
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── fileUpload.js          # File upload utilities
│   │   └── emailTemplates.js      # Email templates
│   │
│   ├── public/
│   │   ├── profileImgs/           # Profile pictures
│   │   ├── resumes/               # Student resumes
│   │   └── offerLetter/           # Offer letters
│   │
│   ├── .env                       # Environment variables
│   ├── index.js                   # Entry point
│   ├── package.json               # Dependencies
│   └── Dockerfile                 # Docker configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Students/          # Student components
│   │   │   │   ├── JobListings.jsx
│   │   │   │   ├── PlacementProfile.jsx
│   │   │   │   ├── OnlineMeetings.jsx
│   │   │   │   ├── CreateBlog.jsx
│   │   │   │   └── ...
│   │   │   ├── TPO/               # TPO components
│   │   │   │   ├── PostJob.jsx
│   │   │   │   ├── ManageApplicants.jsx
│   │   │   │   ├── OnlineMeetings.jsx
│   │   │   │   └── ...
│   │   │   ├── Management/        # Management components
│   │   │   ├── SuperUser/         # Admin components
│   │   │   ├── LandingPages/      # Public pages
│   │   │   └── shared/            # Shared components
│   │   │
│   │   ├── pages/
│   │   │   ├── Student/
│   │   │   │   ├── Home.jsx
│   │   │   │   └── Login.jsx
│   │   │   ├── TPO/
│   │   │   ├── Management/
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   └── UserContext.jsx    # Global user state
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js         # Authentication hook
│   │   │
│   │   ├── config/
│   │   │   └── backend_url.js     # API base URL
│   │   │
│   │   ├── styles/
│   │   │   └── index.css          # Global styles
│   │   │
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml             # Docker compose configuration
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Cloudinary Account** (for image uploads)
- **Google Generative AI API Key** (for roadmap feature)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Akshay4718/cpms.git
cd college-placement-management-system
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configurations
nano .env
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
# Edit src/config/backend_url.js if needed
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:4518
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## ⚙️ Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=4518
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/placement_db
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=CPMS <your-email@gmail.com>

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Generative AI (for Roadmap feature)
GOOGLE_API_KEY=your_gemini_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

**File:** `frontend/src/config/backend_url.js`

```javascript
export const BASE_URL = 'http://localhost:4518';
```

---

## 📖 Usage

### Default User Accounts

After initial setup, create users with these roles:

| Role | Email | Description |
|------|-------|-------------|
| **Student** | student@college.edu | Regular student account |
| **TPO Admin** | tpo@college.edu | Training & Placement Officer |
| **Management** | management@college.edu | Management administrator |
| **Super Admin** | admin@college.edu | System administrator |

### Student Workflow

1. **Registration & Profile Setup**
   - Register with college email
   - Wait for approval from Management
   - Complete profile with academic details
   - Upload resume

2. **Job Application**
   - Browse available jobs
   - Check eligibility criteria
   - Apply to jobs (policy enforced automatically)
   - Track application status

3. **Placement Process**
   - Receive email notifications
   - Join online meetings
   - Attend interviews
   - Accept offer letters

### TPO Workflow

1. **Job Posting**
   - Add company details
   - Create job posting with criteria
   - Set job category (Mass/Core/Dream/Open Dream)
   - Define eligibility requirements

2. **Applicant Management**
   - Review applications
   - Auto-shortlist based on criteria
   - Manage interview rounds
   - Update candidate status
   - Generate offer letters

3. **Communication**
   - Schedule meetings
   - Send notices
   - Email students

### Management Workflow

1. **User Management**
   - Approve student registrations
   - Add TPO and management users
   - View all user profiles

2. **Oversight**
   - Monitor placements
   - Generate reports
   - Export data to Excel

---

## 🔌 API Documentation

### Base URL

```
http://localhost:4518
```

### Authentication

All protected routes require JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### API Endpoints

#### User Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/user/register` | Register new user | No |
| POST | `/user/login` | User login | No |
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/update` | Update profile | Yes |
| POST | `/user/upload-profile-pic` | Upload profile picture | Yes |

#### Student Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/student/jobs` | Get available jobs | Yes |
| POST | `/student/apply/:jobId/:studentId` | Apply to job | Yes |
| GET | `/student/applications` | Get my applications | Yes |
| POST | `/student/upload-resume` | Upload resume | Yes |
| GET | `/student/placement-status` | Get placement status | Yes |
| POST | `/student/blog/create` | Create blog post | Yes |
| GET | `/student/meetings` | Get upcoming meetings | Yes |
| POST | `/roadmap/generate` | Generate career roadmap | Yes |

#### TPO Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tpo/post-job` | Post new job | Yes |
| GET | `/tpo/jobs` | Get all jobs | Yes |
| PUT | `/tpo/update-job/:id` | Update job | Yes |
| DELETE | `/tpo/delete-job` | Delete job | Yes |
| GET | `/tpo/applicants/:jobId` | Get job applicants | Yes |
| PUT | `/placement-workflow/update-status` | Update applicant status | Yes |
| POST | `/tpo/send-notice` | Send notice | Yes |
| POST | `/meeting/create` | Schedule meeting | Yes |

#### Management Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/management/users` | Get all users | Yes |
| POST | `/management/add-user` | Add new user | Yes |
| PUT | `/management/approve-student/:id` | Approve student | Yes |
| GET | `/management/export-data` | Export to Excel | Yes |

#### Company Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/company/add` | Add company | Yes |
| GET | `/company/all` | Get all companies | Yes |
| GET | `/company/:id` | Get company details | Yes |

---

## 👥 User Roles

### Role-Based Access Control

```
┌─────────────────────────────────────────────────────┐
│                    SUPER ADMIN                      │
│                  (Full System Access)               │
└────────────────┬────────────────────────────────────┘
                 │
     ┌───────────┴───────────┬────────────────────┐
     │                       │                    │
┌────▼────────┐    ┌────────▼──────┐    ┌───────▼─────────┐
│ MANAGEMENT  │    │      TPO      │    │    STUDENT      │
│  - Approve  │    │  - Post Jobs  │    │  - View Jobs    │
│  - Add Users│    │  - Manage     │    │  - Apply        │
│  - Reports  │    │  - Shortlist  │    │  - Track Status │
└─────────────┘    └───────────────┘    └─────────────────┘
```

### Permissions Matrix

| Feature | Student | TPO | Management | Super Admin |
|---------|---------|-----|------------|-------------|
| View Jobs | ✅ | ✅ | ✅ | ✅ |
| Apply to Jobs | ✅ | ❌ | ❌ | ❌ |
| Post Jobs | ❌ | ✅ | ❌ | ✅ |
| Manage Applicants | ❌ | ✅ | ❌ | ✅ |
| Approve Students | ❌ | ❌ | ✅ | ✅ |
| Add Users | ❌ | ❌ | ✅ | ✅ |
| System Config | ❌ | ❌ | ❌ | ✅ |

---

## 📊 Placement Policy

### Job Categories (Ladder System)

```
LEVEL 4: Open Dream  (>20 LPA)
           ↑
LEVEL 3: Dream       (>8 LPA / Top 500 companies)
           ↑
LEVEL 2: Core        (Branch-specific)
           ↑
LEVEL 1: Mass        (Generic hiring)
```

### Policy Rules

1. **Ladder Rule**: Students can only apply to jobs in **higher or equal** categories than their current placement.
   
   ```
   Example:
   - Placed in Mass → Can apply to: Core, Dream, Open Dream
   - Placed in Core → Can apply to: Dream, Open Dream
   - Placed in Dream → Can apply to: Open Dream only
   ```

2. **Maximum Offers**: Students can have a maximum of **2 job offers**.

3. **Exception**: Students with a **Dream internship with conversion option** can apply to Mass/Core as backup.

4. **Auto-Eligibility**: Jobs with eligibility criteria auto-shortlist students who meet requirements.

### Implementation

**File:** `backend/helpers/placementPolicy.js`

```javascript
export const checkPlacementEligibility = async (studentId, targetJobId) => {
  // 1. Check if student has 2 offers (max limit)
  // 2. Check ladder policy (can only go up)
  // 3. Check for internship exception
  // 4. Return eligibility status
}
```

---

## 🖼️ Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Student Dashboard
![Student Dashboard](docs/screenshots/student-dashboard.png)

### Job Listings
![Job Listings](docs/screenshots/job-listings.png)

### TPO - Post Job
![Post Job](docs/screenshots/post-job.png)

### TPO - Manage Applicants
![Manage Applicants](docs/screenshots/manage-applicants.png)

### Placement Workflow
![Placement Workflow](docs/screenshots/placement-workflow.png)

### Online Meetings
![Online Meetings](docs/screenshots/meetings.png)

### AI Roadmap Generator
![Roadmap Generator](docs/screenshots/roadmap.png)

---

## 🎨 Key Features Deep Dive

### 1. Auto-Shortlisting System

Jobs can have eligibility criteria:
- SSLC Percentage (10th)
- PUC Percentage (12th)
- Degree CGPA

When a student applies, the system automatically:
1. Checks if student meets all criteria
2. Sets status to `shortlisted` if eligible
3. Sets status to `applied` if manual review needed

### 2. Placement Workflow Tracking

```
Applied → Shortlisted → In-Process → Selected → Placed
                              ↓
                        Interview Rounds
                        ├─ Round 1 (Aptitude)
                        ├─ Round 2 (Technical)
                        ├─ Round 3 (HR)
                        └─ ...
```

### 3. Email Notifications

Automated emails sent for:
- Job posting confirmation
- Application received
- Shortlisting notification
- Interview schedule
- Offer letter
- Meeting invitations

### 4. AI-Powered Roadmap

Uses Google Gemini AI to generate personalized career roadmaps based on:
- Student's branch
- Current skills
- Career goals
- Industry trends

### 5. Blog System

Students can:
- Create blog posts
- Share experiences
- Read others' blogs
- Rich text editor with formatting

### 6. Online Meetings

TPO can schedule meetings with:
- Auto-email invitations to all students
- Meeting embedded in app (iframe modal)
- 15-minute early join window
- Dark-themed professional interface

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Role-based Access Control** - Fine-grained permissions
- **Input Validation** - Mongoose schema validation
- **CORS Configuration** - Restricted origins
- **File Upload Security** - Type and size validation
- **Environment Variables** - Sensitive data protection

---

## 📈 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile application (React Native)
- [ ] Resume parsing using AI
- [ ] Video interview integration
- [ ] Automated test scheduling
- [ ] Alumni network integration
- [ ] Company ratings and reviews
- [ ] Salary negotiation tracking
- [ ] Multi-language support

---

## 🐛 Known Issues

- Meeting iframe may not work with some platforms (Zoom, Teams) due to security restrictions
- Excel export may have formatting issues with large datasets
- Profile picture upload size limited to 5MB

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
   ```bash
   git fork https://github.com/Akshay4718/cpms.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues

### Code Style Guidelines

- Use ES6+ syntax
- Follow camelCase naming convention
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

---

## 📝 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 Akshay

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 👨‍💻 Author

**Akshay**

- GitHub: [@Akshay4718](https://github.com/Akshay4718)
- Email: akshay@example.com

---

## 🙏 Acknowledgments

- **MongoDB** for the powerful NoSQL database
- **React** team for the amazing frontend library
- **Express.js** for the robust backend framework
- **Bootstrap** & **Tailwind CSS** for beautiful UI components
- **Google Generative AI** for AI capabilities
- **Cloudinary** for reliable image hosting
- All open-source contributors

---

## 📞 Support

For support, email akshay@example.com or create an issue in the repository.

---

## ⭐ Star the Project

If you find this project useful, please consider giving it a star on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/Akshay4718/cpms?style=social)](https://github.com/Akshay4718/cpms/stargazers)

---

<div align="center">

**Made with ❤️ for streamlining campus placements**

[⬆ Back to Top](#-college-placement-management-system-cpms)

</div>
