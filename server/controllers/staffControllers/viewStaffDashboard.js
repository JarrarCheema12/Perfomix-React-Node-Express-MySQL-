import db from '../../config/db.js';
import moment from 'moment';
import jwt from 'jsonwebtoken';

export const viewStaffDashboard = async (req, res) => {
    try {
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

        // Check if the user is an active staff member
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
            return res.status(400).send({
                success: false,
                message: "Requested User data not found. Only Staff can access the Staff's Dashboard"
            });
        }

        // 1. Get Rank of the Staff
        const rankQuery = `
            SELECT employee_id, SUM(marks_obtained) AS total_marks,
                   RANK() OVER (ORDER BY SUM(marks_obtained) DESC) AS rank_position
            FROM evaluations
            GROUP BY employee_id
        `;

        const rankResults = await new Promise((resolve, reject) => {
            db.query(rankQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Find the requested user's rank
        const userRank = rankResults.find(row => row.employee_id == user_id);

        // 2. Get Current Month's Performance
        const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
        const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");

        const performanceQuery = `
            SELECT p.parameter_name, 
                   e.parameter_id,
                   SUM(e.marks_obtained) AS total_marks, 
                   COUNT(e.evaluation_id) AS total_evaluations
            FROM evaluations e
            JOIN performance_parameters p ON e.parameter_id = p.parameter_id
            WHERE e.employee_id = ? 
              AND e.evaluated_on BETWEEN ? AND ?
            GROUP BY e.parameter_id, p.parameter_name
        `;

        const performanceResults = await new Promise((resolve, reject) => {
            db.query(performanceQuery, [user_id, currentMonthStart, currentMonthEnd], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // 3. Get Weightage for Each Parameter from metric_parameters
        const parameterIds = performanceResults.map(row => row.parameter_id);
        let weightageData = [];

        if (parameterIds.length > 0) {
            const weightageQuery = `
                SELECT parameter_id, weightage 
                FROM metric_parameters 
                WHERE parameter_id IN (?)
            `;

            weightageData = await new Promise((resolve, reject) => {
                db.query(weightageQuery, [parameterIds], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        }

        // Create a mapping of parameter_id to weightage
        const weightageMap = {};
        weightageData.forEach(item => {
            weightageMap[item.parameter_id] = item.weightage;
        });

        // Calculate percentage using weightage instead of default 100
        const formattedPerformance = performanceResults.map(row => ({
            parameter_name: row.parameter_name,
            total_marks: row.total_marks,
            total_evaluations: row.total_evaluations,
            percentage: weightageMap[row.parameter_id] 
                ? (row.total_marks / (row.total_evaluations * weightageMap[row.parameter_id])) * 100
                : "N/A"  // If no weightage is found, return "N/A"
        }));

        // Formatting response
        res.status(200).json({
            rank: userRank ? userRank.rank_position : "N/A",
            currentMonthPerformance: formattedPerformance
        });

    } catch (error) {
        console.error("Error fetching staff dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
