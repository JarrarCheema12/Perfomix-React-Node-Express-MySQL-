import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const updatePerformanceParameter = async (req, res) => {
    try {
        const { parameter_id } = req.params;
        const { parameter_name, parameter_description, weightage } = req.body;
        let token = req.header("Authorization");

        if (!parameter_id) {
            return res.status(400).send({
                success: false,
                message: "Parameter ID is required in params"
            });
        }

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

        // Check if user is Admin or the creator of the parameter
        const checkUserQuery = `
            SELECT pp.created_by
            FROM performance_parameters pp
            LEFT JOIN users u ON pp.created_by = u.user_id
            WHERE pp.parameter_id = ?;
        `;

        const parameterData = await new Promise((resolve, reject) => {
            db.query(checkUserQuery, [parameter_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!parameterData) {
            return res.status(404).send({
                success: false,
                message: "Performance parameter not found"
            });
        }

        if (parameterData.created_by !== userId) {
            return res.status(403).send({
                success: false,
                message: "Only the creator or admin can update this parameter"
            });
        }

        // Dynamically build the update query based on the provided fields
        const updates = [];
        const values = [];

        if (parameter_name) {
            updates.push("parameter_name = ?");
            values.push(parameter_name);
        }
        if (parameter_description) {
            updates.push("description = ?");
            values.push(parameter_description);
        }
        if (weightage) {
            updates.push("weightage = ?");
            values.push(weightage);
        }

        if (updates.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No fields provided for update"
            });
        }

        values.push(parameter_id);
        const updateQuery = `
            UPDATE performance_parameters SET ${updates.join(", ")} WHERE parameter_id = ?;
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
                message: "Performance parameter updated successfully"
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "No changes were made"
            });
        }
    } catch (error) {
        console.error("Error while updating performance parameter: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
