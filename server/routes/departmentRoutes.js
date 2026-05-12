import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { createDepartment } from '../controllers/departmentControllers/createDepartment.js';
import { getDepartment } from '../controllers/departmentControllers/getDepartment.js';
import { updateDepartment } from '../controllers/departmentControllers/updateDepartment.js';
import { getAllDepartments } from '../controllers/departmentControllers/getAllDepartments.js';
import { deleteDepartment } from '../controllers/departmentControllers/deleteDepartment.js';

const router = express.Router();

router.post('/create-department', verifyToken, createDepartment);

router.put('/update-department/:dept_id', verifyToken, updateDepartment);

router.get('/get-department/:dept_id', verifyToken, getDepartment);

router.get('/get-departments/:organization_id', verifyToken, getAllDepartments);

router.delete('/delete-department/:dept_id', verifyToken, deleteDepartment);

export default router;