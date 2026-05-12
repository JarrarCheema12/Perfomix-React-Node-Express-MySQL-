import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { addEmployeeRecommendation } from '../controllers/recommendationControllers/addRecommendation.js';
import { getRecommendations } from '../controllers/recommendationControllers/getRecommendations.js';

const router = express.Router();

router.post('/add-recommendation', verifyToken, addEmployeeRecommendation);

router.get('/get-recommendations', verifyToken, getRecommendations);

export default router;