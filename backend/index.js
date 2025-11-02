import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

//
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



//


app.use(express.json());
app.use(cors());

// public folder for users profile
app.use('/profileImgs', express.static(path.join(__dirname, 'public/profileImgs')));
app.use('/resume', express.static(path.join(__dirname, 'public/resumes')));
app.use('/offerLetter', express.static(path.join(__dirname, 'public/offerLetter')));

// database import 
import mongodb from './config/MongoDB.js';
mongodb();

// routes import
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

// routes for user
app.use('/user', userRoute);
// routes for student user
app.use('/student', studentRoute);
// routes for tpo user
app.use('/tpo', tpoRoute);
// routes for management user
app.use('/management', managementRoute);
// routes for admin user
app.use('/admin', superuserRoute);

// route for company
app.use('/company', companyRoute);

// route for blogs
app.use('/blog', blogRoute);

// route for roadmap generation
app.use('/roadmap', roadmapRoute);

// route for meetings
app.use('/meeting', meetingRoute);

// route for placement workflow
app.use('/placement-workflow', placementWorkflowRoute);

app.listen(process.env.PORT, () => {
  console.log(`server is running in http://localhost:${process.env.PORT}`);
});