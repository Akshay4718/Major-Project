import express from 'express';

// router after /management/
const router = express.Router();

import authenticateToken from '../middleware/auth.middleware.js';


// management login controller
import Login from '../controllers/Management/login.controller.js';
// management UsersTPO controller
import UsersTPO from '../controllers/Management/tpo-users.controller.js';
// management DeleteTPO controller
import DeleteTPO from '../controllers/Management/delete-tpo.controller.js';
// management AddTPO controller
import { AddTPO, AddManagement, AddStudent } from '../controllers/Management/add-user.controller.js';
// all notice related here
import { SendNotice, GetAllNotice, DeleteNotice, GetNotice } from '../controllers/Management/notice.controller.js';



router.post('/login', Login);

router.get('/tpo-users', authenticateToken(), UsersTPO);

router.post('/deletetpo', authenticateToken(), DeleteTPO);

// add management, tpo and student
router.post('/addtpo', authenticateToken(), AddTPO);
router.post('/add-management', authenticateToken(), AddManagement);
router.post('/add-student', authenticateToken(), AddStudent);

// notices all route here 
router.post('/send-notice', authenticateToken(), SendNotice);

router.get('/get-all-notices', authenticateToken(), GetAllNotice);

router.get('/get-notice', authenticateToken(), GetNotice);

router.post('/delete-notice', authenticateToken(), DeleteNotice);


export default router;