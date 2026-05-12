import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const updateGoalStatus = async (req, res) => {
    try {
        const { goal_id } = req.params;

        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({
                success: false,
                message: "Authorization token is required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        if (!user_id) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        const checkIfStaff = `SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 3;`;
        const user = await new Promise((resolve, reject) => {
            db.query(checkIfStaff, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!user.length) {
            return res.status(403).send({
                success: false,
                message: "Only staff members can update goal status."
            });
        }

        if (!goal_id) {
            return res.status(400).send({
                success: false,
                message: "Goal Id required in the params"
            });
        }

        // Fetch current goal status
        const getStatusQuery = `SELECT goal_status FROM goals WHERE goal_id = ? AND created_by = ?;`;
        const goal = await new Promise((resolve, reject) => {
            db.query(getStatusQuery, [goal_id, user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!goal.length) {
            return res.status(404).send({
                success: false,
                message: "Goal not found or you are not the creator of this goal."
            });
        }

        const currentStatus = goal[0].goal_status;
        let newStatus;

        if (currentStatus === 'Pending') {
            newStatus = 'In Progress';
        } else if (currentStatus === 'In Progress') {
            newStatus = 'Completed';
        } else {
            return res.status(400).send({
                success: false,
                message: "Goal is already completed and cannot be updated."
            });
        }

        const updateStatusQuery = `UPDATE goals SET goal_status = ? WHERE goal_id = ? AND created_by = ?;`;
        await new Promise((resolve, reject) => {
            db.query(updateStatusQuery, [newStatus, goal_id, user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        return res.status(200).send({
            success: true,
            message: `Goal status updated to '${newStatus}' successfully.`
        });
    } catch (error) {
        console.error("Error while updating goal status", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
