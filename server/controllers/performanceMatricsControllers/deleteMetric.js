import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const deletePerformanceMetric = async (req, res) => {
    try {
        const { metric_id } = req.params;
        let token = req.header("Authorization");

        // Validate input
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
                message: "Only Admin can delete a Performance Metric",
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
                message: "Performance Metric not found",
            });
        }

        // Delete the metric along with related performance parameters and metric assignments
        const deleteMetricQuery = `
            DELETE mp, ma, pm
            FROM performance_metrics pm
            LEFT JOIN metric_parameters mp ON pm.metric_id = mp.metric_id
            LEFT JOIN metric_assignments ma ON pm.metric_id = ma.metric_id
            WHERE pm.metric_id = ?;
        `;

        const deleteResult = await new Promise((resolve, reject) => {
            db.query(deleteMetricQuery, [metric_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.affectedRows);
            });
        });

        if (deleteResult > 0) {
            return res.status(200).send({
                success: true,
                message: "Performance Metric and related records deleted successfully",
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Failed to delete Performance Metric",
            });
        }
    } catch (error) {
        console.error("Error while deleting performance metric: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
