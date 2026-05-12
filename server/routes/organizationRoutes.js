import express from "express";
import { createOrganization } from "../controllers/organizationControllers/createOrganization.js";
import { verifyToken } from "../middlewares/authorization.js";
import { updateOrganization } from "../controllers/organizationControllers/updateOrganization.js";
import { getSingleOrganization } from "../controllers/organizationControllers/getSingleOrganization.js";
import { getAllOrganizations } from "../controllers/organizationControllers/getAllOrganizations.js";
import { deleteOrganization } from "../controllers/organizationControllers/deleteOrganization.js";
import { selectOrganization } from "../controllers/organizationControllers/selectOrganization.js";

const router = express.Router();

router.post('/create-organization', verifyToken, createOrganization);

router.put('/update-organization/:id', verifyToken, updateOrganization);

router.get('/get-organization/:id', verifyToken, getSingleOrganization);

router.get('/get-organizations', verifyToken, getAllOrganizations);

router.delete('/delete-organization/:id', verifyToken, deleteOrganization);

router.put('/select-organization', verifyToken, selectOrganization);

export default router;