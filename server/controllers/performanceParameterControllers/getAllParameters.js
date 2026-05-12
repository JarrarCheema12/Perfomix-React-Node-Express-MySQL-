import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getPerformanceParametersByMetric = async (req, res) => {
    try {
        const { metric_id } = req.params; // Metric ID from URL params

        let token = req.header("Authorization");

        // Validate inputs
        if (!metric_id) {
            return res.status(400).send({
                success: false,
                message: "Metric ID is required in params",
            });
        }

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token",
            });
        }

        // Check if the performance metric exists
        const checkMetricQuery = `SELECT * FROM performance_metrics WHERE metric_id = ? AND created_by = ?;`;
        const metricExists = await new Promise((resolve, reject) => {
            db.query(checkMetricQuery, [metric_id, userId], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0);
            });
        });

        if (!metricExists) {
            return res.status(404).json({
                success: false,
                message: "No Performance Metric made by you found with the given ID",
            });
        }

        // Retrieve all parameters linked to the given metric_id
        const getParametersQuery = `
            SELECT 
                pp.parameter_id, 
                pp.parameter_name, 
                pp.description AS parameter_description, 
                mp.weightage 
            FROM metric_parameters mp
            JOIN performance_parameters pp ON mp.parameter_id = pp.parameter_id
            WHERE mp.metric_id = ?;
        `;

        const parameters = await new Promise((resolve, reject) => {
            db.query(getParametersQuery, [metric_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        return res.status(200).json({
            success: true,
            message: "Parameters fetched successfully",
            metric_id: metric_id,
            parameters,
        });

    } catch (error) {
        console.error("Error while fetching performance parameters:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
