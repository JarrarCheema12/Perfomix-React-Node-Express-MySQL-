import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getSingleLineManager = async (req, res) => {
    try {

        // Extract Line Manager ID from request parameters
        const { lineManagerId } = req.params;

        // Check if the Authorization header exists
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        if (!lineManagerId) {
            return res.status(400).send({
                success: false,
                message: "Line Manager ID is required"
            });
        }

        // Check if the user is an Admin with a selected organization
        const checkIfUserIsAdmin = `
            SELECT selected_organization_id FROM users 
            WHERE user_id = ? AND (created_by IS NULL OR created_by = 0) AND selected_organization_id IS NOT NULL;
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfUserIsAdmin, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!admin) {
            return res.status(400).send({
                success: false,
                message: "Only an Admin with a selected Organization can view Line Manager details"
            });
        }

        const organizationId = admin.selected_organization_id;

        // Get details of the specific Line Manager
        const getLineManager = `
            SELECT 
                u.user_id, 
                u.user_name,
                u.full_name, 
                u.designation,
                d.dept_id,
                d.department_id, 
                d.department_name 
            FROM users u 
            JOIN user_departments ud ON u.user_id = ud.user_id 
            JOIN departments d ON ud.department_id = d.dept_id 
            WHERE u.user_id = ? AND u.role_id = 2 AND d.organization_id = ? AND u.is_active = 1 AND d.is_active = 1;
        `;

        const lineManager = await new Promise((resolve, reject) => {
            db.query(getLineManager, [lineManagerId, organizationId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!lineManager) {
            return res.status(404).send({
                success: false,
                message: "Line Manager not found"
            });
        }

        // Fetch Performance Status for the Line Manager
        const getPerformanceQuery = `
            SELECT
                pm.metric_name, 
                pp.parameter_name, 
                mp.weightage, 
                le.marks_obtained 
            FROM line_manager_evaluations le
            JOIN performance_metrics pm ON le.metric_id = pm.metric_id
            JOIN performance_parameters pp ON le.parameter_id = pp.parameter_id
            JOIN metric_parameters mp ON le.metric_id = mp.metric_id AND le.parameter_id = mp.parameter_id
            WHERE le.line_manager_id = ?;
        `;

        const performanceData = await new Promise((resolve, reject) => {
            db.query(getPerformanceQuery, [lineManagerId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        return res.status(200).send({
            success: true,
            message: "Line Manager details fetched successfully",
            Line_Manager: {
                user_id: lineManager.user_id,
                user_name: lineManager.user_name,
                full_name: lineManager.full_name,
                designation: lineManager.designation,
                dept_id: lineManager.dept_id,
                department_id: lineManager.department_id,
                department: lineManager.department_name,
                performance_status: performanceData.length ? performanceData : "No evaluations available"
            }
        });

    } catch (error) {
        console.log("Error while fetching Line Manager: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
