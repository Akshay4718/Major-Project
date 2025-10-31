import express from 'express';

// router after /student/
const router = express.Router();

// import multer for student resume upadate 
import upload from '../config/Multer.js';
import authenticateToken from '../middleware/auth.middleware.js';

// student sign controller
import Signup from '../controllers/Student/signup.controller.js';
// student login controller
import Login from '../controllers/Student/login.controller.js';
import UploadResume from '../controllers/Student/resume.controller.js';
import { UploadOfferLetter, DeleteOfferLetter } from '../controllers/Student/offer-letter.controller.js';
import { AppliedToJob, CheckAlreadyApplied } from '../controllers/Student/apply-job.controller.js';
import { UpdateJobStatus } from '../controllers/Student/update-job-status.controller.js';
import { GetInternships, UpdateInternship, DeleteInternship } from '../controllers/Student/internship.controller.js';
import { StudentDataYearBranchWise, NotifyStudentStatus } from '../controllers/Student/student-data-for-admin.controller.js';
import GetPlacementStatus from '../controllers/Student/placement-status.controller.js';

// signup post request for student
router.post('/signup', Signup);

// login post request for student
router.post('/login', Login);


// Route to upload resume
router.post('/upload-resume', upload.single('resume'), UploadResume);

// Route to upload offer letter
router.post('/upload-offer-letter', upload.single('offerLetter'), UploadOfferLetter);
// Route to delete offer letter
router.post('/delete-offer-letter/:jobId/:studentId', authenticateToken(), DeleteOfferLetter);

// apply to job
router.put('/job/:jobId/:studentId', AppliedToJob);

// check applied or not to job
router.get('/check-applied/:jobId/:studentId', CheckAlreadyApplied);

// update job status
router.post('/update-status/:jobId/:studentId', UpdateJobStatus);

// get all internship of a student
router.get('/internship', authenticateToken(), GetInternships);
// update internship of a student
router.post('/update-internship', authenticateToken(), UpdateInternship);
// delete internship of a student
router.post('/delete-internship', authenticateToken(), DeleteInternship);

// get placement status (ladder policy)
router.get('/placement-status', authenticateToken(), GetPlacementStatus);


// for tpo and management only
// student arrays
router.get('/all-students-data-year-and-branch', authenticateToken(), StudentDataYearBranchWise)
// student who is on interview or hired
router.get('/notify-interview-hired', authenticateToken(), NotifyStudentStatus)

export default router;