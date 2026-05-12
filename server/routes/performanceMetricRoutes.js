import express from 'express';
import { verifyToken } from './../middlewares/authorization.js';
import { createPerformanceMetrics } from '../controllers/performanceMatricsControllers/createPerformanceMetric.js';
import { assignMetric } from '../controllers/performanceMatricsControllers/assignMetric.js';
import { getAllMetrics } from '../controllers/performanceMatricsControllers/getAllMetrics.js';
import { editPerformanceMetric } from '../controllers/performanceMatricsControllers/editMetric.js';
import { deletePerformanceMetric } from '../controllers/performanceMatricsControllers/deleteMetric.js';

const router = express.Router();

router.post('/create-metric', verifyToken, createPerformanceMetrics);

router.put('/update-metric/:metric_id', verifyToken, editPerformanceMetric);

router.delete('/delete-metric/:metric_id', verifyToken, deletePerformanceMetric);

router.post('/assign-metric', verifyToken, assignMetric);

router.get('/get-metrics', verifyToken, getAllMetrics);

export default router;