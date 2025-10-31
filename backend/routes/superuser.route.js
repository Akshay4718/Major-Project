import express from 'express';

// router after /admin/
const router = express.Router();

import authenticateToken from '../middleware/auth.middleware.js';

import Login from '../controllers/SuperUser/login.controller.js';

// management methods
import { managementUsers, managementAddUsers, managementDeleteUsers } from '../controllers/SuperUser/user-management.controller.js';
// tpo methods
import { tpoUsers, tpoAddUsers, tpoDeleteUsers } from '../controllers/SuperUser/user-tpo.controller.js';
// student methods
import { studentUsers, studentAddUsers, studentDeleteUsers, studentApprove } from '../controllers/SuperUser/user-student.controller.js';



router.post('/login', Login);

// management routes
router.get('/management-users', authenticateToken(), managementUsers);
router.post('/management-add-user', authenticateToken(), managementAddUsers);
router.post('/management-delete-user', authenticateToken(), managementDeleteUsers);

// tpo routes
router.get('/tpo-users', authenticateToken(), tpoUsers);
router.post('/tpo-add-user', authenticateToken(), tpoAddUsers);
router.post('/tpo-delete-user', authenticateToken(), tpoDeleteUsers);

// student routes
router.get('/student-users', authenticateToken(), studentUsers);
router.post('/student-add-user', authenticateToken(), studentAddUsers);
router.post('/student-delete-user', authenticateToken(), studentDeleteUsers);
// approve student
router.post('/student-approve', authenticateToken(), studentApprove);


export default router;