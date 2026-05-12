import express from "express";
import { verifyToken } from "../middlewares/authorization.js";
import { createPerformanceParameter } from "../controllers/performanceParameterControllers/createPerformanceParameter.js";
import { updatePerformanceParameter } from "../controllers/performanceParameterControllers/editPerfomanceParameter.js";
import { getPerformanceParametersByMetric } from "../controllers/performanceParameterControllers/getAllParameters.js";
import { deletePerformanceParameter } from "../controllers/performanceParameterControllers/deleteParameter.js";

const router = express.Router();

router.post('/create-parameter/:id', verifyToken, createPerformanceParameter);

router.put('/edit-parameter/:parameter_id', verifyToken, updatePerformanceParameter);

router.get('/get-all-parameters/:metric_id', verifyToken, getPerformanceParametersByMetric);

router.delete('/delete-parameter/:id', verifyToken, deletePerformanceParameter);

export default router;