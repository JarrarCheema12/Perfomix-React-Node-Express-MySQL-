import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const deletePerformanceParameter = async (req, res) => {
    try {
        const { id } = req.params; // Parameter ID from URL params

        let token = req.header("Authorization");

        // Validate inputs
        if (!id) {
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

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Parameter ID is required",
            });
        }

        // Check if the performance parameter exists
        const checkParameterQuery = `SELECT * FROM performance_parameters WHERE parameter_id = ? AND created_by = ?;`;
        const parameterExists = await new Promise((resolve, reject) => {
            db.query(checkParameterQuery, [id, userId], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0);
            });
        });

        if (!parameterExists) {
            return res.status(404).json({
                success: false,
                message: "No Performance Parameter made by you found with the given ID",
            });
        }

        // Use a transaction to ensure consistency
        db.beginTransaction(async (err) => {
            if (err) {
                console.error("Transaction Error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database transaction error",
                });
            }

            try {
                // Delete from metric_parameters (since it references parameter_id)
                const deleteMetricParamsQuery = `DELETE FROM metric_parameters WHERE parameter_id = ?;`;
                await new Promise((resolve, reject) => {
                    db.query(deleteMetricParamsQuery, [id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results.affectedRows);
                    });
                });

                // Delete from performance_parameters
                const deleteParameterQuery = `DELETE FROM performance_parameters WHERE parameter_id = ?;`;
                await new Promise((resolve, reject) => {
                    db.query(deleteParameterQuery, [id], (err, results) => {
                        if (err) reject(err);
                        else resolve(results.affectedRows);
                    });
                });

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        console.error("Commit Error:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Error committing transaction",
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Performance parameter deleted successfully",
                    });
                });
            } catch (error) {
                db.rollback(() => {
                    console.error("Rollback Error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error",
                        error: error.message,
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error while deleting performance parameter:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
