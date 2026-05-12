import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

export const viewReport = async (req, res) => {
    try {

        const {organization_id} = req.params;
        let token = req.header('Authorization');
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is missing" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }


        if(!organization_id){
            return res.status(400).send({
                success: false,
                message: "Organization Id is required"
            });
        }

        // Step 1: Get all employees with their departments
        const getUsersQuery = `
            SELECT u.user_id, u.user_name, u.full_name, u.phone, u.email, u.role_id, u.designation, u.created_on,
                   d.dept_id, d.department_id, d.department_name
            FROM users u
            JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            WHERE u.role_id != 1 AND d.organization_id = ?;
        `;

        const users = await new Promise((resolve, reject) => {
            db.query(getUsersQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Step 2: Get Performance Score for Each User
        const leaderboard = await Promise.all(users.map(async (user) => {
            let scoreQuery = "";
            let params = [];

            if (user.role_id === 2) {
                // Line Manager Score from line_manager_evaluations
                scoreQuery = `
                    SELECT SUM(marks_obtained) AS total_score
                    FROM line_manager_evaluations
                    WHERE line_manager_id = ? AND metric_id IN (
                        SELECT metric_id FROM metric_assignments WHERE department_id = ?
                    );
                `;
            } else if (user.role_id === 3) {
                // Employee Score from evaluations
                scoreQuery = `
                    SELECT SUM(marks_obtained) AS total_score
                    FROM evaluations
                    WHERE employee_id = ? AND metric_id IN (
                        SELECT metric_id FROM metric_assignments WHERE department_id = ?
                    );
                `;
            }

            params = [user.user_id, user.dept_id];

            const scoreResult = await new Promise((resolve, reject) => {
                db.query(scoreQuery, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]?.total_score || 0);
                });
            });

            return {
                ...user,
                performance_score: scoreResult
            };
        }));

        // Step 3: Sort Leaderboard by Performance Score
        leaderboard.sort((a, b) => b.performance_score - a.performance_score);

        return res.status(200).json({
            success: true,
            message: "Report fetched successfully",
            data: leaderboard
        });

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
