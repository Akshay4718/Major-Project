import express from 'express';

// router after /user/
const router = express.Router();

// import multer for user profile update 
import upload from '../config/Multer.js';
import authenticateToken from '../middleware/auth.middleware.js';

// users controller methods
import UserDetail from '../controllers/user/user.detail.controller.js';
import AllUsersLen from '../controllers/user/user.all-users.controller.js';
import UpdatePhoto from '../controllers/user/user.update-photo.controller.js';
import UpdateProfile from '../controllers/user/user.update-profile.controller.js';
import UpdatePassword from '../controllers/user/user.update-password.js';
import UserData from '../controllers/user/user.show-data.js';

// details of users student
router.get('/detail', authenticateToken(), UserDetail);

// all user in lenght 
router.get('/all-users', authenticateToken(), AllUsersLen);

router.get('/:userId', authenticateToken(), UserData);

router.post('/upload-photo', upload.single('profileImgs'), UpdatePhoto);

router.post('/update-profile', authenticateToken(), UpdateProfile);

router.post('/change-password', authenticateToken(), UpdatePassword);


export default router;