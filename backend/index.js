import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  'https://major-project-1-iep2.onrender.com',
  'http://localhost:5173',
  'https://major-project-zxq8-gfmuivoz0-akshay4718s-projects.vercel.app',
];

// ✅ CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/authorization headers
}));

// Middleware
app.use(express.json());

// ✅ Static file serving (profile images, resumes, offer letters)
app.use('/profileImgs', express.static(path.join(__dirname, 'public/profileImgs')));
app.use('/resume', express.static(path.join(__dirname, 'public/resumes')));
app.use('/offerLetter', express.static(path.join(__dirname, 'public/offerLetter')));

// ✅ Database connection
import mongodb from './config/MongoDB.js';
mongodb();

// ✅ Routes import
import userRoute from './routes/user.route.js';
import studentRoute from './routes/student.route.js';
import tpoRoute from './routes/tpo.route.js';
import managementRoute from './routes/management.route.js';
import superuserRoute from './routes/superuser.route.js';
import companyRoute from './routes/company.route.js';
import blogRoute from './routes/blog.routes.js';
import roadmapRoute from './routes/roadmap.routes.js';
import meetingRoute from './routes/meeting.routes.js';
import placementWorkflowRoute from './routes/placement-workflow.routes.js';

// ✅ Routes setup
app.use('/user', userRoute);
app.use('/student', studentRoute);
app.use('/tpo', tpoRoute);
app.use('/management', managementRoute);
app.use('/admin', superuserRoute);
app.use('/company', companyRoute);
app.use('/blog', blogRoute);
app.use('/roadmap', roadmapRoute);
app.use('/meeting', meetingRoute);
app.use('/placement-workflow', placementWorkflowRoute);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
