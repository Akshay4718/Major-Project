import express from 'express';

// router after /company/
const router = express.Router();

import authenticateToken from '../middleware/auth.middleware.js';


import { AddCompany, UpdateCompany, CompanyDetail, AllCompanyDetail, DeleteCompany } from '../controllers/Company/company.all-company.controller.js';



router.get('/company-detail', authenticateToken(), AllCompanyDetail);
// router.get('/company-detail/:companyId', authenticateToken(), CompanyDetail);

// company details 
router.post('/add-company', authenticateToken(), AddCompany);

router.post('/update-company', authenticateToken(), UpdateCompany);

router.post('/delete-company', authenticateToken(), DeleteCompany);

router.get('/company-data', CompanyDetail);





export default router;