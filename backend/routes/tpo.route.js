import express from 'express';

// router after /tpo/
const router = express.Router();

import authenticateToken from '../middleware/auth.middleware.js';


// tpo login controller
import Login from '../controllers/TPO/tpo.login.controller.js';

import PostJob from '../controllers/TPO/tpo.post-job.controller.js';

import { AllJobs, DeleteJob, JobData, JobWithApplicants, StudentJobsApplied } from '../controllers/user/user.all-jobs.controller.js';

import { notifyEligibleStudents } from '../controllers/TPO/notify-eligible-students.controller.js';

import { getRecentPlacements } from '../controllers/TPO/recent-placements.controller.js';

// login post request for student
router.post('/login', Login);


// post job listing data
router.post('/post-job', authenticateToken(), PostJob);

// all jobs 
router.get('/jobs', authenticateToken(), AllJobs);

// delete job 
router.post('/delete-job', authenticateToken(), DeleteJob);

// view a job 
router.get('/job/:jobId', authenticateToken(), JobData);

// job with its applicants 
router.get('/job/applicants/:jobId', authenticateToken(), JobWithApplicants)

// student jobs applied 
router.get('/myjob/:studentId', authenticateToken(), StudentJobsApplied)

// notify eligible students about job posting
router.post('/notify-eligible/:jobId', authenticateToken(), notifyEligibleStudents)

// get recent placements (last 24 hours)
router.get('/recent-placements', authenticateToken(), getRecentPlacements)


export default router;