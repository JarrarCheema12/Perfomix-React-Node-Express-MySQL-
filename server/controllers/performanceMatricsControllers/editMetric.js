import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const editPerformanceMetric = async (req, res) => {
    try {
        const { metric_id } = req.params;
        const { metric_name, metric_description } = req.body;
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

        // Check if user is Admin
        const checkUserIsAdmin = `
            SELECT * FROM users WHERE user_id = ? AND (created_by IS NULL OR created_by = 0);
        `;

        const isAdmin = await new Promise((resolve, reject) => {
            db.query(checkUserIsAdmin, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!isAdmin) {
            return res.status(403).send({
                success: false,
                message: "Only Admin can edit a Performance Metric",
            });
        }

        // Check if the metric exists
        const checkMetricExist = `
            SELECT * FROM performance_metrics WHERE metric_id = ? AND created_by = ?;
        `;

        const metric = await new Promise((resolve, reject) => {
            db.query(checkMetricExist, [metric_id, userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!metric) {
            return res.status(404).send({
                success: false,
                message: "Performance Metric made by you not found",
            });
        }

        // Check if there is anything to update
        if (!metric_name && !metric_description) {
            return res.status(400).send({
                success: false,
                message: "Please provide at least one field (metric_name or metric_description) to update",
            });
        }

        // If updating the metric_name, check for uniqueness
        if (metric_name) {
            const checkDuplicateName = `
                SELECT * FROM performance_metrics WHERE metric_name = ? AND metric_id != ?;
            `;

            const duplicateMetric = await new Promise((resolve, reject) => {
                db.query(checkDuplicateName, [metric_name, metric_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (duplicateMetric) {
                return res.status(400).send({
                    success: false,
                    message: "Performance Metric with this name already exists",
                });
            }
        }

        // Construct the update query dynamically
        let updateFields = [];
        let values = [];

        if (metric_name) {
            updateFields.push("metric_name = ?");
            values.push(metric_name);
        }

        if (metric_description) {
            updateFields.push("description = ?");
            values.push(metric_description);
        }

        values.push(metric_id);

        const updateQuery = `
            UPDATE performance_metrics 
            SET ${updateFields.join(", ")}
            WHERE metric_id = ?;
        `;

        const updateResult = await new Promise((resolve, reject) => {
            db.query(updateQuery, values, (err, results) => {
                if (err) reject(err);
                else resolve(results.affectedRows);
            });
        });

        if (updateResult > 0) {
            return res.status(200).send({
                success: true,
                message: "Performance Metric updated successfully",
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "No changes made to the Performance Metric",
            });
        }
    } catch (error) {
        console.error("Error while updating performance metric: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
