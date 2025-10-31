import express from 'express';
import { createMeeting, getAllMeetings, deleteMeeting } from '../controllers/TPO/meeting.controller.js';
import { getUpcomingMeetings, getMeetingDetails } from '../controllers/Student/meeting.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware());

// TPO routes
router.post('/create', createMeeting);
router.get('/tpo/all', getAllMeetings);
router.delete('/tpo/:id', deleteMeeting);

// Student routes
router.get('/student/upcoming', getUpcomingMeetings);
router.get('/student/:id', getMeetingDetails);

export default router;
