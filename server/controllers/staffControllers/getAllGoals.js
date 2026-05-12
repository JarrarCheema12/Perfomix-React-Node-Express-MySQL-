import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getAllGoals = async (req, res) => {
    try {
        // Get the token from the header
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({
                success: false,
                message: "Authorization token is required"
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        if (!user_id) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        // Check if the user is an active Staff Member (role_id = 3)
        const checkIfStaff = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 3;
        `;

        const user = await new Promise((resolve, reject) => {
            db.query(checkIfStaff, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!user.length) {
            return res.status(403).send({
                success: false,
                message: "Only staff members can view their goals."
            });
        }

        // Fetch all goals created by the user
        const getGoalsQuery = `
            SELECT goal_id, task_name, completion_date, task_description, 
                   milestones, attachement, goal_status, created_on
            FROM goals 
            WHERE created_by = ?;
        `;

        const goals = await new Promise((resolve, reject) => {
            db.query(getGoalsQuery, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Parse the milestones field from JSON format
        const formattedGoals = goals.map(goal => ({
            ...goal,
            milestones: JSON.parse(goal.milestones) // Convert string to JSON
        }));

        return res.status(200).send({
            success: true,
            message: "Goals retrieved successfully",
            goals: formattedGoals
        });

    } catch (error) {
        console.error("Error while fetching goals:", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
