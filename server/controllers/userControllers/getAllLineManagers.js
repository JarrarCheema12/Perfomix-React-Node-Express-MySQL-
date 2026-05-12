import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getAllLineManagers = async (req, res) => {
    try {
        const { organization_id } = req.params;

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

        // Get all Line Managers with their departments
        const getLineManagersQuery = `
            SELECT 
                u.user_id, 
                u.user_name,
                u.full_name, 
                u.designation,
                GROUP_CONCAT(DISTINCT d.dept_id) AS dept_ids,
                GROUP_CONCAT(DISTINCT d.department_id) AS department_ids,
                GROUP_CONCAT(DISTINCT d.department_name) AS department_names
            FROM users u 
            LEFT JOIN user_departments ud ON u.user_id = ud.user_id 
            LEFT JOIN departments d ON ud.department_id = d.dept_id 
            WHERE u.role_id = 2 AND d.organization_id = ? AND u.is_active = 1 AND d.is_active = 1
            GROUP BY u.user_id, u.user_name, u.full_name, u.designation;
        `;

        const lineManagers = await new Promise((resolve, reject) => {
            db.query(getLineManagersQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!lineManagers.length) {
            return res.status(400).send({
                success: false,
                message: "No Line Managers found for the selected organization"
            });
        }

        // Fetch Metrics and Parameters for each Line Manager
        const lineManagersWithDetails = await Promise.all(lineManagers.map(async (lm) => {
            const deptIds = lm.dept_ids ? lm.dept_ids.split(',').map(id => parseInt(id)) : [];

            if (deptIds.length === 0) {
                return {
                    user_id: lm.user_id,
                    user_name: lm.user_name,
                    full_name: lm.full_name,
                    designation: lm.designation,
                    dept_ids: [],
                    department_ids: [],
                    departments: [],
                    metrics: []
                };
            }

            // Get all Metrics assigned to these departments
            const getMetricsQuery = `
                SELECT DISTINCT 
                    m.metric_id, 
                    m.metric_name 
                FROM metric_assignments ma
                JOIN performance_metrics m ON ma.metric_id = m.metric_id
                WHERE ma.department_id IN (?);
            `;

            const metrics = await new Promise((resolve, reject) => {
                db.query(getMetricsQuery, [deptIds], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Fetch Parameters for each Metric
            const metricsWithParameters = await Promise.all(metrics.map(async (metric) => {
                const getParametersQuery = `
                    SELECT 
                        p.parameter_id, 
                        p.parameter_name, 
                        mp.weightage 
                    FROM metric_parameters mp
                    JOIN performance_parameters p ON mp.parameter_id = p.parameter_id
                    WHERE mp.metric_id = ?;
                `;

                const parameters = await new Promise((resolve, reject) => {
                    db.query(getParametersQuery, [metric.metric_id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                return {
                    metric_id: metric.metric_id,
                    metric_name: metric.metric_name,
                    parameters: parameters
                };
            }));

            return {
                user_id: lm.user_id,
                user_name: lm.user_name,
                full_name: lm.full_name,
                designation: lm.designation,
                dept_ids: deptIds,
                department_ids: lm.department_ids ? lm.department_ids.split(',') : [],
                departments: lm.department_names ? lm.department_names.split(',') : [],
                metrics: metricsWithParameters
            };
        }));

        return res.status(200).send({
            success: true,
            message: "Line Managers with metrics and parameters fetched successfully",
            Line_Managers_Count: lineManagersWithDetails.length,
            Line_Managers: lineManagersWithDetails
        });

    } catch (error) {
        console.log("Error while fetching Line Managers: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
