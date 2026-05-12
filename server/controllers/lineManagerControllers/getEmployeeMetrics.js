import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getEmployeeMetrics = async (req, res) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const lineManagerId = decoded.id;

        if (!lineManagerId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).send({
                success: false,
                message: "User ID is required"
            });
        }

        // CHECK ONLY user_id OF EMPLOYEES IS ACCEPTED
        const isUserEmployee = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 3 AND is_active = 1;
        `;

        const employee = await new Promise((resolve , reject) => {
            db.query(isUserEmployee, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!employee){
            return res.status(400).send({
                success: false,
                message: "Only Staff employee's metrics can be shown"
            });
        }

        // Fetch all metrics assigned to the employee
        const getAssignedMetricsQuery = `
            SELECT DISTINCT ma.metric_id, m.metric_name, ma.department_id
            FROM metric_assignments ma
            JOIN performance_metrics m ON ma.metric_id = m.metric_id
            WHERE ma.department_id IN (
                SELECT department_id FROM user_departments WHERE user_id = ?
            ) AND ma.line_manager_id = ?;
        `;

        const assignedMetrics = await new Promise((resolve, reject) => {
            db.query(getAssignedMetricsQuery, [user_id, lineManagerId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (assignedMetrics.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No assigned metrics found for this user"
            });
        }

        const pendingMetrics = [];

        for (const metric of assignedMetrics) {
            // Fetch all parameters for the metric
            const getParametersQuery = `
                SELECT mp.parameter_id, pp.parameter_name
                FROM metric_parameters mp JOIN performance_parameters pp ON mp.parameter_id = pp.parameter_id
                WHERE mp.metric_id = ?;
            `;

            const parameters = await new Promise((resolve, reject) => {
                db.query(getParametersQuery, [metric.metric_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (!parameters || parameters.length === 0) {
                continue; // Skip this metric if no parameters are found
            }

            // Check which parameters are NOT evaluated for the given user only if parameters exist
            const getEvaluatedParamsQuery = `
                SELECT e.parameter_id
                FROM evaluations e
                WHERE e.employee_id = ? AND e.parameter_id IN (?);
            `;

            const evaluatedParams = parameters.length > 0 ? await new Promise((resolve, reject) => {
                db.query(getEvaluatedParamsQuery, [user_id, parameters.map(p => p.parameter_id)], (err, results) => {
                    if (err) reject(err);
                    else resolve(results.map(r => r.parameter_id));
                });
            }) : [];

            // Filter out evaluated parameters
            const pendingParameters = parameters.filter(p => !evaluatedParams.includes(p.parameter_id));

            if (pendingParameters.length > 0) {
                pendingMetrics.push({
                    metric_id: metric.metric_id,
                    metric_name: metric.metric_name,
                    department_id: metric.department_id,
                    pending_parameters: pendingParameters
                });
            }
        }

        if (pendingMetrics.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No pending metrics found for this user"
            });
        }

        return res.status(200).send({
            success: true,
            message: "Pending metrics fetched successfully",
            pending_metrics: pendingMetrics
        });

    } catch (error) {
        console.log("Error while fetching pending metrics: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
