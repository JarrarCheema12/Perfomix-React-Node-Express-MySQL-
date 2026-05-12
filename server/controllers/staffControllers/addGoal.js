import db from '../../config/db.js';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';

export const addGoal = async (req, res) => {
    try {
        const { task_name, completion_date, description, milestones } = req.body;

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
                message: "Only staff members can add goals."
            });
        }

        if (!task_name || !completion_date || !description || !milestones) {
            return res.status(400).send({
                success: false,
                message: "All fields are required [task_name, completion_date, description, milestones]"
            });
        }

        // Ensure the 'goals' table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS goals (
                goal_id INT PRIMARY KEY AUTO_INCREMENT,
                task_name VARCHAR(50),
                completion_date VARCHAR(100),
                task_description VARCHAR(255),
                milestones TEXT,
                attachement VARCHAR(255),
                goal_status VARCHAR(50) DEFAULT 'Pending',
                created_by INT,
                created_on DATETIME DEFAULT NOW(),
                CONSTRAINT fk_goal_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `;

        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });


        const checkGoalAlreadyExist = `
            SELECT * FROM goals WHERE task_name = ? AND created_by = ?;
        `;

        const goal = await new Promise((resolve , reject) => {
            db.query(checkGoalAlreadyExist, [task_name, user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        console.log("GOAL: ", goal);
        

        if(goal.length > 0){
            return res.status(400).send({
                success: false,
                message: "Goal with the given Task Name already exist"
            });
        }

        // Convert completion_date to Pakistan Time (PKT)
        const completionDatePKT = moment.tz(completion_date, "Asia/Karachi").format("YYYY-MM-DD HH:mm:ss");

        // Get the current date-time in PKT for created_on
        const createdOnPKT = moment().tz("Asia/Karachi").format("YYYY-MM-DD HH:mm:ss");

        const milestonesJSON = JSON.stringify(milestones);

        const insertGoalQuery = `
            INSERT INTO goals (task_name, completion_date, task_description, milestones, goal_status, created_by, created_on)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(insertGoalQuery, [task_name, completionDatePKT, description, milestonesJSON, 'Pending', user_id, createdOnPKT], (err, results) => {
                if (err) reject(err);
                else resolve(results.affectedRows);
            });
        });

        if (result !== 1) {
            return res.status(400).send({
                success: false,
                message: "Failed to add goal"
            });
        }

        return res.status(201).send({
            success: true,
            message: "Goal added successfully"
        });

    } catch (error) {
        console.error("Error while adding goal:", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
